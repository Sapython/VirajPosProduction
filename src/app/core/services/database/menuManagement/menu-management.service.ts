import { Injectable } from '@angular/core';
import { DataProvider } from '../../provider/data-provider.service';
import {
  getDocs,
  collection,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  arrayUnion,
  DocumentReference,
  deleteDoc,
  Firestore,
  serverTimestamp,
  increment,
  getDoc,
  docData,
  collectionData,
  Timestamp,
} from '@angular/fire/firestore';
import { TableConstructor } from '../../../../types/table.structure';
import { Product } from '../../../../types/product.structure';
import { Menu } from '../../../../types/menu.structure';
import {
  Category,
  RootCategory,
  ViewCategory,
} from '../../../../types/category.structure';
import { Table } from '../../../constructors/table/Table';
import { AnalyticsService } from '../analytics/analytics.service';
import { TableService } from '../table/table.service';
import { BillService } from '../bill/bill.service';
import { PrinterService } from '../../printing/printer/printer.service';
import { AlertsAndNotificationsService } from '../../alerts-and-notification/alerts-and-notifications.service';
import { Subject, debounceTime, first, firstValueFrom } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { dbConfig } from '../../../../app.module';
import { CustomerService } from '../../customer/customer.service';
import { UserManagementService } from '../../auth/user/user-management.service';
import { Combo, ComboType, TimeGroup } from '../../../../types/combo.structure';
import { FileStorageService } from '../fileStorage/file-storage.service';
import { Tax, productTax } from '../../../../types/tax.structure';
import { CodeBaseDiscount } from '../../../../types/discount.structure';
import { LoyaltySetting } from '../../../../types/loyalty.structure';
import { PrinterSetting } from '../../../../types/printing.structure';

@Injectable({
  providedIn: 'root',
})
export class MenuManagementService {
  private menuUpdater: Subject<void> = new Subject();
  versionToBeUpdatedMenus: string[] = [];
  toBeDownloadedMenus:string[] = [];
  updateMenuVersionRequest: Subject<string> = new Subject<string>();

  requestMenuDownload:Subject<string> = new Subject<string>();
  downloadedMenus:Subject<string> = new Subject<string>();
  constructor(
    private dataProvider: DataProvider,
    private firestore: Firestore,
    private analyticsService: AnalyticsService,
    private printingService: PrinterService,
    private tableService: TableService,
    private billService: BillService,
    private alertify: AlertsAndNotificationsService,
    private indexedDbService: NgxIndexedDBService,
    private customerService: CustomerService,
    private userManagementService: UserManagementService,
    private fileStorageService: FileStorageService,
  ) {
    this.checkAndUpdateLocalMenus();
    this.menuUpdater.pipe(debounceTime(1000)).subscribe(() => {
      // console.log('Menus to update', menus);
      this.versionToBeUpdatedMenus.forEach((menuId) => {
        if (this.dataProvider.currentBusiness.businessId){
          this.updateMenuData(menuId);
        }
      });
      this.versionToBeUpdatedMenus = [];
    });
    // firstValueFrom(this.dataProvider.menuLoadSubject).then((res) => {
    //   collectionData(
    //     collection(
    //       this.firestore,
    //       '/business/' +
    //         this.dataProvider.currentBusiness.businessId +
    //         '/menus',
    //     ),
    //     { idField: 'id' },
    //   ).subscribe((res) => {
    //     // this.getMenu()
    //     res.forEach(async (menu) => {
    //       // console.log('menu112 getting menu', menu);
    //       try {
    //         let res: any = await firstValueFrom(
    //           this.indexedDbService.getByIndex('menu', 'menuId', menu.id),
    //         );
    //         if (res) {
    //           if (res.menu.menuVersion) {
    //             // console.log("menu112 id exists",res.menu.menuVersion,menu.menuVersion);
    //             if (res.menu.menuVersion < menu.menuVersion) {
    //               // console.log('menu112 res menu version',res.menu.menuVersion,menu.menuVersion);
    //               await this.getMenu(menu.id);
    //             } else {
    //               // console.log("menu112 id exists and version is same or lower");
    //             }
    //           } else {
    //             // console.log("menu112 id doesn't exists");
    //             await this.getMenu(menu.id);
    //           }
    //         } else {
    //           // console.log('menu112 res error getting menu', res, menu.id);
    //           await this.getMenu(menu.id);
    //         }
    //       } catch (error) {
    //         // console.log('menu112 error getting menu', menu.id);
    //         await this.getMenu(menu.id);
    //       }
    //     });
    //   });
    // });
    this.updateMenuVersionRequest.subscribe((menuId) => {
      if (!this.versionToBeUpdatedMenus.includes(menuId)){
        this.versionToBeUpdatedMenus.push(menuId);
      }
      this.menuUpdater.next();
    });
    this.requestMenuDownload.pipe(debounceTime(1000)).subscribe((menuId) => {
      if (!this.toBeDownloadedMenus.includes(menuId)){
        this.toBeDownloadedMenus.push(menuId);
      }
      this.downloadMenus();
    })
  }

  downloadMenus(){
    this.toBeDownloadedMenus.forEach(async (menuId) => {
      await this.getMenu(menuId);
      this.downloadedMenus.next(menuId);
    })
    this.toBeDownloadedMenus = [];
  }


  checkAndUpdateLocalMenus(){
    // the job of this function will be to check every menu version in indexed db and update it if it is lower than the online version
    // console.log("menu112 checking and updating local menus");
    this.dataProvider.allMenus.subscribe(async (menus) => {
      let localMenus = await firstValueFrom(
        this.indexedDbService.getAll('menu'),
      );
      console.log("Pre-Loaded Local Menus",localMenus);
      localMenus.forEach(async (localMenu:any) => {
        let onlineMenu = menus.find((menu) => menu.id == localMenu.menuId);
        if (onlineMenu) {
          if (onlineMenu.menuVersion != localMenu.menu.menuVersion) {
            // console.log("menu112 online menu version is higher than local menu version");
            this.dataProvider.menusUpdated.next(onlineMenu.id);
          }
        }
      });
    })
  }

  getAllMenus() {
    collectionData(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/menus',
      ),
      { idField: 'id' },
    ).subscribe(async (res) => {
      this.dataProvider.allMenus.next(res as Menu[]);
    });
  }

  async getLocalMenu(menuId) {
    try {
      let localMenu = (await firstValueFrom(
        this.indexedDbService.getByKey('menu', menuId),
      )) as {
        menu: any;
        menuId: string;
        products: Product[];
        rootCategories: RootCategory[];
        viewCategories: ViewCategory[];
        recommendedCategories: ViewCategory[];
        printerSettings: PrinterSetting[];
        defaultPrinter: { billPrinter: string; kotPrinter: string };
      };
      let menus = await firstValueFrom(this.dataProvider.allMenus);
      let onlineMenu = menus.find(
        (m) => m.id == localMenu.menuId,
      );
      if (localMenu.menu.menuVersion < onlineMenu.menuVersion) {
        console.log(
          'Local menu is older than online menu',
          'Local:',
          localMenu.menu.menuVersion,
          '  Online:',
          onlineMenu.menuVersion,
        );

        return undefined;
      }
      // console.log('loaded local menu',menuId, localMenu);
      return localMenu;
    } catch (error) {
      if (error instanceof DOMException) {
        // console.log("menu112 DOMException",error);
        this.indexedDbService.createObjectStore(dbConfig.objectStoresMeta[2]);
      }
      if (error) return undefined;
    }
  }

  storeMenuData(menuId: string) {
    this.getMenus();
  }

  updateMenuData(menuId: string) {
    updateDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/menus/' + menuId,
      ),
      {
        lastUpdated: serverTimestamp(),
        menuVersion: increment(1),
      },
    )
      .then(() => {
        this.alertify.presentToast('Menu propogated successfully');
      })
      .catch((err) => {
        this.alertify.presentToast('Menu propogation failed');
      });
  }

  getMenuData() {
    this.dataProvider.activeModes;
  }

  getMainCategories() {
    let menuData = this.getLocalMenu(
      this.dataProvider.currentMenu?.selectedMenu?.id,
    );
    // console.log("menu113 ",menuData);
    return getDocs(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          this.dataProvider.currentMenu?.selectedMenu?.id +
          '/rootCategories',
      ),
    );
  }

  async getTables() {
    getDocs(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/tables',
      ),
    )
      .then(async (res) => {
        if (res?.docs?.length > 0) {
          let tables = res.docs.map(async (doc) => {
            let table = { ...doc.data(), id: doc.id } as TableConstructor;
            // let tableClass = new Table(table.id,Number(table.tableNo),table.name,table.maxOccupancy,table.type,this.dataProvider,this.databaseService)
            // tableClass.fromObject(table);
            return await Table.fromObject(
              table,
              this.dataProvider,
              this.analyticsService,
              this.tableService,
              this.billService,
              this.printingService,
              this.customerService,
              this.userManagementService,
            );
          });
          // console.log('tables ', tables);
          // add data to indexedDB
          let formedTable = await Promise.all(tables);
          // sort tables by tableNo
          formedTable.sort((a, b) => {
            return a.tableNo - b.tableNo;
          });
          this.dataProvider.tables = formedTable;
        } else {
          if (this.dataProvider.tables.length == 0 && res.docs.length == 0) {
            this.dataProvider.tables = [];
          }
        }
      })
      .catch((err) => {
        // console.log('Table fetch Error ', err);
      });
  }

  async getTokens() {
    getDocs(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/tokens',
      ),
    ).then(async (res) => {
      let tables = res.docs.map(async (doc) => {
        let table = { ...doc.data(), id: doc.id } as TableConstructor;
        // let tableClass = new Table(table.id,Number(table.tableNo),table.name,table.maxOccupancy,'token',this.dataProvider,this.databaseService)
        // tableClass.fromObject(table);
        return await Table.fromObject(
          table,
          this.dataProvider,
          this.analyticsService,
          this.tableService,
          this.billService,
          this.printingService,
          this.customerService,
          this.userManagementService,
        );
      });
      let formedTable = await Promise.all(tables);
      formedTable.sort((a, b) => {
        return a.tableNo - b.tableNo;
      });
      this.dataProvider.tokens = formedTable;
    });
  }

  async getOnlineTokens() {
    getDocs(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/onlineTokens',
      ),
    ).then(async (res) => {
      let tables = res.docs.map(async (doc) => {
        let table = { ...doc.data(), id: doc.id } as TableConstructor;
        let tableClass = await Table.fromObject(
          table,
          this.dataProvider,
          this.analyticsService,
          this.tableService,
          this.billService,
          this.printingService,
          this.customerService,
          this.userManagementService,
        );
        // console.log('ONLINE TABLE', tableClass);
        return tableClass;
      });
      let formedTable = await Promise.all(tables);
      formedTable.sort((a, b) => {
        return a.tableNo - b.tableNo;
      });
      this.dataProvider.onlineTokens = formedTable;
    });
  }

  async getRecommendedCategoriesByMenu(menu: Menu) {
    let localMenu = await this.getLocalMenu(menu.id);
    // console.log("menu113 recommendedCategories",localMenu?.recommendedCategories);
    if (localMenu?.recommendedCategories) {
      return localMenu?.recommendedCategories;
    }
    console.log('recommended: Not available on local fetching from online');

    let res = await getDocs(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menu.id +
          '/recommededCategories/',
      ),
    );
    if (res) {
      return res.docs.map((d) => {
        return { ...d.data(), id: d.id };
      });
    } else {
      return [];
    }
  }

  async getViewCategoriesByMenu(menu: Menu, username?: string) {
    let userId = username ? username : this.dataProvider.currentUser.username;
    let localMenu = await this.getLocalMenu(menu.id);
    // console.log("menu113 viewCategories",localMenu?.viewCategories);
    if (localMenu?.viewCategories[userId]) {
      return localMenu?.viewCategories[userId];
    }
    console.log('view: Not available on local fetching from online');
    let res = await getDocs(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menu.id +
          '/users/' +
          userId +
          '/viewCategories/',
      ),
    );
    if (res) {
      return res.docs.map((d) => {
        return { ...d.data(), id: d.id };
      });
    } else {
      return [];
    }
  }

  async getMainCategoriesByMenu(menu: Menu) {
    let localMenu = await this.getLocalMenu(menu.id);
    // console.log("menu113 rootCategories",localMenu?.rootCategories);
    if (localMenu?.rootCategories) {
      return localMenu?.rootCategories;
    }
    console.log('main: Not available on local fetching from online');
    let res = await getDocs(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menu.id +
          '/rootCategories/',
      ),
    );
    if (res) {
      return res.docs.map((d) => {
        return { ...d.data(), id: d.id };
      });
    } else {
      return [];
    }
  }

  async getProductsByMenu(menu: Menu) {
    let localMenu = await this.getLocalMenu(menu.id);
    if (localMenu?.menu?.menuVersion == menu.menuVersion) {
      if (localMenu?.products) {
        return localMenu.products;
      }
      await this.getMenu(menu.id);
      // recheck for localMenu
      localMenu = await this.getLocalMenu(menu.id);
      if (localMenu?.products) {
        return localMenu.products;
      }
      console.log('products: Not available on local fetching from online');
      let res = await getDocs(
        collection(
          this.firestore,
          'business/' +
            this.dataProvider.businessId +
            '/menus/' +
            menu.id +
            '/products/',
        ),
      );
      if (res) {
        return res.docs.map((doc) => {
          return { ...doc.data(), id: doc.id } as Product;
        });
      } else {
        return [];
      }
    } else {
      await this.getMenu(menu.id);
      let localMenu = await this.getLocalMenu(menu.id);
      if (localMenu?.products) {
        return localMenu.products;
      } else {
        throw new Error('No products found');
      }
    }
  }

  getPrinterConfigsByMenu(menu: Menu) {
    
  }

  getRootProducts() {
    return getDocs(collection(this.firestore, 'productsCollection'));
  }

  getMenus() {
    return getDocs(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/menus',
      ),
    );
  }

  async getMenu(menuId: string) {
    try {
      console.log("Downloading menu from server",menuId);
      // get products
      let productsFetchRequest = getDocs(
        collection(
          this.firestore,
          'business/' +
            this.dataProvider.businessId +
            '/menus/' +
            menuId +
            '/products',
        ),
      );
      // get rootCategories
      let rootCategoriesFetchRequest = getDocs(
        collection(
          this.firestore,
          'business/' +
            this.dataProvider.businessId +
            '/menus/' +
            menuId +
            '/rootCategories',
        ),
      );
      // get viewCategories
      let viewCategoriesFetchRequest = getDocs(
        collection(
          this.firestore,
          'business/' +
            this.dataProvider.businessId +
            '/menus/' +
            menuId +
            '/users/' +
            this.dataProvider.currentUser.username +
            '/viewCategories',
        ),
      );
      // get recommendedCategories
      let recommendedCategoriesFetchRequest = getDocs(
        collection(
          this.firestore,
          'business/' +
            this.dataProvider.businessId +
            '/menus/' +
            menuId +
            '/recommededCategories',
        ),
      );
      // get menu
      let menuFetchRequest = getDoc(
        doc(
          this.firestore,
          'business/' + this.dataProvider.businessId + '/menus/' + menuId,
        ),
      );
      // console.log("menu112 Requests generated");
      // fetch in parallel
      let [
        productsFetch,
        rootCategoriesFetch,
        viewCategoriesFetch,
        recommendedCategoriesFetch,
        menuFetch,
      ] = await Promise.all([
        productsFetchRequest,
        rootCategoriesFetchRequest,
        viewCategoriesFetchRequest,
        recommendedCategoriesFetchRequest,
        menuFetchRequest,
      ]);
      // console.log("menu data fetched");
      // check if the menu exists if yes then delete entry
      try {
        var menuExists: any = await firstValueFrom(
          this.indexedDbService.getByIndex('menu', 'menuId', menuId),
        );
        // console.log("Menu already exists in db",menuExists);
        if (menuExists) {
          let res = await firstValueFrom(
            this.indexedDbService.delete('menu', menuId),
          );
        } else {
          // console.log('menu112 menu does not exist');
        }
      } catch (error) {
        console.log(`menu ${menuId} does not exist`);
      }
      let menuData = {
        menuId: menuId,
        menu: menuFetch.data(),
        products: productsFetch.docs.map((doc) => {
          return { ...doc.data(), id: doc.id } as Product;
        }),
        rootCategories: rootCategoriesFetch.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        }),
        viewCategories: {
          [this.dataProvider.currentUser.username]:
            viewCategoriesFetch.docs.map((doc) => {
              return { ...doc.data(), id: doc.id };
            }),
        },
        recommendedCategories: recommendedCategoriesFetch.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        }),
        printerSettings: menuExists ? menuExists.printerSettings : [],
        defaultPrinter: menuExists
          ? menuExists.defaultPrinter
          : { billPrinter: '', kotPrinter: '' },
      };
      // console.log("Saving menu to local db");
      await firstValueFrom(this.indexedDbService.add('menu', menuData));
      this.dataProvider.menus
        .find((menu) => menu.selectedMenuId == menuId)
        .getAllData();
      if (this.dataProvider.currentMenu.selectedMenuId == menuId) {
        this.dataProvider.products = menuData.products;
      }
      this.dataProvider.menuLoadSubject.next(true);
    } catch (error) {
      // console.log('index not found');
    }
  }

  async getRootCategories() {
    let localMenu = await this.getLocalMenu(
      this.dataProvider.currentMenu?.selectedMenu?.id,
    );
    // console.log("menu113 rootCategories",localMenu?.rootCategories);
    if (localMenu?.rootCategories) {
      return localMenu?.rootCategories;
    }
    let res = await getDocs(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          this.dataProvider.currentMenu?.selectedMenu?.id +
          '/rootCategories',
      ),
    );
    if (res) {
      return res.docs.map((d) => {
        return { ...d.data(), id: d.id };
      });
    } else {
      return [];
    }
  }

  async getViewCategories() {
    let localMenu = await this.getLocalMenu(
      this.dataProvider.currentMenu?.selectedMenu?.id,
    );
    // console.log("menu113 viewCategories",localMenu?.viewCategories);
    if (localMenu?.viewCategories) {
      return localMenu?.viewCategories;
    }
    let res = await getDocs(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          this.dataProvider.currentMenu?.selectedMenu?.id +
          '/users/' +
          this.dataProvider.currentUser.username +
          '/viewCategories',
      ),
    );
    if (res) {
      return res.docs.map((d) => {
        return { ...d.data(), id: d.id };
      });
    } else {
      return [];
    }
  }

  async getRecommendedCategories() {
    let localMenu = await this.getLocalMenu(
      this.dataProvider.currentMenu?.selectedMenu?.id,
    );
    // console.log("menu113 recommendedCategories",localMenu?.recommendedCategories);
    if (localMenu?.recommendedCategories) {
      return localMenu?.recommendedCategories;
    }
    let res = await getDocs(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          this.dataProvider.currentMenu?.selectedMenu?.id +
          '/recommendedCategories',
      ),
    );
    if (res) {
      return res.docs.map((d) => {
        return { ...d.data(), id: d.id };
      });
    } else {
      return [];
    }
  }

  getIngredients() {
    return getDocs(
      collection(
        this.firestore,
        '/business/accounts/b8588uq3swtnwa1t83lla9/ingredients/ingredients',
      ),
    );
  }

  async addViewCategory(category: any, userId: string, id?: string) {
    if (!id) {
      console.log('Adding new view category', userId, category);
      let categoryRes = await addDoc(
        collection(
          this.firestore,
          'business/' +
            this.dataProvider.businessId +
            '/menus/' +
            this.dataProvider.currentMenu?.selectedMenu?.id +
            '/users/' +
            userId +
            '/viewCategories',
        ),
        category,
      );
      this.updateMenuVersionRequest.next(this.dataProvider.currentMenu?.selectedMenu?.id);
      return categoryRes;
    }
    console.log('Updating view category', userId, category);
    let categoryRes = await setDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          this.dataProvider.currentMenu?.selectedMenu?.id +
          '/users/' +
          userId +
          '/viewCategories/' +
          id,
      ),
      category,
      { merge: true },
    );
    this.updateMenuVersionRequest.next(this.dataProvider.currentMenu?.selectedMenu?.id)
    return categoryRes;
  }

  async addRootCategory(category: any, id?: string) {
    if (!id) {
      let categoryRes = await addDoc(
        collection(
          this.firestore,
          'business/' +
            this.dataProvider.businessId +
            '/menus/' +
            this.dataProvider.currentMenu?.selectedMenu?.id +
            '/rootCategories',
        ),
        category,
      );
      this.updateMenuVersionRequest.next(this.dataProvider.currentMenu?.selectedMenu?.id);
      return categoryRes;
    }
    // console.log(
    // 'business/' +
    //   this.dataProvider.businessId +
    //   '/menus/' +
    //   this.dataProvider.currentMenu?.selectedMenu?.id +
    //   '/rootCategories/' +
    //   id
    // );
    let categoryRes = await setDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          this.dataProvider.currentMenu?.selectedMenu?.id +
          '/rootCategories/' +
          id,
      ),
      category,
      { merge: true },
    );
    this.updateMenuVersionRequest.next(this.dataProvider.currentMenu?.selectedMenu?.id)
    return categoryRes;
  }

  async addNewMenu(
    menu: Menu,
    catGroups: { name: string; products: Product[] }[],
    businessId?: string,
  ) {
    if (!businessId) {
      businessId = this.dataProvider.businessId;
    }
    try {
      menu.selectedLoyaltyId = '';
      let menuRes = await addDoc(
        collection(this.firestore, 'business/' + businessId + '/menus'),
        menu,
      );
      // add default taxes
      let taxes: {
        cost: number;
        creationDate: Timestamp;
        mode: 'product' | 'bill';
        name: string;
        type: 'percentage' | 'amount';
        updateDate: Timestamp;
        id?: string;
      }[] = [
        {
          mode: 'product',
          cost: 2.5,
          creationDate: Timestamp.fromDate(new Date()),
          name: 'CGST',
          type: 'percentage',
          updateDate: Timestamp.fromDate(new Date()),
        },
        {
          mode: 'product',
          cost: 2.5,
          creationDate: Timestamp.fromDate(new Date()),
          name: 'SGST',
          type: 'percentage',
          updateDate: Timestamp.fromDate(new Date()),
        },
      ];
      let addedTaxes = await Promise.all(
        taxes.map(async (tax) => {
          return await this.addTax(tax as Tax, menuRes.id,businessId);
        }),
      );
      let productApplicableTaxes: productTax[] = addedTaxes.map(
        (tax, index) => {
          taxes[index].id = tax.id;
          return {
            ...taxes[index],
            id: tax.id,
            nature: 'exclusive',
            amount: 0,
          };
        },
      );
      let allProducts: Product[] = [];
      let productsRef: Promise<void>[] = [];
      let rootCategoriesRef = catGroups.forEach(async (catGroup, index) => {
        catGroup.products = catGroup.products.map((prod) => {
          prod.tags = [prod['tag']];
          prod.price = Number(prod.price);
          prod.id = this.generateRandomId();
          prod.taxes = productApplicableTaxes;
          prod.visible = true;
          return prod;
        });
        allProducts = [...allProducts, ...catGroup.products];
        // console.log("PRODUCTS",catGroup.products,allProducts);
        let newCategoryData = {
          name: catGroup.name,
          enabled: true,
          products: catGroup.products.map((product) => product.id),
          productOrders: catGroup.products.map((product) => product.id),
          averagePrice:
            catGroup.products.reduce((a, b) => a + b.price, 0) /
            catGroup.products.length,
          order: index + 1,
          printer: '',
          disabled: [],
        };
        // console.log("new newCategoryData",newCategoryData);
        let res = await addDoc(
          collection(
            this.firestore,
            'business/' +
              businessId +
              '/menus/' +
              menuRes.id +
              '/rootCategories',
          ),
          newCategoryData,
        );
        catGroup.products.forEach((product) => {
          productsRef.push(
            setDoc(
              doc(
                this.firestore,
                'business/' +
                  businessId +
                  '/menus/' +
                  menuRes.id +
                  '/products/' +
                  product.id,
              ),
              { ...product, category: { id: res.id, name: catGroup.name } },
              { merge: true },
            ),
          );
        });
      });
      let recommededCategories = [
        {
          id: 'highRange',
          averagePrice: 0,
          enabled: true,
          name: 'High Range',
          settings: { min: 300, max: null },
          products: allProducts.filter((product) => product.price >= 300),
        },
        {
          id: 'lowRange',
          averagePrice: 0,
          enabled: true,
          name: 'Low Range',
          settings: { min: null, max: 200 },
          products: allProducts.filter((product) => product.price <= 200),
        },
        {
          id: 'mostSelling',
          averagePrice: 0,
          enabled: true,
          name: 'Most Selling',
          settings: { min: 100, max: null },
          products: allProducts.filter(
            (product) => (product.sales || 0) >= 100,
          ),
        },
        {
          id: 'newDishes',
          averagePrice: 0,
          enabled: true,
          name: 'New Dishes',
          settings: { min: null, max: null },
          products: [],
        },
      ];
      let productsRes = await Promise.all(productsRef);
      let categoriesRes = await Promise.all(
        recommededCategories.map((category) => {
          return setDoc(
            doc(
              this.firestore,
              'business/' +
                businessId +
                '/menus/' +
                menuRes.id +
                '/recommededCategories/' +
                category.id,
            ),
            category,
            { merge: true },
          );
        }),
      );
      // console.log('New menu', menuRes.id);
      this.updateMenuVersionRequest.next(menuRes.id);
      return { menuRes, productsRes, categoriesRes };
    } catch (error) {
      throw error;
    }
  }

  async addNewRootCategory(products: any[], name: string) {
    products.forEach((prod)=>{
      prod.id = this.generateRandomId();
    })
    let newCategoryData = {
      name: name,
      enabled: true,
      products: products.map((product) => product.id),
      productOrders: products.map((product) => product.id),
      averagePrice: products.reduce((a, b) => a + b.price, 0) / products.length,
      order: 1,
      printer: '',
      disabled: [],
    };
    let categoryRef = await addDoc(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          this.dataProvider.currentMenu?.selectedMenu?.id +
          '/rootCategories',
      ),
      newCategoryData,
    );
    // first add all products
    await Promise.all(
      products.map(async (prod) => {
        prod.tags = [prod['tag']];
        prod.price = Number(prod.price);
        prod.category = { id: categoryRef.id, name: name };
        await setDoc(
          doc(
            this.firestore,
            'business/' +
              this.dataProvider.businessId +
              '/menus/' +
              this.dataProvider.currentMenu?.selectedMenu?.id +
              '/products/'+prod.id,
          ),
          prod,
        );
        return prod;
      }),
    );
    this.updateMenuVersionRequest.next(this.dataProvider.currentMenu?.selectedMenu?.id)
  }

  updateRootCategory(id: string, products: string[]) {
    this.updateMenuVersionRequest.next(this.dataProvider.currentMenu?.selectedMenu?.id)
    return updateDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          this.dataProvider.currentMenu?.selectedMenu?.id +
          '/rootCategories/' +
          id,
      ),
      { products: arrayUnion(...products) },
    );
  }

  updateViewCategory(id: string, products: string[]) {
    this.updateMenuVersionRequest.next(this.dataProvider.currentMenu?.selectedMenu?.id)
    return updateDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          this.dataProvider.currentMenu?.selectedMenu?.id +
          '/users/' +
          this.dataProvider.currentUser.username +
          '/viewCategories/' +
          id,
      ),
      { products: arrayUnion(...products) },
    );
  }

  addRecommendedCategory(category: any) {
    this.updateMenuVersionRequest.next(this.dataProvider.currentMenu?.selectedMenu?.id)
    return setDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          this.dataProvider.currentMenu?.selectedMenu?.id +
          '/recommendedCategories/' +
          category.id,
      ),
      category,
      { merge: true },
    );
  }

  updateProductVisiblity(id: string, visible: boolean) {
    this.updateMenuVersionRequest.next(this.dataProvider.currentMenu?.selectedMenu?.id)
    return setDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          this.dataProvider.currentMenu?.selectedMenu?.id +
          '/products/' +
          id,
      ),
      { visible: visible },
      { merge: true },
    );
  }

  updateCategoryVisiblity(id: string, type: string, enabled: boolean) {
    this.updateMenuVersionRequest.next(this.dataProvider.currentMenu?.selectedMenu?.id)
    return setDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          this.dataProvider.currentMenu?.selectedMenu?.id +
          '/' +
          type +
          '/' +
          id,
      ),
      { enabled: enabled },
      { merge: true },
    );
  }

  updateMenu(menu: Menu, type: 'dineIn' | 'takeaway' | 'online') {
    if (type == 'dineIn') {
      return setDoc(
        doc(
          this.firestore,
          'business/' + this.dataProvider.businessId + '/settings/settings/',
        ),
        { dineInMenu: menu },
        { merge: true },
      );
    } else if (type == 'takeaway') {
      return setDoc(
        doc(
          this.firestore,
          'business/' + this.dataProvider.businessId + '/settings/settings/',
        ),
        { takeawayMenu: menu },
        { merge: true },
      );
    } else if (type == 'online') {
      return setDoc(
        doc(
          this.firestore,
          'business/' + this.dataProvider.businessId + '/settings/settings/',
        ),
        { onlineMenu: menu },
        { merge: true },
      );
    } else {
      return Promise.reject('Invalid type');
    }
  }

  updateProductMenu(product: any, menu: Menu) {
    this.updateMenuVersionRequest.next(menu.id);
    return setDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menu.id +
          '/products/' +
          product.id,
      ),
      product,
      { merge: true },
    );
  }

  updateRecommendedCategoryMenu(category: any, menu: Menu) {
    this.updateMenuVersionRequest.next(menu.id);
    return setDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menu.id +
          '/recommededCategories/' +
          category.id,
      ),
      category,
      { merge: true },
    );
  }

  updateViewCategoryMenu(category: any, menu: Menu) {
    this.updateMenuVersionRequest.next(menu.id);
    return setDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menu.id +
          '/users/' +
          this.dataProvider.currentUser.username +
          '/viewCategories/' +
          category.id,
      ),
      category,
      { merge: true },
    );
  }

  updateMainCategoryMenu(category: any, menu: Menu) {
    this.updateMenuVersionRequest.next(menu.id);
    return setDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menu.id +
          '/rootCategories/' +
          category.id,
      ),
      category,
      { merge: true },
    );
  }

  setSettingsMenu(data: any, type: string, productList: string[], menu: Menu) {
    this.updateMenuVersionRequest.next(menu.id);
    return setDoc(
      doc(
        this.firestore,
        '/business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menu.id +
          '/recommededCategories/' +
          type,
      ),
      { settings: data, products: productList },
      { merge: true },
    );
  }

  updateRootSettings(settings: any, businessId: string) {
    return setDoc(
      doc(this.firestore, 'business/' + businessId + '/settings/settings'),
      settings,
      { merge: true },
    );
  }

  deleteViewCategory(menuId: string, categoryId: string,userId:string) {
    this.updateMenuVersionRequest.next(menuId);
    return deleteDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/users/' +
          userId +
          '/viewCategories/' +
          categoryId,
      ),
    );
  }

  getTypes(menuId: string) {
    return getDocs(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/comboTypes',
      ),
    );
  }

  async addType(data: ComboType, menu: Menu, imageFile: File) {
    let imageUrl = await this.fileStorageService.upload(
      `business/${this.dataProvider.currentBusiness.businessId}/menus/${
        menu.id
      }/combos/types/images/${new Date().getTime()}_${imageFile.name}`,
      imageFile,
    );
    this.updateMenuVersionRequest.next(menu.id);
    data.image = imageUrl;
    return addDoc(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menu.id +
          '/comboTypes',
      ),
      data,
    );
  }

  updateType(data: ComboType, menu: Menu) {
    this.updateMenuVersionRequest.next(menu.id);
    return setDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menu.id +
          '/comboTypes/' +
          data.id,
      ),
      data,
      { merge: true },
    );
  }

  deleteType(data: ComboType, menu: Menu) {
    this.updateMenuVersionRequest.next(menu.id);
    return deleteDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menu.id +
          '/comboTypes/' +
          data.id,
      ),
    );
  }

  // time group

  getTimeGroups(menuId: string) {
    return getDocs(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/timeGroups',
      ),
    );
  }

  async addTimeGroup(data: TimeGroup, menu: Menu) {
    this.updateMenuVersionRequest.next(menu.id);
    return addDoc(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menu.id +
          '/timeGroups',
      ),
      data,
    );
  }

  updateTimeGroup(data: TimeGroup, menu: Menu) {
    this.updateMenuVersionRequest.next(menu.id);
    return setDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menu.id +
          '/timeGroups/' +
          data.id,
      ),
      data,
      { merge: true },
    );
  }

  deleteTimeGroup(data: TimeGroup, menu: Menu) {
    this.updateMenuVersionRequest.next(menu.id);
    return deleteDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menu.id +
          '/timeGroups/' +
          data.id,
      ),
    );
  }

  // combo

  getCombos(menuId: string) {
    return getDocs(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/combos',
      ),
    );
  }

  addCombo(data: Combo, menu: Menu) {
    this.updateMenuVersionRequest.next(menu.id);
    // console.log('Add Combo: ', data);
    return addDoc(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menu.id +
          '/combos',
      ),
      data,
    );
  }

  updateCombo(data: Combo, menu: Menu) {
    this.updateMenuVersionRequest.next(menu.id);
    return setDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menu.id +
          '/combos/' +
          data.id,
      ),
      data,
      { merge: true },
    );
  }

  deleteCombo(data: Combo, menu: Menu) {
    this.updateMenuVersionRequest.next(menu.id);
    return deleteDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menu.id +
          '/combos/' +
          data.id,
      ),
    );
  }

  getTaxes(menuId: string) {
    return getDocs(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/taxes',
      ),
    );
  }

  addTax(data: Tax, menuId: string,businessId?:string) {
    this.updateMenuVersionRequest.next(menuId);
    return addDoc(
      collection(
        this.firestore,
        'business/' +(businessId ||
          this.dataProvider.businessId) +
          '/menus/' +
          menuId +
          '/taxes',
      ),
      data,
    );
  }

  updateTax(taxId: string, data: Tax, menuId: string) {
    this.updateMenuVersionRequest.next(menuId);
    return setDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/taxes/' +
          taxId,
      ),
      data,
      { merge: true },
    );
  }

  deleteTax(taxId: string, menuId: string) {
    this.updateMenuVersionRequest.next(menuId);
    return deleteDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/taxes/' +
          taxId,
      ),
    );
  }

  addDiscount(data: CodeBaseDiscount, menuId: string) {
    this.updateMenuVersionRequest.next(menuId);
    return addDoc(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/discounts',
      ),
      data,
    );
  }

  updateDiscount(discountId: string, data: CodeBaseDiscount, menuId: string) {
    this.updateMenuVersionRequest.next(menuId);
    return setDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/discounts/' +
          discountId,
      ),
      data,
      { merge: true },
    );
  }

  deleteDiscount(discountId: string, menuId: string) {
    this.updateMenuVersionRequest.next(menuId);
    return deleteDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/discounts/' +
          discountId,
      ),
    );
  }

  getDiscounts(menuId: string) {
    return getDocs(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/discounts',
      ),
    );
  }

  getLoyaltySettings(menuId: string) {
    return getDocs(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/loyaltySettings',
      ),
    );
  }

  addLoyaltySetting(loyaltySetting: LoyaltySetting, menuId: string) {
    this.updateMenuVersionRequest.next(menuId);
    return addDoc(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/loyaltySettings',
      ),
      loyaltySetting,
    );
  }

  editLoyalSetting(loyaltySetting: LoyaltySetting, menuId: string) {
    this.updateMenuVersionRequest.next(menuId);
    return setDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/loyaltySettings/' +
          loyaltySetting.id,
      ),
      loyaltySetting,
      { merge: true },
    );
  }

  deleteLoyaltySetting(loyaltySettingId: string, menuId: string) {
    this.updateMenuVersionRequest.next(menuId);
    return deleteDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/loyaltySettings/' +
          loyaltySettingId,
      ),
    );
  }

  selectLoyalty(loyaltyId: string, menuId: string) {
    this.updateMenuVersionRequest.next(menuId);
    return setDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/menus/' + menuId,
      ),
      { selectedLoyaltyId: loyaltyId },
      { merge: true },
    );
  }

  generateRandomId() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  async getPrinterList(menu: Menu) {
    // first fetch it from indexed db
    let localMenu = await this.getLocalMenu(menu.id);
    return localMenu?.printerSettings;
  }

  async updatePrinterList(menu: Menu, printerList: PrinterSetting[]) {
    // this.updatableMenus.push(menu.id);
    // this.menuUpdated.next();
    // console.log("menu.id",menu.id);
    let localMenu = await this.getLocalMenu(menu.id);
    // console.log("localMenu",localMenu);
    if (localMenu) {
      localMenu.printerSettings = printerList;
      // console.log("Updating locally",localMenu);
      this.indexedDbService.update('menu', localMenu).subscribe(
        (res) => {
          // console.log("updated the menu",res);
          this.indexedDbService.getByKey('menu', menu.id).subscribe((res) => {
            // console.log("updated menu",res);
          });
        },
        (err) => {
          console.log(err);
        },
      );
    }
  }

  async getDefaultPrinter(menu: Menu) {
    let localMenu = await this.getLocalMenu(menu.id);
    // console.log("defaultPrinters localMenu",localMenu);
    return localMenu?.defaultPrinter;
  }

  async updateDefaultPrinter(
    menu: Menu,
    printer: { billPrinter: string; kotPrinter: string },
  ) {
    let localMenu = await this.getLocalMenu(menu.id);
    if (localMenu) {
      localMenu.defaultPrinter = printer;
      this.indexedDbService.update('menu', localMenu).subscribe(
        (res) => {
          // console.log("success",res);
        },
        (err) => {
          console.log(err);
        },
      );
    }
  }

  deleteMenu(menuId: string) {
    return deleteDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/menus/' + menuId,
      ),
    );
  }

  async deleteMainCategory(menuId: string, category:Category) {
    this.updateMenuVersionRequest.next(menuId);
    let docs = await Promise.all(category.products.map(async (prod)=>{
      await deleteDoc(doc(this.firestore,`business/${this.dataProvider.businessId}/menus/${menuId}/products/${prod.id}`))
    }));
    return deleteDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/rootCategories/' +
          category.id,
      ),
    );
  }
}

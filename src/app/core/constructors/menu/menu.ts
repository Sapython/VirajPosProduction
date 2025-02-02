import { moveItemInArray } from '@angular/cdk/drag-drop';
import {
  Timestamp,
  doc,
  serverTimestamp,
  setDoc,
} from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Fuse from 'fuse.js';
import { Subject, debounceTime, firstValueFrom } from 'rxjs';
import { AddDishComponent } from '../../../pages/biller/sidebar/edit-menu/add-dish/add-dish.component';
import { AddNewCategoryComponent } from '../../../pages/biller/sidebar/edit-menu/add-new-category/add-new-category.component';
import { ProductCostingComponent } from '../../../pages/biller/sidebar/edit-menu/product-costing/product-costing.component';
import { SelectCategoryComponent } from '../../../pages/biller/sidebar/edit-menu/select-category/select-category.component';
import { SelectRecipeComponent } from '../../../pages/biller/sidebar/edit-menu/select-recipe/select-recipe.component';
import { SetTaxComponent } from '../../../pages/biller/sidebar/edit-menu/set-tax/set-tax.component';
import { Category, ComboCategory } from '../../../types/category.structure';
import { AlertsAndNotificationsService } from '../../services/alerts-and-notification/alerts-and-notifications.service';
import { DataProvider } from '../../services/provider/data-provider.service';
import { Menu } from '../../../types/menu.structure';
import { Product } from '../../../types/product.structure';
import { MenuManagementService } from '../../services/database/menuManagement/menu-management.service';
import { Dialog } from '@angular/cdk/dialog';
import { ProductsService } from '../../services/database/products/products.service';
import { Tax } from '../../../types/tax.structure';
import { SettingsService } from '../../services/database/settings/settings.service';
import { AddTaxComponent } from '../../../pages/biller/sidebar/edit-menu/add-tax/add-tax.component';
import { CodeBaseDiscount } from '../../../types/discount.structure';
import { AddDiscountComponent } from '../../../pages/biller/sidebar/edit-menu/add-discount/add-discount.component';
import {
  Combo,
  ComboType,
  ComboTypeCategorized,
  TimeGroup,
} from '../../../types/combo.structure';
import { AddComboComponent } from '../../../pages/biller/sidebar/edit-menu/add-combo/add-combo.component';
import { AddTimeGroupComponent } from '../../../pages/biller/sidebar/edit-menu/add-time-group/add-time-group.component';
import { LoyaltySetting } from '../../../types/loyalty.structure';
import { AddLoyaltySettingComponent } from '../../../pages/biller/sidebar/edit-menu/add-loyalty-setting/add-loyalty-setting.component';
import { PrinterSettingComponent } from '../../../pages/biller/sidebar/edit-menu/printer-setting/printer-setting.component';
import { PrinterSetting } from '../../../types/printing.structure';
import { AddMainCategoryComponent } from '../../../pages/biller/sidebar/edit-menu/add-main-category/add-main-category.component';

var debug: boolean = false;

export class ModeConfig {
  name: string;
  active: boolean;
  selectedMenuId: string = '';
  selectedMenu: Menu | undefined;
  filteredProducts: Product[];
  productVisibilityChanged: boolean = false;
  allProductsCategory: Category;
  comboCategory: ComboCategory;
  products: Product[] = [];
  recommendedCategories: Category[] = [];
  viewCategories: Category[] = [];
  userWiseViewCategories: {user:string,categories:Category[],open:boolean}[] = [];
  mainCategories: Category[] = [];
  categoryUpdated: boolean;
  productsUpdated: boolean;
  currentType: 'recommended' | 'root' | 'view' | 'all';
  selectedCategory: Category | undefined;
  type: 'dineIn' | 'takeaway' | 'online' | undefined;
  searchSubject: Subject<string> = new Subject<string>();
  typeSearchSubject: Subject<string> = new Subject<string>();
  discountsSearchSubject: Subject<string> = new Subject<string>();
  taxesSearchSubject: Subject<string> = new Subject<string>();
  loyaltySearchSubject: Subject<string> = new Subject<string>();
  fuseInstance: Fuse<Product> = new Fuse([], { keys: ['name'] });
  typesSearchInstance: Fuse<ComboType> = new Fuse([], { keys: ['name'] });
  taxesSearchInstance: Fuse<Tax> = new Fuse([], { keys: ['name'] });
  loyaltySearchInstance: Fuse<Tax> = new Fuse([], { keys: ['name'] });
  discountsSearchInstance: Fuse<CodeBaseDiscount> = new Fuse([], {
    keys: ['name'],
  });
  searchFormControl:FormControl = new FormControl('');
  loyaltySettings: LoyaltySetting[] = [];
  filteredLoyaltySettings: LoyaltySetting[] = [];
  loadingLoyaltySettings: boolean = false;
  highCostForm: FormGroup = new FormGroup({
    min: new FormControl(this.dataProvider.highCostConfig.min, [
      Validators.required,
    ]),
    max: new FormControl(this.dataProvider.highCostConfig.max),
  });
  lowCostForm: FormGroup = new FormGroup({
    min: new FormControl(this.dataProvider.lowCostConfig.min, [
      Validators.required,
    ]),
    max: new FormControl(this.dataProvider.lowCostConfig.min),
  });
  highRangeForm: FormGroup = new FormGroup({
    min: new FormControl(this.dataProvider.highRangeConfig.min, [
      Validators.required,
    ]),
    max: new FormControl(this.dataProvider.highRangeConfig.max),
  });
  lowRangeForm: FormGroup = new FormGroup({
    min: new FormControl(this.dataProvider.lowRangeConfig.min, [
      Validators.required,
    ]),
    max: new FormControl(this.dataProvider.lowRangeConfig.max),
  });
  mostSellingForm: FormGroup = new FormGroup({
    numberOfProducts: new FormControl(this.dataProvider.mostSellingConfig.numberOfProducts, Validators.required)
  });
  newDishesForm: FormGroup = new FormGroup({
    numberOfProducts: new FormControl(this.dataProvider.newDishesConfig.numberOfProducts, Validators.required)
  });
  taxSearchControl: string = '';
  taxes: Tax[] = [];
  filteredTaxes: Tax[] = [];
  discounts: CodeBaseDiscount[] = [];
  filteredDiscounts: CodeBaseDiscount[] = [];
  loadingDiscount: boolean = false;
  loadingTax: boolean = false;
  combos: Combo[] = [];
  loadingCombos: boolean = false;
  comboTypes: any[] = [];
  loadingTypes: boolean = false;
  types: ComboType[] = [];
  filteredTypes: ComboType[] = [];
  loadingComboTypes: boolean = false;
  loadingTimeGroups: boolean = false;
  timeGroups: TimeGroup[] = [];
  // temps
  activateCategory: Category | undefined;
  discountSearchControl: string = '';
  selectedLoyaltyId: string = '';
  loadedAllData:Subject<void> = new Subject<void>();
  currentUserViewCategory:Category|undefined;
  selectedUserViewCategory:string;
  reorderRecommendedCategories:boolean = false;
  reorderViewCategories:boolean = false;
  reorderMainCategories:boolean = false;
  reorderProducts:boolean = false;
  constructor(
    name: string,
    type: 'dineIn' | 'takeaway' | 'online',
    selectedMenu: Menu | undefined,
    selectedMenuId: string,
    private dataProvider: DataProvider,
    private menuManagementService: MenuManagementService,
    private productService: ProductsService,
    private alertify: AlertsAndNotificationsService,
    private dialog: Dialog,
    private settingsService: SettingsService,
  ) {
    this.name = name;
    this.type = type;
    this.active = this.isActive;
    this.filteredProducts = [];
    this.selectedMenuId = selectedMenuId;
    this.selectedMenu = selectedMenu;
    this.selectedLoyaltyId = selectedMenu.selectedLoyaltyId || '';
    this.categoryUpdated = false;
    this.currentType = 'all';
    this.products.sort((a, b) => {
      if (a.name && b.name) {
        return a.name.localeCompare(b.name);
      } else {
        return 0;
      }
    });
    this.allProductsCategory = {
      enabled: true,
      id: 'allProducts',
      name: 'All Products',
      products: this.products,
      productOrders: this.products.map((p) => p.id),
      averagePrice: 0,
    };

    this.selectedCategory = this.allProductsCategory;
    if (this.selectedMenu) {
      this.getAllData();
    }
    this.searchSubject.pipe(debounceTime(500)).subscribe((searchString) => {
      if (searchString) {
        let res = this.fuseInstance.search(searchString);
        this.filteredProducts = res.map((result) => result.item);
      } else {
        this.filteredProducts = [];
      }
    });
    this.menuManagementService.downloadedMenus.subscribe(async (data)=>{
      if (data == this.selectedMenuId){
        await this.getAllData();
      }
    });
    this.dataProvider.menusUpdated.pipe(debounceTime(1000)).subscribe(async (data)=>{
      // alert("Menu updated. refetching data");
      if (data == this.selectedMenuId){
        let menus = await firstValueFrom(this.dataProvider.allMenus);
        this.selectedMenu = menus.find(
          (menu) => menu.id == this.selectedMenuId,
        );
        this.selectedLoyaltyId = this.selectedMenu.selectedLoyaltyId || '';
        console.log('Selected menu changed updated local menu',this.selectedMenu);
        this.menuManagementService.requestMenuDownload.next(this.selectedMenuId);
      }
    });
    this.typeSearchSubject.pipe(debounceTime(500)).subscribe((searchString) => {
      if (searchString) {
        let res = this.typesSearchInstance.search(searchString);
        this.filteredTypes = res.map((result) => result.item);
      } else {
        this.filteredTypes = [];
      }
    });
    this.discountsSearchSubject
      .pipe(debounceTime(500))
      .subscribe((searchString) => {
        if (searchString) {
          let res = this.discountsSearchInstance.search(searchString);
          this.filteredDiscounts = res.map((result) => result.item);
        } else {
          this.filteredDiscounts = [];
        }
      });
    this.taxesSearchSubject
      .pipe(debounceTime(500))
      .subscribe((searchString) => {
        if (searchString) {
          let res = this.taxesSearchInstance.search(searchString);
          this.filteredTaxes = res.map((result) => result.item);
        } else {
          this.filteredTaxes = [];
        }
      });
    this.searchFormControl.valueChanges.subscribe((searchString) => {
      this.searchSubject.next(searchString);
    })
  }

  get isActive() {
    if (this.type == 'dineIn') {
      return this.dataProvider.activeModes[0];
    } else if (this.type == 'takeaway') {
      return this.dataProvider.activeModes[1];
    } else if (this.type == 'online') {
      return this.dataProvider.activeModes[2];
    } else {
      return false;
    }
  }

  public resetActivateCategory() {
    this.activateCategory = undefined;
  }

  async getProducts() {
    if (this.selectedMenu) {
      let defaultPrinter = await this.menuManagementService.getDefaultPrinter(this.selectedMenu)
      let data = await this.menuManagementService.getProductsByMenu(this.selectedMenu);
      // data.forEach((doc)=>{
      //   this.menuManagementService.updateRecipe({id:doc.id,type:doc.data().type.replace('\r','')},this.selectedMenuId)
      // })
      // console.log("main products",data);
      this.products = data;
      // console.log('this.products', this.products);
      let event = {
        previousPageIndex: 0,
        pageIndex: 0,
        pageSize: 10,
        length: this.products.length,
      };
      this.products.forEach((product)=>{
        if (product.taxes){
          product.taxes = product.taxes.map((tax)=>{
            let foundTax = this.taxes.find((t)=>t.id == tax.id);
            if (foundTax){
              return {...foundTax,nature:tax.nature};
            } else {
              return tax;
            }
          });
        }
      });
      this.allProductsCategory.products = this.products.slice(
        event.pageIndex * event.pageSize,
        (event.pageIndex + 1) * event.pageSize,
      );
      this.allProductsCategory.averagePrice =
        this.products.reduce((acc, curr) => acc + curr.price, 0) /
        this.products.length;
      this.fuseInstance.setCollection(this.products);
      this.selectedCategory = this.allProductsCategory;
      let printerConfig = await this.getPrinterSettings();
      // printer config is of type [{printerName, dishesId:[productId1,productId2]}]
      this.products = this.products.map((p) => {
        // console.log("p",p.specificPrinter);
        let printer = printerConfig?.find((config) => config.dishesId.includes(p.id))?.printerName || defaultPrinter?.billPrinter;
        return { ...p, itemType: 'product',specificPrinter:printer };
      });
      // sort products by name
      this.products.sort((a, b) => {
        if (a.name && b.name) {
          return a.name.localeCompare(b.name);
        } else {
          return 0;
        }
      });
      // console.log("All products",this.products);
      // alert("Renaming tags");
      // this.products.forEach((prod)=>{
      //   prod.tags = [];
      //   this.menuManagementService.updateProductMenu(prod,this.selectedMenu);
      // });
    }
  }

  async getRecommendedCategories() {
    if (this.selectedMenu) {
      let data =
        await this.menuManagementService.getRecommendedCategoriesByMenu(
          this.selectedMenu,
        );
      // console.log("Recommended categories",data);
      this.recommendedCategories = data.map((doc) => {
        let products = this.products.filter((p) => {
          return doc['products'].includes(p.id) && p.visible;
        });
        return {
          ...doc,
          name: doc['name'],
          id: doc.id,
          products: products,
          averagePrice:
            products.reduce((acc, curr) => acc + curr.price, 0) /
            products.length,
        } as Category;
      });
      this.recommendedCategories.sort((a, b) => {
        if (a.order && b.order) {
          return a.order - b.order;
        } else {
          return 0;
        }
      });
      this.recommendedCategories.forEach((cat) => {
        if(cat.id == 'highRange'){
          cat.productOrders = cat.products.sort((a, b) => {
            if (a.price && b.price) {
              return b.price - a.price;
            } else {
              return 0;
            }
          }).map((p)=>p.id);
          this.dataProvider.highRangeConfig = cat['settings'];
          this.highRangeForm.patchValue(this.dataProvider.highRangeConfig);
          // console.log("highRangeConfig",this.dataProvider.highRangeConfig);
        } else if(cat.id == 'lowRange'){
          cat.productOrders = cat.products.sort((a, b) => {
            if (a.price && b.price) {
              return a.price - b.price;
            } else {
              return 0;
            }
          }).map((p)=>p.id);
          this.dataProvider.lowRangeConfig = cat['settings'];
          this.lowRangeForm.patchValue(this.dataProvider.lowRangeConfig);
          // console.log("lowRangeConfig",this.lowRangeForm.value,this.dataProvider.lowRangeConfig);
        } else if(cat.id == 'mostSelling'){
          cat.productOrders = cat.products.sort((a, b) => {
            if (a.price && b.price) {
              return b.sales - a.sales;
            } else {
              return 0;
            }
          }).map((p)=>p.id);
          this.dataProvider.mostSellingConfig = cat['settings'];
          // console.log("mostSellingConfig",this.dataProvider.mostSellingConfig);
          this.mostSellingForm.patchValue(this.dataProvider.mostSellingConfig);
        } else if(cat.id == 'newDishes'){
          cat.productOrders = cat.products.sort((a, b) => {
            if (a.price && b.price) {
              console.log("createdDate",b.createdDate);
              if (b.createdDate==undefined) return -1;
              if (b.createdDate?.toDate == undefined) {
                // b.createdDate has seconds and nanoseconds convert it to date
                b.createdDate = new Timestamp(b.createdDate.seconds,b.createdDate.nanoseconds);
              }
              return b.createdDate?.toDate().getTime() - a.createdDate?.toDate().getTime();
            } else {
              return 0;
            }
          }).map((p)=>p.id);
          this.dataProvider.newDishesConfig = cat['settings'];
          this.newDishesForm.patchValue(this.dataProvider.newDishesConfig);
          // console.log("newDishesConfig",this.dataProvider.newDishesConfig);
        }
      });
    }
  }

  async getViewCategories() {
    this.userWiseViewCategories = [];
    if (this.selectedMenu) {
      if (this.dataProvider.currentBusinessUser.accessType == 'role' && (
        this.dataProvider.currentBusinessUser.role == 'admin' || 
        this.dataProvider.currentBusinessUser.role == 'manager'
      )){
        this.dataProvider.currentBusiness.users.forEach(async (user)=>{
          let data = await this.menuManagementService.getViewCategoriesByMenu(
            this.selectedMenu,
            user.username
          );
          let formedCategory = data.map((doc) => {
            let products = this.products.filter((p) => {
              if (doc['disabled']) {
                var notDisabled = doc['disabled'].find((id: string) => id == p.id)
                  ? false
                  : true;
              } else {
                var notDisabled = true;
              }
              p.visible =
                notDisabled && (p.visible == undefined ? true : p.visible);
              return doc['products'].includes(p.id);
            });
            return {
              ...doc,
              name: doc['name'],
              id: doc.id,
              products: products,
              averagePrice:
                products.reduce((acc, curr) => acc + curr.price, 0) /
                products.length,
            } as Category;
          });
          formedCategory.sort((a, b) => {
            if (a.order && b.order) {
              return a.order - b.order;
            } else {
              return 0;
            }
          });
          // console.log('this.viewCategories', this.viewCategories);
          // sort all products by productOrder
          formedCategory.forEach((cat) => {
            // sort by cat.productOrders
            cat.products.sort((a, b) => {
              if (cat.productOrders) {
                let aOrder = cat.productOrders.indexOf(a.id);
                let bOrder = cat.productOrders.indexOf(b.id);
                if (aOrder != -1 && bOrder != -1) {
                  return aOrder - bOrder;
                } else if (aOrder != -1) {
                  return -1;
                } else if (bOrder != -1) {
                  return 1;
                } else {
                  return 0;
                }
              } else {
                return 0;
              }
            });
          });
          if (this.dataProvider.currentUser.username == user.username){
            this.viewCategories = formedCategory;
          }
          if (this.userWiseViewCategories.find((u)=>u.user == user.username)){
            this.userWiseViewCategories.find((u)=>u.user == user.username).categories = formedCategory;
          } else {
            // console.log("formedCategory",formedCategory);
            this.userWiseViewCategories.push({
              user:user.username,
              categories:formedCategory,
              open:false
            });
          }
        });
        // console.log("this.userWiseViewCategories",this.userWiseViewCategories);
      } else {
        let data = await this.menuManagementService.getViewCategoriesByMenu(
          this.selectedMenu,
        );
        this.viewCategories = data.map((doc) => {
          let products = this.products.filter((p) => {
            if (doc['disabled']) {
              var notDisabled = doc['disabled'].find((id: string) => id == p.id)
                ? false
                : true;
            } else {
              var notDisabled = true;
            }
            p.visible =
              notDisabled && (p.visible == undefined ? true : p.visible);
            return doc['products'].includes(p.id);
          });
          return {
            ...doc,
            name: doc['name'],
            id: doc.id,
            products: products,
            averagePrice:
              products.reduce((acc, curr) => acc + curr.price, 0) /
              products.length,
          } as Category;
        });
        // console.log('this.viewCategories', this.viewCategories);
        // sort by order
        this.viewCategories.sort((a, b) => {
          if (a.order && b.order) {
            return a.order - b.order;
          } else {
            return 0;
          }
        });
        // console.log('this.viewCategories', this.viewCategories);
        // sort all products by productOrder
        this.viewCategories.forEach((cat) => {
          // sort by cat.productOrders
          cat.products.sort((a, b) => {
            if (cat.productOrders) {
              let aOrder = cat.productOrders.indexOf(a.id);
              let bOrder = cat.productOrders.indexOf(b.id);
              if (aOrder != -1 && bOrder != -1) {
                return aOrder - bOrder;
              } else if (aOrder != -1) {
                return -1;
              } else if (bOrder != -1) {
                return 1;
              } else {
                return 0;
              }
            } else {
              return 0;
            }
          });
        });
        // if (debug)
          // console.log(
          //   'this.viewCategories',
          //   this.viewCategories,
          //   this.activateCategory,
          // );
      }
    }
  }

  async getMainCategories() {
    let configs = JSON.parse(localStorage.getItem('selectedMenu'));
    if (!configs) {
      configs = {};
    }
    if (this.selectedMenu) {
      let data = await this.menuManagementService.getMainCategoriesByMenu(
        this.selectedMenu,
      );
      this.mainCategories = data.map((doc) => {
        let products = this.products.filter((p) => {
          if (doc['disabled']) {
            var notDisabled = doc['disabled'].find((id: string) => id == p.id)
              ? false
              : true;
          } else {
            var notDisabled = true;
          }
          p.visible =
            notDisabled && (p.visible == undefined ? true : p.visible);
          return doc['products'] && doc['products'].includes(p.id);
        });
        // doc['productOrders'] is array of productIds in order so reorder products in this order
        if (doc['productOrders']) {
          products.sort((a, b) => {
            let aOrder = doc['productOrders'].indexOf(a.id);
            let bOrder = doc['productOrders'].indexOf(b.id);
            if (aOrder != -1 && bOrder != -1) {
              return aOrder - bOrder;
            } else if (aOrder != -1) {
              return -1;
            } else if (bOrder != -1) {
              return 1;
            } else {
              return 0;
            }
          });
        }
        return {
          ...doc,
          name: doc['name'],
          id: doc.id,
          products: products,
          averagePrice:
            products.reduce((acc, curr) => acc + curr.price, 0) /
            products.length,
        } as Category;
      });
      this.mainCategories.sort((a, b) => {
        if (a.order && b.order) {
          return a.order - b.order;
        } else {
          return 0;
        }
      });
    }
  }

  async getComboCategories() {
    this.combos = [];
    this.menuManagementService.getCombos(this.selectedMenu.id).then((data) => {
      data.forEach((doc) => {
        this.combos.push({
          ...doc.data(),
          id: doc.id,
        } as Combo);
        // preloading stuff
        if (doc.data()['offerImage']) {
          var img = new Image();
          img.src = doc.data()['offerImage'];
        }
      });
      // console.log("cat.category.products",this.products);
      this.combos.forEach((combo) => {
        // remap all products in every category to the new printer from local config
        combo.selectedCategories.forEach((cat) => {
          cat.category.products = cat.category.products.map((product)=>{
            let fromAllProducts = this.products.find((p)=>p.id == product.id);
            if (fromAllProducts){
              return {
                ...fromAllProducts,
                sellBy: fromAllProducts.sellByAvailable ? 'quantity' : undefined,
                selected:product.selected
              } as Product;
            } else {
              return undefined;
            }
          }).filter(a=>a)
          // console.log("ADDED",cat.category.products);
        });
      });
      // filter combos by checking their id and then remove if found duplicate
      this.combos = this.combos.filter(
        (combo, index, self) =>
          index === self.findIndex((t) => t.id === combo.id),
      );
      // console.log("COMBOS",this.combos);
      this.comboCategory = {
        combos: this.combos,
        name: 'Combos',
        id: 'combos',
        enabled: true,
        averagePrice: 0,
      };
      // console.log("Final combo category",this.comboCategory);
    });
  }

  async getAllData() {
    this.dataProvider.loading = true;
    // let localMenu = await this.menuManagementService.getLocalMenu(this.selectedMenuId);
    // console.log("Local menu version:",localMenu.menu.menuVersion,"Server menu version:",this.selectedMenu.menuVersion,this.selectedMenu);
    // if (localMenu.menu.menuVersion != this.selectedMenu.menuVersion){
    //   console.log("Updating menu");
    //   await this.menuManagementService.getMenu(this.selectedMenuId);
    //   console.log("Menu updated");
    // }
    await this.getTaxes();
    await this.getProducts();
    await this.getMainCategories();
    await this.getRecommendedCategories();
    await this.getViewCategories();
    await this.getDiscounts();
    await this.getComboCategories();
    await this.getLoyaltySettings();
    this.dataProvider.menuLoadSubject.next({
      type: this.type,
    });
    if (this.activateCategory) {
      if (debug) console.log('this.activateCategory', this.activateCategory);
      let newViewCategory = this.viewCategories.find(
        (cat) => cat.id == this.activateCategory.id,
      );
      if (debug) console.log('newCategory', newViewCategory);
      if (newViewCategory) {
        this.selectCategory(newViewCategory);
        // this.activateCategory = undefined;
      }
    }
    if (this.activateCategory) {
      let newMainCategory = this.mainCategories.find(
        (cat) => cat.id == this.activateCategory.id,
      );
      if (debug) console.log('newCategory', newMainCategory);
      if (newMainCategory) {
        this.selectCategory(newMainCategory);
        // this.activateCategory = undefined;
      }
    }
    // alert("Loaded all data");
    this.loadedAllData.next();
    this.dataProvider.loading = false;
  }

  pageChanged(event) {
    // paginate all products
    // console.log('event', event);
    this.allProductsCategory.products.sort((a, b) => {
      if (a.name && b.name) {
        return a.name.localeCompare(b.name);
      } else {
        return 0;
      }
    });
    this.allProductsCategory.products = this.products.slice(
      event.pageIndex * event.pageSize,
      (event.pageIndex + 1) * event.pageSize,
    );
  }

  async updateMenu() {
    let menus = await firstValueFrom(this.dataProvider.allMenus);
    this.selectedMenu = menus.find(
      (menu) => menu.id == this.selectedMenuId,
    );
    // console.log('this.selectedMenu', this.selectedMenu);
    // console.log('updating menu', this.selectedMenu, this.type);
    if (this.selectedMenu && this.type) {
      this.menuManagementService
        .updateMenu(this.selectedMenu, this.type)
        .then(async (data) => {
          await this.getAllData();
          this.alertify.presentToast('Menu Fetched Successfully');
        })
        .catch((err) => {
          this.alertify.presentToast('Menu Update Failed');
        });
    } else {
      this.alertify.presentToast('No Valid Menu Selected');
    }
  }

  selectCategory(cat: Category,userId?:string) {
    this.selectedCategory = cat;
    this.selectedUserViewCategory = userId;
    // console.log('this.selectedCategory', this.selectedCategory);
    if (this.selectedCategory.id == 'allProducts') {
      // sort products by name
      this.selectedCategory.products.sort((a, b) => {
        if (a.name && b.name) {
          return a.name.localeCompare(b.name);
        } else {
          return 0;
        }
      });
      this.fuseInstance.setCollection(this.products);
    } else {
      this.fuseInstance.setCollection(this.selectedCategory.products);
    };
    // reset all variables of searches
    this.searchFormControl.setValue('');
    this.categoryUpdated = false;
  }

  addMainCategory() {
    let unusedProducts = this.products.filter(
      (product) => !product?.category?.id,
    );
    // console.log('unusedProducts', unusedProducts);
    const dialog = this.dialog.open(AddMainCategoryComponent);
  }

  async deleteViewCategory() {
    if (
      await this.dataProvider.confirm('Are you sure you want to delete', [1])
    ) {
      this.dataProvider.loading = true;
      // console.log("deleteing view category of user",this.selectedUserViewCategory);
      this.menuManagementService
        .deleteViewCategory(this.selectedMenuId, this.selectedCategory.id,this.selectedUserViewCategory)
        .then((data) => {
          this.alertify.presentToast('Category Deleted Successfully');
          this.viewCategories = this.viewCategories.filter(
            (cat) => cat.id != this.selectedCategory.id,
          );
          this.getViewCategories();
          this.selectedCategory = this.allProductsCategory;
          this.currentType = 'all';
        })
        .catch((err) => {
          this.alertify.presentToast('Category Delete Failed');
        })
        .finally(() => {
          this.dataProvider.loading = false;
        });
    }
  }

  async deleteMainCategory(){
    if (
      await this.dataProvider.confirm('Are you sure you want to delete.', [1],{
        description:'All the dishes inside this main category will also get deleted.'
      })
    ) {
      this.dataProvider.loading = true;
      this.menuManagementService
        .deleteMainCategory(this.selectedMenuId, this.selectedCategory)
        .then((data) => {
          this.alertify.presentToast('Category Deleted Successfully');
          this.mainCategories = this.mainCategories.filter(
            (cat) => cat.id != this.selectedCategory.id,
          );
          this.getMainCategories();
          this.selectedCategory = this.allProductsCategory;
          this.currentType = 'all';
        })
        .catch((err) => {
          this.alertify.presentToast('Category Delete Failed');
        })
        .finally(() => {
          this.dataProvider.loading = false;
        });
    }
  }

  addViewCategory(userId:string) {
    const dialog = this.dialog.open(AddNewCategoryComponent, {
      data: { products: this.products,userId },
    });
    dialog.closed.subscribe((data: any) => {
      if (data) {
        // if (debug) console.log('data', data);
        this.activateCategory = data;
        this.viewCategories.push(data);
      }
      this.getViewCategories();
    });
  }

  reorderViewCategory(event: any) {
    moveItemInArray(
      this.viewCategories,
      event.previousIndex,
      event.currentIndex,
    );
    this.viewCategories.forEach((cat, index) => {
      cat.order = index + 1;
      cat.updated = true;
    });
  }

  reorderRecommendedCategory(event: any) {
    moveItemInArray(
      this.recommendedCategories,
      event.previousIndex,
      event.currentIndex,
    );
    this.recommendedCategories.forEach((cat, index) => {
      cat.order = index + 1;
      cat.updated = true;
    });
  }

  reorderMainCategory(event: any) {
    moveItemInArray(
      this.mainCategories,
      event.previousIndex,
      event.currentIndex,
    );
    this.mainCategories.forEach((cat, index) => {
      cat.order = index + 1;
      cat.updated = true;
    });
  }

  disableAll() {
    if (this.selectedCategory) {
      this.selectedCategory.products.forEach((product) => {
        product.visible = false;
        product.updated = true;
      });
      this.selectedCategory.updated = true;
      this.productVisibilityChanged = true;
    } else {
      this.alertify.presentToast('No Valid Category');
    }
  }

  enableAll() {
    if (this.selectedCategory) {
      this.selectedCategory.products.forEach((product) => {
        product.visible = true;
        product.updated = true;
      });
      this.selectedCategory.updated = true;
      this.productVisibilityChanged = true;
    } else {
      this.alertify.presentToast('No Valid Category');
    }
  }

  recommendationSave(id: string) {
    if (this.selectedMenu) {
      // console.log('this.products', this.products);
      if (id == 'highRange') {
        // console.log('this.highRangeForm.value', this.highRangeForm.value);
        if (this.highRangeForm.value.min && this.highRangeForm.value.max) {
          var filteredList = this.products.filter(
            (product) =>
              product.price >= this.highRangeForm.value.min &&
              product.price <= this.highRangeForm.value.max,
          );
        } else if (this.highRangeForm.value.min) {
          var filteredList = this.products.filter(
            (product) => product.price >= this.highRangeForm.value.min,
          );
        } else if (this.highRangeForm.value.max) {
          var filteredList = this.products.filter(
            (product) => product.price <= this.highRangeForm.value.max,
          );
        } else {
          var filteredList = this.products;
        }
        let currSelectedCategory = this.selectedCategory;
        if (currSelectedCategory && this.selectedCategory) {
          this.selectedCategory.products = filteredList;
          // console.log('this.selectedCategory', this.selectedCategory.products);
          currSelectedCategory.loading = true;
        }
        this.menuManagementService
          .setSettingsMenu(
            this.highRangeForm.value,
            'highRange',
            filteredList.map((p) => p.id),
            this.selectedMenu,
          )
          .then(async (data: any) => {
            await this.getRecommendedCategories();
            this.alertify.presentToast('Settings Updated Successfully');
          })
          .catch((err) => {
            this.alertify.presentToast('Settings Update Failed');
          })
          .finally(() => {
            if (currSelectedCategory) {
              currSelectedCategory.loading = false;
            }
          });
      } else if (id == 'lowRange') {
        // console.log('this.lowRangeForm.value', this.lowRangeForm.value);
        if (this.lowRangeForm.value.min && this.lowRangeForm.value.max) {
          var filteredList = this.products.filter(
            (product) =>
              product.price >= this.lowRangeForm.value.min &&
              product.price <= this.lowRangeForm.value.max,
          );
        } else if (this.lowRangeForm.value.min) {
          var filteredList = this.products.filter(
            (product) => product.price >= this.lowRangeForm.value.min,
          );
        } else if (this.lowRangeForm.value.max) {
          var filteredList = this.products.filter(
            (product) => product.price <= this.lowRangeForm.value.max,
          );
        } else {
          var filteredList = this.products;
        }
        // console.log('filteredList', filteredList);
        let currSelectedCategory = this.selectedCategory;
        if (currSelectedCategory && this.selectedCategory) {
          this.selectedCategory.products = filteredList;
          // console.log('this.selectedCategory', this.selectedCategory.products);
          currSelectedCategory.loading = true;
        }
        this.menuManagementService
          .setSettingsMenu(
            this.lowRangeForm.value,
            'lowRange',
            filteredList.map((p) => p.id),
            this.selectedMenu,
          )
          .then(async (data: any) => {
            await this.getRecommendedCategories();
            this.alertify.presentToast('Settings Updated Successfully');
          })
          .catch((err) => {
            this.alertify.presentToast('Settings Update Failed');
          })
          .finally(() => {
            if (currSelectedCategory) {
              currSelectedCategory.loading = false;
            }
          });
      } else if (id == 'mostSelling') {
        // sort products by sales
        let sortedProducts = this.products.sort((a, b) => {
          if (a.sales && b.sales) {
            return b.sales - a.sales;
          } else {
            return 0;
          }
        });
        // slice first this.mostSellingForm.value.numberOfProducts products
        let filteredList = sortedProducts.slice(
          0,
          this.mostSellingForm.value.numberOfProducts,
        );
        let currSelectedCategory = this.selectedCategory;
        if (currSelectedCategory && this.selectedCategory) {
          this.selectedCategory.products = filteredList;
          // console.log('this.selectedCategory', this.selectedCategory.products);
          currSelectedCategory.loading = true;
        }
        // console.log('filteredList', filteredList);
        this.menuManagementService
          .setSettingsMenu(
            this.mostSellingForm.value,
            'mostSelling',
            filteredList.map((p) => p.id),
            this.selectedMenu,
          )
          .then(async (data: any) => {
            await this.getRecommendedCategories();
            this.alertify.presentToast('Settings Updated Successfully');
          })
          .catch((err) => {
            this.alertify.presentToast('Settings Update Failed');
          })
          .finally(() => {
            if (currSelectedCategory) {
              currSelectedCategory.loading = false;
            }
          });
      } else if (id == 'newDishes') {
        // console.log('this.newDishesForm.value', this.newDishesForm.value);
        // var filteredList = this.products.filter(product => product.createdDate.toDate().getTime() >= this.newDishesForm.value.min.getTime() && product.createdDate.toDate().getTime() <= this.newDishesForm.value.max.getTime());
        // sort products based upon their update or creation date
        let sortedProducts = this.products.sort((a, b) => {
          if (a.createdDate && b.createdDate) {
            return b.createdDate?.toDate().getTime() - a.createdDate?.toDate().getTime();
          } else {
            return 0;
          }
        });
        // slice first this.newDishesForm.value.numberOfProducts products
        let filteredList = sortedProducts.slice(
          0,
          this.newDishesForm.value.numberOfProducts,
        );
        let currSelectedCategory = this.selectedCategory;
        if (currSelectedCategory && this.selectedCategory) {
          this.selectedCategory.products = filteredList;
          // console.log('this.selectedCategory', this.selectedCategory.products);
          currSelectedCategory.loading = true;
        }
        this.menuManagementService
          .setSettingsMenu(
            this.newDishesForm.value,
            'newDishes',
            filteredList.map((p) => p.id),
            this.selectedMenu,
          )
          .then(async (data: any) => {
            await this.getRecommendedCategories();
            this.alertify.presentToast('Settings Updated Successfully');
          })
          .catch((err) => {
            this.alertify.presentToast('Settings Update Failed');
          })
          .finally(() => {
            if (currSelectedCategory) {
              currSelectedCategory.loading = false;
            }
          });
      }
    } else {
      this.alertify.presentToast('Please Select Menu');
    }
  }

  addRecipe(menuId: string) {
    let dialog = this.dialog.open(AddDishComponent, {
      data: { 
        mode: 'add', 
        menu: this.selectedMenu,
        mainCategories: this.mainCategories,
        viewCategories: this.viewCategories
      },
    });
    firstValueFrom(dialog.closed)
      .then(async (data: any) => {
        if (data) {
          let printerConfigs = await this.menuManagementService.getPrinterList(
            this.selectedMenu,
          );
          if (data.mainCategory.products) {
            delete data.mainCategory.products;
          }
          // console.log('category data', category);
          let selectedViewCategories = data.viewCategories.filter(
            (c) => c.selected,
          );
          // this.mainCategories
          this.dataProvider.loading = true;
          let product: Product = {
            category: data.mainCategory,
            itemType: 'product',
            createdDate: Timestamp.now(),
            images: [],
            sellByAvailable: data.sellByAvailable,
            name: data.name,
            price: data.price,
            quantity: 1,
            selected: false,
            type: data.type,
            tags: [],
            variants: [],
            visible: true,
            taxes: data.taxes || [],
          };
          let productRes = await this.productService.addRecipe(product, menuId);
          let printer = printerConfigs.find(
            (printer) => printer.printerName == data.specificPrinter,
          );
          if (printer) {
            printer.dishesId.push(productRes.id);
          } else {
            printerConfigs.push({
              printerName: data.specificPrinter,
              dishesId: [productRes.id],
            });
          }
          await this.menuManagementService.updatePrinterList(
            this.selectedMenu,
            printerConfigs,
          );
          let rootCategoryRes =
            await this.menuManagementService.updateRootCategory(
              data.mainCategory.id,
              [productRes.id],
            );
          let viewCategoryRes = await Promise.all(
            selectedViewCategories.map((c) => {
              return this.menuManagementService.updateViewCategory(c.id, [
                productRes.id,
              ]);
            }),
          );
          this.alertify.presentToast('Recipe Added Successfully');
          alert("Product has been added. The new product is uploaded with no taxes. Update product taxes from the edit menu.")
        }
      })
      .catch((err) => {
        // console.log('Recipe add error', err);
        this.alertify.presentToast('Recipe Added Failed');
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }

  setTaxes(product: Product) {

    const dialog = this.dialog.open(SetTaxComponent, {
      data: { product, menu: this },
    });
    firstValueFrom(dialog.closed).then((data: any) => {
      // console.log('data', data);
      if (data) {
        product.updated = true;
        let filteredTax = data.taxes
          .filter((tax) => tax.checked)
          .map((tax) => {
            delete tax.checked;
            return { ...tax, nature: data.type };
          });
        this.dataProvider.loading = true;
        // product = { ...product, ...data };
        // console.log("New Product Data",data);
        product.taxes = filteredTax;
        // console.log('Updating product with tax', product);
        this.productService
          .updateRecipe(structuredClone(product), this.selectedMenuId)
          .then((data: any) => {
            this.alertify.presentToast('Taxes Updated Successfully');
          })
          .catch((err) => {
            // console.log('err', err);
            this.alertify.presentToast('Taxes Update Failed');
          })
          .finally(() => {
            this.dataProvider.loading = false;
          });
      }
    });
  }

  selectRecipe() {
    const dialog = this.dialog.open(SelectRecipeComponent, {
      data: this.products,
    });
    dialog.closed.subscribe((data: any) => {
      if (data) {
        if (this.selectedCategory) {
          const ids: string[] = data
            .filter((d: Product) => d.selected)
            .map((product: Product) => product.id);
          this.menuManagementService
            .updateViewCategory(this.selectedCategory.id, ids)
            .then((data: any) => {
              this.alertify.presentToast('Category Updated Successfully');
            })
            .catch((err) => {
              this.alertify.presentToast('Category Update Failed');
            });
          this.selectedCategory.products.push(
            ...data.filter((product: Product) => product.selected),
          );
        }
      }
    });
  }

  async editRecipe(product: Product, menuId: string) {
    try {
      let dialog = this.dialog.open(AddDishComponent, {
        data: { mode: 'edit', product, menu: this.selectedMenu },
      });
      product.updated = true;
      let data = await firstValueFrom(dialog.closed);
      if (typeof data == 'object') {
        let printerConfigs = await this.menuManagementService.getPrinterList(
          this.selectedMenu,
        );
        await this.productService.updateRecipe(
          { ...product, ...data },
          menuId,
        );
        // console.log("Updated recipe with new data",data);
        
        let printer = printerConfigs.find(
          (printer) => printer.printerName == data['specificPrinter'],
        );
        if (printer) {
          printer.dishesId.push(product.id);
        } else {
          printerConfigs.push({
            printerName: data['specificPrinter'],
            dishesId: [product.id],
          });
        }
        await this.menuManagementService.updatePrinterList(
          this.selectedMenu,
          printerConfigs,
        );
        // console.log("New Product Data",data);
        product = { ...product, ...data, updated: true };
        let foundProduct = this.dataProvider.menus
          .find((menu: ModeConfig) => menu.selectedMenuId == menuId)
          .products.find((p: Product) => p.id == product.id);
        // console.log("UPDATING global category products",foundProduct);
        if (foundProduct) {
          foundProduct = product;
        }
        let localProduct = this.selectedCategory.products.find(
          (p: Product) => p.id == product.id,
        );
        // console.log("UPDATING local category",localProduct);
        if (localProduct) {
          localProduct.name = product.name;
          localProduct.price = product.price;
          localProduct.type = product.type;
          localProduct.specificPrinter = product.specificPrinter || null;
        }
        this.alertify.presentToast('Recipe Updated Successfully');
      }
    } catch (error) {
      // console.log(error);
      this.alertify.presentToast('Recipe Updated Failed');
    } finally {
      this.dataProvider.loading = false;
    }
  }

  async deleteRecipe(product: Product, menuId: string) {
    if (['all','root'].includes(this.currentType)) {
      this.dataProvider
        .confirm('Are you sure you want to delete this recipe?', [1])
        .then((data) => {
          if (data) {
            this.dataProvider.loading = true;
            this.productService
              .deleteProduct(product.id, menuId)
              .then((data: any) => {
                this.alertify.presentToast('Recipe Deleted Successfully');
                // remove from products
                this.products = this.products.filter(
                  (p: Product) => p.id != product.id,
                );
                this.selectedCategory.products =
                  this.selectedCategory.products.filter(
                    (p: Product) => p.id != product.id,
                  );
              })
              .catch((err) => {
                this.alertify.presentToast('Recipe Delete Failed');
              })
              .finally(() => {
                this.dataProvider.loading = false;
              });
          } else {
            this.alertify.presentToast('Recipe Delete Cancelled');
          }
        });
    } else if (['view'].includes(this.currentType)) {
      if (
        await this.dataProvider.confirm('Are you sure you want to remove this product from this category', [1])
      ){
        this.selectedCategory.products = this.selectedCategory.products.filter(
          (p: Product) => p.id != product.id,
        );
        if (this.selectedCategory.productOrders) {
          this.selectedCategory.productOrders =
            this.selectedCategory.productOrders.filter((p) => p != product.id);
        } else {
          this.selectedCategory.productOrders =
            this.selectedCategory.products.map((p: Product) => p.id);
        }
        this.selectedCategory.updated = true;
      }
    } else {
      this.alertify.presentToast('Cannot delete from this category');
    }
  }

  addUploadedRecipe() {
    // edit category using AddNewCategoryComponent
    const dialog = this.dialog.open(AddNewCategoryComponent, {
      data: {
        mode: 'edit',
        products: this.selectedCategory.products,
        category: this.selectedCategory,
      },
    });
    dialog.closed.subscribe((data: any) => {
      // console.log('data', data);
      if (data) {
        this.selectedCategory.products = data.products;
        this.selectedCategory.productOrders = data.productOrders;
        this.selectedCategory.name = data.name;
        this.selectedCategory.updated = true;
        this.selectedCategory.enabled = true;
        // console.log('this.selectedCategory', this.selectedCategory);
      }
    });
  }

  reorderProduct(event: any) {
    moveItemInArray(
      this.selectedCategory.products,
      event.previousIndex,
      event.currentIndex,
    );
    let previousOrder = structuredClone(this.selectedCategory.productOrders);
    // console.log("this.selectedCategory.productOrders",previousOrder);
    this.selectedCategory.productOrders = this.selectedCategory.products.map(
      (product: Product) => {
        return product.id;
      },
    );
    // console.log("this.selectedCategory.productOrders",previousOrder,this.selectedCategory.productOrders);
    this.selectedCategory.updated = true;
  }

  async updateChanged() {
    let menus = await firstValueFrom(this.dataProvider.allMenus);
    this.selectedMenu = menus.find((menu: Menu) => {
      // console.log(menu.id, this.selectedMenuId, menu.id == this.selectedMenuId);
      return menu.id == this.selectedMenuId;
    });
    // console.log('selectedMenu', this.selectedMenu);
    if (this.selectedMenu) {
      let updatableProducts = this.products.filter(
        (product: Product) => product.updated,
      );
      // console.log('updatableProducts', updatableProducts);
      let updatablerecommendedCategories = this.recommendedCategories.filter(
        (category: Category) => category.updated,
      );
      let updatableviewCategories = this.viewCategories.filter(
        (category: Category) => category.updated,
      );
      let updatablemainCategories = this.mainCategories.filter(
        (category: Category) => category.updated,
      );
      // console.log("updatable main categories",updatablemainCategories);
      let updateRequestProducts = updatableProducts.map((product: Product) =>
        this.menuManagementService.updateProductMenu(
          { ...product, updated: false },
          this.selectedMenu!,
        ),
      );
      let updateRequestrecommendedCategories =
        updatablerecommendedCategories.map((category: Category) =>
          this.menuManagementService.updateRecommendedCategoryMenu(
            {
              ...category,
              products: category.products.map((p) => p.id),
              updated: false,
            },
            this.selectedMenu!,
          ),
        );
      let updateRequestviewCategories = updatableviewCategories.map(
        (category: Category) =>
          this.menuManagementService.updateViewCategoryMenu(
            {
              ...category,
              products: category.products.map((p) => p.id),
              disabled: category.products
                .filter((d) => !d.visible)
                .map((d) => d.id),
              updated: false,
            },
            this.selectedMenu!,
          ),
      );
      let updateRequestmainCategories = updatablemainCategories.map(
        (category: Category) =>
          this.menuManagementService.updateMainCategoryMenu(
            {
              ...category,
              products: category.products.map((p) => p.id),
              disabled: category.products
                .filter((d) => !d.visible)
                .map((d) => d.id),
              updated: false,
            },
            this.selectedMenu!,
          ),
      );
      // stats
      
      let updates = await Promise.all(
        [
          updateRequestProducts,
          updateRequestmainCategories,
          updateRequestrecommendedCategories,
          updateRequestviewCategories,
        ].flat(),
      );
      // console.log("Updates",updates);
      if (updates.length > 0){
        this.menuManagementService.updateMenuVersionRequest.next(this.selectedMenuId)
      }
      return updates;
    } else {
      return Promise.reject('Please Select Menu');
    }
  }

  save() {
    this.dataProvider.loading = true;
    this.updateChanged()
      .then(async (data: any) => {
        await this.getAllData();
        this.alertify.presentToast('Menu Updated Successfully');
      })
      .catch((err) => {
        this.alertify.presentToast('Menu Update Failed');
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }

  getExcelFormat() {}

  openProductCosting(product: Product) {
    this.dialog.open(ProductCostingComponent, { data: product });
  }

  // new implementations

  async getTaxes() {
    this.loadingTax = true;
    let taxes = await this.menuManagementService.getTaxes(this.selectedMenu.id);
    this.taxes = taxes.docs.map((d) => {
      return { ...d.data(), id: d.id } as Tax;
    });
    this.taxesSearchInstance.setCollection(this.taxes);
    this.loadingTax = false;
  }

  addTax() {
    const dialog = this.dialog.open(AddTaxComponent, { data: { mode: 'add' } });
    firstValueFrom(dialog.closed)
      .then((data: any) => {
        //  console.log('data', data);
        if (data) {
          this.dataProvider.loading = true;
          this.menuManagementService
            .addTax(
              {
                ...data,
                creationDate: new Date(),
                updateDate: new Date(),
              },
              this.selectedMenu.id,
            )
            .then((res) => {
              this.alertify.presentToast('Tax added successfully');
              this.getTaxes();
            })
            .catch((err) => {
              this.alertify.presentToast('Error while adding tax');
            })
            .finally(() => {
              this.dataProvider.loading = false;
            });
        } else {
          this.alertify.presentToast('Cancelled adding tax');
        }
      })
      .catch((err: any) => {
        this.alertify.presentToast('Error while adding tax');
      });
  }

  editTax(tax: Tax) {
    const dialog = this.dialog.open(AddTaxComponent, {
      data: { mode: 'edit', setting: tax },
    });
    firstValueFrom(dialog.closed)
      .then((data: any) => {
        //  console.log('data', data);
        if (data) {
          this.menuManagementService
            .updateTax(
              tax.id,
              { ...data, updateDate: Timestamp.now() },
              this.selectedMenu.id,
            )
            .then((res) => {
              this.alertify.presentToast('Tax updated successfully');
              this.getTaxes();
            })
            .catch((err) => {
              this.alertify.presentToast('Error while updating tax');
            });
        } else {
          this.alertify.presentToast('Cancelled updating tax');
        }
      })
      .catch((err: any) => {
        this.alertify.presentToast('Error while updating tax');
      });
  }

  async deleteTax(id: string) {
    if (
      await this.dataProvider.confirm('Are you sure you want to delete tax ?', [
        1,
      ])
    ) {
      this.menuManagementService
        .deleteTax(id, this.selectedMenu.id)
        .then((res) => {
          this.alertify.presentToast('Tax deleted successfully');
        })
        .catch((err) => {
          this.alertify.presentToast('Error while deleting tax');
        });
    }
  }

  // discounts

  updateSettings() {
    this.dataProvider.loading = true;
    this.menuManagementService
      .updateRootSettings(
        { multipleDiscount: this.dataProvider.multipleDiscount },
        this.dataProvider.businessId,
      )
      .then(() => {
        this.alertify.presentToast('Settings updated successfully');
      })
      .catch((err) => {
        this.alertify.presentToast('Error while updating settings');
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }

  addDiscount() {
    const dialog = this.dialog.open(AddDiscountComponent, {
      data: { mode: 'add' },
    });
    dialog.closed.subscribe((data: any) => {
      //  console.log('data', data);
      if (data) {
        this.dataProvider.loading = true;
        //  console.log('adding', data);
        this.menuManagementService
          .addDiscount(
            {
              ...data,
              mode: 'codeBased',
              totalAppliedDiscount: 0,
              creationDate: Timestamp.now(),
              reason: '',
            } as CodeBaseDiscount,
            this.selectedMenu.id,
          )
          .then((res) => {
            //  console.log('res', res);
            this.getDiscounts();
            this.alertify.presentToast('Discount added successfully');
          })
          .catch((err) => {
            //  console.log('err', err);
            this.alertify.presentToast('Error adding discount');
          })
          .finally(() => {
            this.dataProvider.loading = false;
          });
      } else {
        //  console.log('no data', data);
      }
    });
  }

  async getDiscounts() {
    this.loadingDiscount = true;
    let res = await this.menuManagementService.getDiscounts(
      this.selectedMenu.id,
    );
    this.discounts = [];
    res.forEach((data) => {
      this.discounts.push({
        ...data.data(),
        id: data.id,
      } as CodeBaseDiscount);
    });
    this.discountsSearchInstance.setCollection(this.discounts);
    this.loadingDiscount = false;
  }

  async getMappedMenu(menus?: string[]) {
    if (!menus) return [];
    let allMenus = await firstValueFrom(this.dataProvider.allMenus);
    return allMenus.filter((menu) =>
      menus.includes(menu.id!),
    );
  }

  editDiscount(discount: CodeBaseDiscount) {
    //  console.log('discount', discount);
    const dialog = this.dialog.open(AddDiscountComponent, {
      data: { mode: 'edit', discount: discount },
    });
    dialog.closed.subscribe((data: any) => {
      //  console.log('data', data);
      if (data) {
        //  console.log('adding', data);
        this.menuManagementService
          .updateDiscount(
            discount.id,
            { ...discount, ...data } as CodeBaseDiscount,
            this.selectedMenu.id,
          )
          .then((res) => {
            //  console.log('res', res);
            this.getDiscounts();
            this.alertify.presentToast('Discount update successfully');
          })
          .catch((err) => {
            //  console.log('err', err);
            this.alertify.presentToast('Error updating discount');
          });
      } else {
        //  console.log('no data', data);
      }
    });
  }

  async deleteDiscount(discountId: string) {
    if (
      await this.dataProvider.confirm('Are you sure you want to delete', [1])
    ){
      this.dataProvider.loading = true;
      this.menuManagementService
        .deleteDiscount(discountId, this.selectedMenu.id)
        .then(() => {
          this.alertify.presentToast('Discount deleted successfully');
          this.getDiscounts();
        })
        .catch((err) => {
          this.alertify.presentToast('Error while deleting discount');
        })
        .finally(() => {
          this.dataProvider.loading = false;
        });
    }
  }

  // combo

  addCombo() {
    const dialog = this.dialog.open(AddComboComponent, {
      data: { mode: 'add', menu: this },
    });
    dialog.closed.subscribe((data: any) => {
      // console.log('data', data);
      if (data) {
        this.menuManagementService
          .addCombo(
            {
              ...data,
              creationDate: serverTimestamp(),
              updateDate: serverTimestamp(),
            },
            this.selectedMenu,
          )
          .then((res) => {
            this.alertify.presentToast('Combo added successfully');
            this.getComboCategories();
          })
          .catch((err) => {
            this.alertify.presentToast('Error while adding combo');
          });
      } else {
        this.alertify.presentToast('Cancelled adding combo');
      }
    });
  }

  editCombo(combo: Combo) {
    const dialog = this.dialog.open(AddComboComponent, {
      data: { mode: 'edit', combo: combo, menu: this },
    });
    dialog.closed.subscribe((data: any) => {
      if (data) {
        this.menuManagementService
          .updateCombo({ ...combo, ...data }, this.selectedMenu)
          .then((res) => {
            this.alertify.presentToast('Combo updated successfully');
            this.getComboCategories();
          })
          .catch((err) => {
            this.alertify.presentToast('Error while updating combo');
          });
      } else {
        this.alertify.presentToast('Cancelled updating combo');
      }
    });
  }

  async deleteCombo(event:any,combo: Combo) {
    event.stopPropagation();
    if (
      await this.dataProvider.confirm('Are you sure you want to delete', [1])
    ){
      this.menuManagementService
        .deleteCombo(combo, this.selectedMenu)
        .then(() => {
          this.alertify.presentToast('Combo deleted successfully');
          this.getComboCategories();
        })
        .catch((err) => {
          this.alertify.presentToast('Error while deleting combo');
        });
    }
  }

  // time group

  getTimeGroups() {
    this.loadingTimeGroups = true;
    this.menuManagementService
      .getTimeGroups(this.selectedMenu.id)
      .then((res) => {
        this.timeGroups = [];
        res.forEach((data) => {
          this.timeGroups.push({ ...data.data(), id: data.id } as TimeGroup);
        });
      })
      .catch((err) => {
        this.alertify.presentToast('Error while fetching time groups');
      })
      .finally(() => {
        this.loadingTimeGroups = false;
      });
  }

  addTimeGroup() {
    const dialog = this.dialog.open(AddTimeGroupComponent, {
      data: { mode: 'add' },
    });
    dialog.closed.subscribe((data: any) => {
      if (data) {
        this.menuManagementService
          .addTimeGroup(
            { ...data, creationDate: Timestamp.now() },
            this.selectedMenu,
          )
          .then((res) => {
            this.alertify.presentToast('Time group added successfully');
            this.menuManagementService.getTimeGroups(this.selectedMenu.id);
          })
          .catch((err) => {
            this.alertify.presentToast('Error while adding time group');
          });
      } else {
        this.alertify.presentToast('Cancelled adding time group');
      }
    });
  }

  editTimeGroup(timeGroup: TimeGroup) {
    const dialog = this.dialog.open(AddTimeGroupComponent, {
      data: { mode: 'edit', timeGroup: timeGroup },
    });
    dialog.closed.subscribe((data: any) => {
      if (data) {
        this.menuManagementService
          .updateTimeGroup({ ...timeGroup, ...data }, this.selectedMenu)
          .then((res) => {
            this.alertify.presentToast('Time group updated successfully');
            this.menuManagementService.getTimeGroups(this.selectedMenu.id);
          })
          .catch((err) => {
            this.alertify.presentToast('Error while updating time group');
          });
      } else {
        this.alertify.presentToast('Cancelled updating time group');
      }
    });
  }

  async deleteTimeGroup(timeGroup: TimeGroup) {
    if (
      await this.dataProvider.confirm('Are you sure you want to delete', [1])
    ){
      this.menuManagementService
        .deleteTimeGroup(timeGroup, this.selectedMenu)
        .then(() => {
          this.alertify.presentToast('Time group deleted successfully');
          this.menuManagementService.getTimeGroups(this.selectedMenu.id);
        })
        .catch((err) => {
          this.alertify.presentToast('Error while deleting time group');
        });
    }
  }

  // Loyalty CRUD

  async getLoyaltySettings() {
    this.loadingLoyaltySettings = true;
    let res = await this.menuManagementService.getLoyaltySettings(
      this.selectedMenuId,
    );
    this.loyaltySettings = [];
    res.forEach((data) => {
      this.loyaltySettings.push({
        ...data.data(),
        id: data.id,
      } as LoyaltySetting);
    });
    // console.log('this.loyaltySettings', this.loyaltySettings);
    this.loadingLoyaltySettings = false;
  }

  addLoyaltySettings() {
    const comp = this.dialog.open(AddLoyaltySettingComponent, {
      data: { menu: this,mode:'add' },
    });
    firstValueFrom(comp.closed).then((data: any) => {
      // console.log('Data', data);
      if (data && typeof data == 'object') {
        this.menuManagementService
          .addLoyaltySetting(data, this.selectedMenuId)
          .then((res) => {
            this.alertify.presentToast('Loyalty Setting added');
            this.getLoyaltySettings();
          })
          .catch((error) => {
            // console.log(error);
            this.alertify.presentToast(
              'Unable to add loyalty setting',
              'error',
            );
          });
      } else {
        this.alertify.presentToast('Operation cancelled !!!');
      }
    });
  }

  cancelLoyaltySetting(setting, index: number) {
    this.loyaltySettings.splice(index, 1);
  }

  editLoyaltySetting(loyaltySetting: LoyaltySetting) {
    const comp = this.dialog.open(AddLoyaltySettingComponent, {
      data: { menu: this,loyaltySetting,mode:'edit' },
    });
    firstValueFrom(comp.closed).then((data: any) => {
      // console.log('Data', data);
      if (data && typeof data == 'object') {
        this.menuManagementService
          .editLoyalSetting({...loyaltySetting,...data}, this.selectedMenuId)
          .then((res) => {
            this.alertify.presentToast('Loyalty Setting added');
            this.getLoyaltySettings();
          })
          .catch((error) => {
            // console.log(error);
            this.alertify.presentToast(
              'Unable to add loyalty setting',
              'error',
            );
          });
      } else {
        this.alertify.presentToast('Operation cancelled !!!');
      }
    });
  }

  async deleteLoyaltySetting(loyaltySetting: LoyaltySetting) {
    if(await this.dataProvider.confirm('Are you sure you want to delete?',[1])){
      this.menuManagementService.deleteLoyaltySetting(loyaltySetting.id,this.selectedMenuId)
    }
  }

  selectLoyaltySetting(value: any) {
    // console.log('Log', value);
    this.menuManagementService
      .selectLoyalty(value.value, this.selectedMenuId)
      .then(() => {
        this.alertify.presentToast('Loyalty Setting selected');
      });
  }

  setPrinterSettings() {
    const printerSetting = this.dialog.open(PrinterSettingComponent, {
      data: { menu: this },
    });
  }

  savePrinterSettings(printerSettings: PrinterSetting[]) {
    return this.menuManagementService.updatePrinterList(
      this.selectedMenu,
      printerSettings,
    );
  }

  getPrinterSettings() {
    return this.menuManagementService.getPrinterList(this.selectedMenu);
  }

  getDefaultPrinters() {
    return this.menuManagementService.getDefaultPrinter(this.selectedMenu);
  }

  updateDefaultPrinters(printer: { billPrinter: string; kotPrinter: string }) {
    console.log('Updating default printer', printer);
    return this.menuManagementService.updateDefaultPrinter(
      this.selectedMenu,
      printer,
    );
  }

  updateComboVisibility(combo: Combo, value: boolean) {
    // console.log('Updating combo', combo.enabled, value);
    combo.enabled = value;

    return this.menuManagementService.updateCombo(combo, this.selectedMenu);
  }

  hasValidTaxes(taxes: Tax[]) {
    // make sure that every tax is available in this.taxes
    return taxes.every((tax) => {
      return this.taxes.find((t) => t.id == tax.id);
    });
  }

  setBulkTaxes(products: Product[]) {
    const dialog = this.dialog.open(SetTaxComponent, {
      data: { product: products, menu: this },
    });
    firstValueFrom(dialog.closed).then((data: any) => {
      // console.log('data', data);
      if (data) {
        let filteredTax = data.taxes
          .filter((tax) => tax.checked)
          .map((tax) => {
            delete tax.checked;
            return { ...tax, nature: data.type };
          });
        this.dataProvider.loading = true;
        // product = { ...product, ...data };
        // console.log("New Product Data",data);
        products.forEach((p) => {
          p.taxes = filteredTax;
        });
        // console.log('Updating product with tax', products);
        this.productService
          .updateBulkProducts(products, this.selectedMenuId)
          .then((data: any) => {
            this.alertify.presentToast('Taxes Updated Successfully');
          })
          .catch((err) => {
            this.alertify.presentToast('Taxes Update Failed');
          })
          .finally(() => {
            this.dataProvider.loading = false;
          });
      }
    });
  }

  downloadProducts(products: Product[]) {
    function filter(textWithCommas:string):string{
      // should return text without commas
      return textWithCommas.split(',').join(' ');
    }
    // create a csv file with this format
    // name, category, price,veg/nonveg , half/full (half/full is optional),
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'name,category,price,veg/nonveg,half/full\n';
    
    products.forEach((product) => {
      csvContent += `${filter(product.name)},${filter(product.category?.name)},${product.price},${filter(product.type)},${product.tags.length ? (product.tags[0]?.name ? filter(product.tags[0].name) : '') : ''}\n`;
    });
    // download the file
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'menu_format.csv');
    document.body.appendChild(link); // Required for Firefox
    link.click(); // This will download the data file named "my_data.csv".
  }

  async deleteMenu(){
    let menus = await firstValueFrom(this.dataProvider.allMenus);
    // first switch to any other menu and then delete the current menu
    if(await this.dataProvider.confirm('Are you sure you want to delete this menu?',[1])){
      if (menus.length > 1) {
        let previousMenuId = structuredClone(this.selectedMenu.id);
        this.selectedMenuId = menus.find((menu) => menu.id != previousMenuId)!.id;
        if(this.dataProvider.currentSettings.dineInMenu){
          let modeConfig = this.dataProvider.menus.find((m)=>this.dataProvider.currentSettings?.dineInMenu?.id == m.selectedMenuId && m.type == 'dineIn');
          if (modeConfig){
            modeConfig.selectedMenuId = this.selectedMenuId;
            modeConfig.updateMenu();
          }
        }
        if(this.dataProvider.currentSettings.takeawayMenu){
          let modeConfig = this.dataProvider.menus.find((m)=>this.dataProvider.currentSettings?.takeawayMenu?.id == m.selectedMenuId && m.type == 'takeaway');
          if (modeConfig){
            modeConfig.selectedMenuId = this.selectedMenuId;
            modeConfig.updateMenu();
          }
        }
        if(this.dataProvider.currentSettings.onlineMenu){
          let modeConfig = this.dataProvider.menus.find((m)=>this.dataProvider.currentSettings?.onlineMenu?.id == m.selectedMenuId && m.type == 'online');
          if (modeConfig){
            modeConfig.selectedMenuId = this.selectedMenuId;
            modeConfig.updateMenu();
          }
        }
        this.updateMenu();
        await this.menuManagementService.deleteMenu(previousMenuId);
        this.alertify.presentToast('Menu deleted successfully');
      } else {
        alert("Cannot delete the only last menu. Please create another menu and then delete this menu.")
      }
    } else {
      this.alertify.presentToast('Cancelled deleting menu');
    }
  }

}

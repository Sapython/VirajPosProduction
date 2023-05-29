import { Injectable } from '@angular/core';
import { DataProvider } from '../../provider/data-provider.service';
import { getDocs, collection, addDoc, setDoc, doc, updateDoc, arrayUnion, DocumentReference, deleteDoc, Firestore } from '@angular/fire/firestore';
import { TableConstructor } from '../../../../types/table.structure';
import { Product } from '../../../../types/product.structure';
import { Menu } from '../../../../types/menu.structure';
import { Category } from '../../../../types/category.structure';
import { Table } from '../../../constructors/table/Table';
import { AnalyticsService } from '../analytics/analytics.service';
import { TableService } from '../table/table.service';
import { BillService } from '../bill/bill.service';
import { PrinterService } from '../../printing/printer/printer.service';

@Injectable({
  providedIn: 'root'
})
export class MenuManagementService {

  constructor(private dataProvider:DataProvider,private firestore:Firestore,private analyticsService:AnalyticsService,private printingService:PrinterService,private tableService:TableService,private billService:BillService) {
    // copy from viewCategories to currentUser
    // from: /business/t73tctq4kwdvbux2h22h6/menus/BKEPVUhtCXXL7YNrvUqx/viewCategories
    // to: /business/t73tctq4kwdvbux2h22h6/menus/BKEPVUhtCXXL7YNrvUqx/users/momoscastle/viewCategories
    // setTimeout(()=>{
    //   console.log("Getting viewCategoryies");
      
    //   getDocs(collection(this.firestore,'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/viewCategories')).then((res)=>{ 
    //     console.log("viewCategoryies res.docs",res.docs);
    //     if (res.docs.length > 0){
    //       res.docs.forEach((doc)=>{
    //         let data = doc.data();
    //         this.addViewCategory(data,doc.id);
    //         console.log("viewCategoryies Adding View Category",data);
    //       })
    //     }
    //   })
    // },10000)
  }
  getMenuData(){
    this.dataProvider.activeModes
  }
  getMainCategories() {
    return getDocs(
      collection(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/rootCategories')
    );
  }

  addViewCategory(category: any, id?: string) {
    if (!id)
      return addDoc(
        collection(
          this.firestore,
          'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/users/'+this.dataProvider.currentUser.username+'/viewCategories'
        ),
        category
      );
    return setDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/users/'+this.dataProvider.currentUser.username+'/viewCategories/' + id),
      category,
      { merge: true }
    );
  }

  addRootCategory(category: any, id?: string) {
    if (!id)
      return addDoc(
        collection(
          this.firestore,
          'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/rootCategories'
        ),
        category
      );
    console.log('business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/rootCategories/' + id);
    return setDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/rootCategories/' + id),
      category,
      { merge: true }
    );
  }

  getRootCategories() {
    return getDocs(
      collection(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/rootCategories')
    );
  }

  getViewCategories() {
    return getDocs(
      collection(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/users/'+this.dataProvider.currentUser.username+'/viewCategories')
    );
  }

  updateRootCategory(id:string,products:string[]){
    return updateDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/rootCategories/' + id),
      { products: arrayUnion(...products) }
    );
  }

  updateViewCategory(id: string, products: string[]) {
    return updateDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/users/'+this.dataProvider.currentUser.username+'/viewCategories/' + id),
      { products: arrayUnion(...products) }
    );
  }

  addRecommendedCategory(category: any) {
    return setDoc(
      doc(
        this.firestore,
        'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/recommendedCategories/' + category.id
      ),
      category,
      { merge: true }
    );
  }

  getRecommendedCategories() {
    return getDocs(
      collection(
        this.firestore,
        'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/recommendedCategories'
      )
    );
  }

  getIngredients() {
    return getDocs(
      collection(
        this.firestore,
        '/business/accounts/b8588uq3swtnwa1t83lla9/ingredients/ingredients'
      )
    );
  }

  updateProductVisiblity(id: string, visible: boolean) {
    return setDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/products/' + id),
      { visible: visible },
      { merge: true }
    );
  }

  updateCategoryVisiblity(id: string, type: string, enabled: boolean) {
    return setDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/' + type + '/' + id),
      { enabled: enabled },
      { merge: true }
    );
  }

  async addNewMenu(
    menu: Menu,
    catGroups: { name: string; products: Product[] }[],
    businessId?: string,
  ) {
    if (!businessId){
      businessId = this.dataProvider.businessId
    }
    try {
      let menuRes = await addDoc(
        collection(this.firestore, 'business/'+businessId+'/menus'),
        menu
      );
      let allProducts:Product[] = [];
      let productsRef:Promise<DocumentReference>[] = []
      let rootCategoriesRef = catGroups.forEach(async (catGroup) => {
        allProducts = [...allProducts, ...catGroup.products];
        let res = await addDoc(
          collection(
            this.firestore,
            'business/'+businessId+'/menus/' +
              menuRes.id +
              '/rootCategories'
          ),
          {
            name: catGroup.name,
            enabled: true
          }
        );
        catGroup.products.forEach((product) => {
          productsRef.push(
            addDoc(
              collection(
                this.firestore,
                'business/'+businessId+'/menus/' +
                  menuRes.id +
                  '/products/'
              ),
              {...product,category:{id:res.id,name:catGroup.name}}
            )
          );
        })
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
          products: allProducts.filter((product) => (product.sales||0) >= 100),
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
              'business/'+businessId+'/menus/' +
                menuRes.id +
                '/recommededCategories/' +
                category.id
            ),
            category,
            { merge: true }
          );
        })
      );
      console.log('New menu',menuRes.id);
      return { menuRes, productsRes, categoriesRes };
    } catch (error) {
      throw error;
    }
  }

  getRootProducts() {
    return getDocs(collection(this.firestore, 'productsCollection'));
  }
  getMenus(){
    return getDocs(collection(this.firestore, 'business/'+this.dataProvider.businessId+'/menus'));
  }
  updateMenu(menu:Menu,type:'dineIn'|'takeaway'|'online'){
    if (type=='dineIn'){
      return setDoc(
        doc(this.firestore, 'business/'+this.dataProvider.businessId+'/settings/settings/'),
        {dineInMenu:menu},
        { merge: true }
      );
    } else if (type=='takeaway'){
      return setDoc(
        doc(this.firestore, 'business/'+this.dataProvider.businessId+'/settings/settings/'),
        {takeawayMenu:menu},
        { merge: true }
      );
    } else if (type=='online'){
      return setDoc(
        doc(this.firestore, 'business/'+this.dataProvider.businessId+'/settings/settings/'),
        {onlineMenu:menu},
        { merge: true }
      );
    } else {
      return Promise.reject('Invalid type');
    }
  }

  getRecommendedCategoriesByMenu(menu:Menu){
    return getDocs(
      collection(
        this.firestore,
        'business/'+this.dataProvider.businessId+'/menus/' +
          menu.id +
          '/recommededCategories/'
      ),
    )
  }

  getViewCategoriesByMenu(menu:Menu){
    return getDocs(
      collection(
        this.firestore,
        'business/'+this.dataProvider.businessId+'/menus/' +
          menu.id+'/users/'+this.dataProvider.currentUser.username +
          '/viewCategories/'
      ),
    )
  }

  getMainCategoriesByMenu(menu:Menu){
    return getDocs(
      collection(
        this.firestore,
        'business/'+this.dataProvider.businessId+'/menus/' +
          menu.id +
          '/rootCategories/'
      ),
    )
  }

  updateProductMenu(product:any,menu:Menu){
    return setDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/' + menu.id + '/products/' + product.id),
      product,
      { merge: true }
    );
  }

  updateRecommendedCategoryMenu(category:any,menu:Menu){
    return setDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/' + menu.id + '/recommededCategories/' + category.id),
      category,
      { merge: true }
    );
  }

  updateViewCategoryMenu(category:any,menu:Menu){
    return setDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/' + menu.id+'/users/'+this.dataProvider.currentUser.username + '/viewCategories/' + category.id),
      category,
      { merge: true }
    );
  }

  updateMainCategoryMenu(category:any,menu:Menu){
    return setDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/' + menu.id + '/rootCategories/' + category.id),
      category,
      { merge: true }
    );
  }
  
  setSettingsMenu(data: any, type: string, productList: string[],menu:Menu) {
    return setDoc(
      doc(
        this.firestore,
        '/business/'+this.dataProvider.businessId+'/menus/'+menu.id+'/recommededCategories/' + type
      ),
      { settings: data, products: productList },
      { merge: true }
    );
  }

  setPrinter(menu:Menu,category:Category){
    console.log('setPrinter',category);
    // update every product in this category with the new printer
    category.products.forEach((product:any)=>{
      this.updateProductMenu({category:{
        id:category.id,
        name:category.name,
        printer:category.printer
      },id:product.id},menu);
    })
    return setDoc(
      doc(
        this.firestore,
        '/business/'+this.dataProvider.businessId+'/menus/'+menu.id+'/rootCategories/' + category.id
      ),
      { printer: category.printer },
      { merge: true }
    );
  }

  updateRootSettings(settings:any,businessId:string){
    return setDoc(
      doc(this.firestore, 'business/'+businessId+'/settings/settings'),
      settings,
      { merge: true }
    );
  }
  deleteViewCategory(menuId:string,categoryId:string){
    return deleteDoc(doc(
      this.firestore,
      'business/'+this.dataProvider.businessId+'/menus/' + menuId+'/users/'+this.dataProvider.currentUser.username + '/viewCategories/' + categoryId
    ))
  }

  async getTables(){
    getDocs(collection(this.firestore,'business/'+this.dataProvider.businessId+'/tables')).then(async (res)=>{
      if (res.docs.length > 0){
        let tables = res.docs.map(async (doc)=>{
          let table =  {...doc.data(),id:doc.id} as TableConstructor
          // let tableClass = new Table(table.id,Number(table.tableNo),table.name,table.maxOccupancy,table.type,this.dataProvider,this.databaseService)
          // tableClass.fromObject(table);
          return await Table.fromObject(table,this.dataProvider,this.analyticsService,this.tableService,this.billService,this.printingService);
        })
        console.log("tables ",tables);
        // add data to indexedDB
        let formedTable = await Promise.all(tables);
        // sort tables by tableNo
        formedTable.sort((a,b)=>{
          return a.tableNo - b.tableNo;
        })
        this.dataProvider.tables = formedTable;
      } else {
        if (this.dataProvider.tables.length == 0 && res.docs.length == 0){
          this.dataProvider.tables = [];
        }
      }
    }).catch((err)=>{
      console.log("Table fetch Error ",err);
    })
  }

  async getTokens(){
    getDocs(collection(this.firestore,'business/'+this.dataProvider.businessId+'/tokens')).then(async (res)=>{
      let tables = res.docs.map(async (doc)=>{
        let table =  {...doc.data(),id:doc.id} as TableConstructor
        // let tableClass = new Table(table.id,Number(table.tableNo),table.name,table.maxOccupancy,'token',this.dataProvider,this.databaseService)
        // tableClass.fromObject(table);
        return await Table.fromObject(table,this.dataProvider,this.analyticsService,this.tableService,this.billService,this.printingService);
      })
      let formedTable = await Promise.all(tables);
      formedTable.sort((a,b)=>{
        return a.tableNo - b.tableNo;
      })
      this.dataProvider.tokens = formedTable;
    })
  }

  async getOnlineTokens(){
    getDocs(collection(this.firestore,'business/'+this.dataProvider.businessId+'/onlineTokens')).then(async (res)=>{
      let tables = res.docs.map(async (doc)=>{
        let table =  {...doc.data(),id:doc.id} as TableConstructor
        let tableClass = await Table.fromObject(table,this.dataProvider,this.analyticsService,this.tableService,this.billService,this.printingService)
        console.log("ONLINE TABLE",tableClass);
        return tableClass;
      })
      let formedTable = await Promise.all(tables);
      formedTable.sort((a,b)=>{
        return a.tableNo - b.tableNo;
      })
      this.dataProvider.onlineTokens = formedTable;
    })
  }
}

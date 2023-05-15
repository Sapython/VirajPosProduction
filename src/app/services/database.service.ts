import { Injectable } from '@angular/core';
import {
  addDoc,
  arrayUnion,
  collectionData,
  deleteDoc,
  doc,
  docData,
  DocumentReference,
  Firestore,
  increment,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { collection, getDoc, getDocs } from '@firebase/firestore';
import { Product, TableConstructor } from '../biller/constructors';
import { DataProvider } from '../provider/data-provider.service';
import {
  Category,
  RootCategory,
  ViewCategory,
} from '../structures/general.structure';
import { debounceTime, distinct, firstValueFrom } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
} from '@angular/fire/storage';
import { ModeConfig } from '../biller/sidebar/edit-menu/edit-menu.component';
import { AlertsAndNotificationsService } from './alerts-and-notification/alerts-and-notifications.service';
import { Dialog } from '@angular/cdk/dialog';
import { Discount } from '../biller/settings/settings.component';
import { BusinessRecord, Member, UserBusiness } from '../structures/user.structure';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  storage = getStorage();
  constructor(
    private firestore: Firestore,
    private dataProvider: DataProvider,
    private alertify:AlertsAndNotificationsService,
    private dialog:Dialog
  ) {
    // docData(
    //   doc(this.firestore, 'business/'+this.dataProvider.businessId+'/settings/settings')
    // ).subscribe((res: any) => {
    //   this.dataProvider.billToken = res.billTokenNo;
    //   this.dataProvider.kotToken = res.kitchenTokenNo;
    //   this.dataProvider.tableTimeOutTime = res.tableTimeOutTime || 45;
    //   this.dataProvider.takeawayToken = res.takeawayTokenNo || 0;
    //   this.dataProvider.onlineTokenNo = res.onlineTokenNo || 0;
    //   this.dataProvider.password = res.password;
    //   this.dataProvider.activeModes = res.modes;
    //   this.dataProvider.dineInMenu = res.dineInMenu;
    //   this.dataProvider.takeawayMenu = res.takeawayMenu;
    //   this.dataProvider.onlineMenu = res.onlineMenu;
    //   this.dataProvider.settingsChanged.next()
    //   this.dataProvider.settingsChanged.complete()
    //   console.log("Settings changed");
    // });
    // // get categories from indexedDB
    // firstValueFrom(this.indexedDb.getAll('categories')).then((data: any) => {
    //   if (data.length > 0) {
    //     this.dataProvider.categories = data;
    //   }
    // });
    // firstValueFrom(this.indexedDb.getAll('recommendedCategories')).then(
    //   (data: any) => {
    //     if (data.length > 0) {
    //       this.dataProvider.recommendedCategories = data;
    //     }
    //   }
    // );
    // Promise.all([
    //   this.getProducts(),
    //   this.getViewCategories(),
    //   this.getRootCategories(),
    //   this.getRecommendedCategories(),
    // ]).then((res) => {
    //   this.dataProvider.products = res[0].docs.map((doc) => {
    //     return {
    //       ...doc.data(),
    //       id: doc.id,
    //       selected: false,
    //       tags: doc.data()['tags'] || [],
    //       quantity: 1,
    //       images: doc.data()['images'] || [],
    //     } as Product;
    //   });
    //   // this.dataProvider.products.forEach((product) => {
    //   //   addDoc(collection(this.firestore,'productsCollection'),{...product,category:null})
    //   // })
    //   // this.updateProducts(this.dataProvider.products.map((data)=>{
    //   //   return {...data,createdDate:new Date()}
    //   // }))
    //   this.dataProvider.viewCategories = res[1].docs.map((doc) => {
    //     return { ...doc.data(), id: doc.id } as ViewCategory;
    //   });
    //   // update category with enabled true
    //   // this.dataProvider.viewCategories.forEach((category) => {
    //   //   updateDoc(doc(this.firestore,'business/'+this.dataProvider.businessId+'/viewCategories',category.id),{enabled:true})
    //   // })
    //   console.log(
    //     'this.dataProvider.viewCategories',
    //     this.dataProvider.viewCategories
    //   );
    //   this.dataProvider.rootCategories = res[2].docs.map((doc) => {
    //     return { ...doc.data(), id: doc.id } as RootCategory;
    //   });
    //   // this.dataProvider.rootCategories.forEach((category) => {
    //   //   updateDoc(doc(this.firestore,'business/'+this.dataProvider.businessId+'/rootCategories',category.id),{enabled:true})
    //   // })
    //   this.dataProvider.recommendedCategories = res[3].docs.map((doc) => {
    //     return { ...doc.data(), id: doc.id } as ViewCategory;
    //   });
    //   // this.dataProvider.recommendedCategories.forEach((category) => {
    //   //   updateDoc(doc(this.firestore,'business/'+this.dataProvider.businessId+'/recommendedCategories',category.id),{enabled:true})
    //   // })
    //   this.dataProvider.recommendedCategories.forEach((category) => {
    //     if (category.id == 'highCost') {
    //       this.dataProvider.highCostConfig = category.settings;
    //     } else if (category.id == 'lowCost') {
    //       this.dataProvider.lowCostConfig = category.settings;
    //     } else if (category.id == 'highRange') {
    //       this.dataProvider.highRangeConfig = category.settings;
    //     } else if (category.id == 'lowRange') {
    //       this.dataProvider.lowRangeConfig = category.settings;
    //     } else if (category.id == 'mostSelling') {
    //       this.dataProvider.mostSellingConfig = category.settings;
    //     } else if (category.id == 'newDishes') {
    //       this.dataProvider.newDishesConfig.max =
    //         category.settings.max?.toDate();
    //       this.dataProvider.newDishesConfig.min =
    //         category.settings.min?.toDate();
    //     }
    //   });
    //   this.dataProvider.productsLoaded.next(true);
    //   console.log('NEXT DONE', this.dataProvider.products);
    //   // this.dataProvider.products.forEach((product,index:number)=>{
    //   //   updateDoc(doc(this.firestore,'business/accounts/triveniSangam/recipes/recipes',product.id),{count:index})
    //   // })
    // });
    // let res = await this.getMenus()
      // this.dataProvider.allMenus = res.docs.map((menu)=>{return {...menu.data(),id:menu.id} as Menu })
      // let names:{
      //   name:string,
      //   type:'dineIn'|'takeaway'|'online'
      // }[] = [
      //   {
      //     name:"Dine In",
      //     type:'dineIn'
      //   },{
      //     name:"Takeaway",
      //     type:'takeaway'
      //   },
      //   {
      //     name:"Online",
      //     type:'online'
      //   }]
      // for (let index = 0; index < 3; index++) {
      //   if (index == 0){
      //     var currentMenu:Menu|undefined = this.dataProvider.dineInMenu;
      //   } else if (index == 1){
      //     var currentMenu:Menu|undefined = this.dataProvider.takeawayMenu;
      //   } else if (index == 2){
      //     var currentMenu:Menu|undefined = this.dataProvider.onlineMenu;
      //   }
      //   let classInstance = new ModeConfig(names[index].name,names[index].type,currentMenu,this.dataProvider,this,this.alertify,this.dialog);
      //   this.dataProvider.menus.push(classInstance)
      // }
    // firstValueFrom(this.dataProvider.settingsChanged).then(async (d)=>{
    //   let res = await this.getMenus()
    //   this.dataProvider.allMenus = res.docs.map((menu)=>{return {...menu.data(),id:menu.id} as Menu })
    //   let names:{
    //     name:string,
    //     type:'dineIn'|'takeaway'|'online'
    //   }[] = [
    //     {
    //       name:"Dine In",
    //       type:'dineIn'
    //     },{
    //       name:"Takeaway",
    //       type:'takeaway'
    //     },
    //     {
    //       name:"Online",
    //       type:'online'
    //     }]
    //   for (let index = 0; index < 3; index++) {
    //     if (index == 0){
    //       var currentMenu:Menu|undefined = this.dataProvider.dineInMenu;
    //     } else if (index == 1){
    //       var currentMenu:Menu|undefined = this.dataProvider.takeawayMenu;
    //     } else if (index == 2){
    //       var currentMenu:Menu|undefined = this.dataProvider.onlineMenu;
    //     }
    //     if (currentMenu && currentMenu.id){
    //       console.log("currentMenu",currentMenu);
    //       let classInstance = new ModeConfig(names[index].name,names[index].type,currentMenu,currentMenu.id,this.dataProvider,this,this.alertify,this.dialog);
    //       this.dataProvider.menus.push(classInstance)
    //     }
    //   }
    //   this.dataProvider.currentMenu = this.dataProvider.menus[0];
    // })

    // MENU COPIER
    getDocs(collection(this.firestore,'/business/2t6wnystqc9yd7yd0acrl/menus/CG9WYqo03FM6nD3VlEz8/products')).then((res)=>{
      res.forEach((document)=>{
        setDoc(doc(this.firestore,'/business/uqd9dm0its2v9xx6fey2q/menus/cKVMRvUXaC9K2nFb5rC3/products/'+document.id),document.data())
      })
    })
    getDocs(collection(this.firestore,'/business/2t6wnystqc9yd7yd0acrl/menus/CG9WYqo03FM6nD3VlEz8/recommededCategories')).then((res)=>{
      res.forEach((document)=>{
        setDoc(doc(this.firestore,'/business/uqd9dm0its2v9xx6fey2q/menus/cKVMRvUXaC9K2nFb5rC3/recommededCategories/'+document.id),document.data())
      })
    })
    getDocs(collection(this.firestore,'/business/2t6wnystqc9yd7yd0acrl/menus/CG9WYqo03FM6nD3VlEz8/rootCategories')).then((res)=>{
      res.forEach((document)=>{
        setDoc(doc(this.firestore,'/business/uqd9dm0its2v9xx6fey2q/menus/cKVMRvUXaC9K2nFb5rC3/rootCategories/'+document.id),document.data())
      })
    })
    getDocs(collection(this.firestore,'/business/2t6wnystqc9yd7yd0acrl/menus/CG9WYqo03FM6nD3VlEz8/viewCategories')).then((res)=>{
      res.forEach((document)=>{
        setDoc(doc(this.firestore,'/business/uqd9dm0its2v9xx6fey2q/menus/cKVMRvUXaC9K2nFb5rC3/viewCategories/'+document.id),document.data())
      })
    })
  }

  getMenuData(){
    this.dataProvider.activeModes
  }

  async upload(
    path: string,
    file: File | ArrayBuffer | Blob | Uint8Array
  ): Promise<any> {
    // const ext = file!.name.split('.').pop();
    if (file) {
      try {
        const storageRef = ref(this.storage, path);
        const task = uploadBytesResumable(storageRef, file);
        await task;
        const url = await getDownloadURL(storageRef);
        return url;
      } catch (e: any) {
        console.error(e);
        return e;
      }
    } else {
      // handle invalid file
      return false;
    }
  }

  getProducts() {
    return getDocs(
      collection(this.firestore, '/business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/products')
    );
  }

  getMainCategories() {
    return getDocs(
      collection(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/rootCategories')
    );
  }

  addTable(table: TableConstructor) {
    return addDoc(
      collection(this.firestore, 'business/'+this.dataProvider.businessId+'/tables'),
      table
    );
  }

  addRecipe(recipe: any,menuId:string) {
    return addDoc(
      collection(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/'+menuId+'/products'),
      recipe
    );
  }

  updateRecipe(recipe:any,menuId:string){
    recipe.quantity = 1;
    recipe.selected = false;
    delete recipe.instruction
    delete recipe.lineDiscount
    recipe.createdDate = Timestamp.now()
    return updateDoc(
      doc(this.firestore,'business/'+this.dataProvider.businessId+'/menus/'+menuId+'/products/'+recipe.id),{...recipe}
    )
  }

  updateBill(bill: any) {
    return setDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/bills', bill.id),
      bill,
      { merge: true }
    );
  }

  updateTable(table: any) {
    return setDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/tables', table.id),
      table,
      { merge: true }
    );
  }

  updateToken(token: any) {
    return setDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/tokens', token.id),
      token,
      { merge: true }
    );
  }

  addBillToken() {
    return updateDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/settings/settings'),
      { billTokenNo: this.dataProvider.billToken }
    );
  }

  addOrderToken() {
    return updateDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/settings/settings'),
      { orderTokenNo: this.dataProvider.orderTokenNo }
    );
  }

  addNcBillToken() {
    return updateDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/settings/settings'),
      { ncBillTokenNo: this.dataProvider.ncBillToken }
    );
  }

  addTakeawayToken() {
    return updateDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/settings/settings'),
      { takeawayTokenNo: increment(1) }
    );
  }
  updateOnlineToken(token: any) {
    return setDoc(
      doc(
        this.firestore,
        'business/'+this.dataProvider.businessId+'/onlineTokens',
        token.id
      ),
      token,
      { merge: true }
    );
  }

  addOnlineToken() {
    return updateDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/settings/settings'),
      { onlineTokenNo: increment(1) }
    );
  }

  addKitchenToken() {
    console.log('this.dataProvider.kotToken', this.dataProvider.kotToken);
    return updateDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/settings/settings'),
      { kitchenTokenNo: this.dataProvider.kotToken }
    );
  }

  getBill(id: string) {
    console.log('business/'+this.dataProvider.businessId+'/bills', id);
    return getDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/bills', id)
    );
  }

  getBillSubscription(id: string) {
    console.log('business/'+this.dataProvider.businessId+'/bills', id);
    return docData(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/bills', id)
    );
  }

  getBills() {
    return getDocs(
      collection(this.firestore, 'business/'+this.dataProvider.businessId+'/bills')
    );
  }

  getBillsByDay(date: Date,endDate?:Date) {
    let minTime = new Date(date);
    minTime.setHours(0, 0, 0, 0);
    if (endDate){
      var maxTime = new Date(endDate);
      maxTime.setHours(23, 59, 59, 999);
    } else {
      var maxTime = new Date(date);
      maxTime.setHours(23, 59, 59, 999);
    }
    return getDocs(
      query(
        collection(this.firestore, 'business/'+this.dataProvider.businessId+'/bills'),
        where('createdDate', '>=', minTime),
        where('createdDate', '<=', maxTime)
      )
    );
  }

  getBillsSubscription() {
    return collectionData(
      collection(this.firestore, 'business/'+this.dataProvider.businessId+'/bills'),
      { idField: 'id' }
    );
  }

  getTables() {
    return getDocs(
      collection(this.firestore, 'business/'+this.dataProvider.businessId+'/tables')
    );
  }

  getTable(tableId:string,type:'tables'|'tokens'|'onlineTokens') {
    console.log('business/'+this.dataProvider.businessId+'/'+type, tableId);
    return docData(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/'+type, tableId)
    );
  }

  addViewCategory(category: any, id?: string) {
    if (!id)
      return addDoc(
        collection(
          this.firestore,
          'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/viewCategories'
        ),
        category
      );
    return setDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/viewCategories/' + id),
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
      collection(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/viewCategories')
    );
  }

  updateViewCategory(id: string, products: string[]) {
    return updateDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/viewCategories/' + id),
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

  upgrade(data: any) {
    return addDoc(collection(this.firestore, 'upgradeRequests'), data);
  }

  setSettings(data: any, type: string, productList: string[]) {
    return setDoc(
      doc(
        this.firestore,
        '/business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/recommendedCategories/' + type
      ),
      { settings: data, products: productList },
      { merge: true }
    );
  }

  updateProducts(products: Product[]) {
    return Promise.all(
      products.map((product) => {
        return setDoc(
          doc(
            this.firestore,
            'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/products/' + product.id
          ),
          { ...product, quantity: 1 },
          { merge: true }
        );
      })
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

  updateMode(modes:boolean[]){
    return setDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/settings/settings'),
      { modes: modes },
      { merge: true }
    );
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

  getProductsByMenu(menu:Menu){
    return getDocs(
      collection(
        this.firestore,
        'business/'+this.dataProvider.businessId+'/menus/' +
          menu.id +
          '/products/'
      ),
    )
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
          menu.id +
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
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/' + menu.id + '/viewCategories/' + category.id),
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

  addDiscount(discount:Discount){
    return addDoc(
      collection(this.firestore, 'business/'+this.dataProvider.businessId+'/discounts/'),
      {...discount,creationDate:serverTimestamp()}
    );
  }

  getDiscounts(){
    return getDocs(collection(this.firestore, 'business/'+this.dataProvider.businessId+'/discounts/'));
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
      'business/'+this.dataProvider.businessId+'/menus/' + menuId + '/viewCategories/' + categoryId
    ))
  }
  addBusiness(userBusiness:BusinessRecord,id:string){
    return setDoc(doc(this.firestore,'business',id),{...userBusiness,id});
  }

  addAccount(userAccount:Member,businessId:string){
    return setDoc(doc(this.firestore,'business/'+businessId),{
      users:arrayUnion(userAccount)
    },{merge:true});
  }

  addTables(tables:TableConstructor[],businessId:string){
    return Promise.all(tables.map(table=>{
      return setDoc(doc(this.firestore,'business/'+businessId+'/tables',table.id),table);
    }))
  }

  addSales(sale:number,type:string){
    // alert("Adding sales")
    return updateDoc(doc(this.firestore,'business/'+this.dataProvider.businessId+'/settings/settings'),{
      [type]:increment(sale)
    })
  }

  updateBusiness(business:OptionalBusinessRecord){
    return setDoc(doc(this.firestore,'business',business.businessId),business,{merge:true});
  }

}

export interface Menu {
  id?: string;
  name: string;
  description: string;
}
export interface OptionalBusinessRecord {
  businessId:string;
  hotelName?:string;
  hotelLogo?:string;
  address?:string;
  phone?:string;
  email?:string;
  image?:string;
  modes?:boolean[],
  fssai?:string;
  gst?:string;
  billerPrinter?:string;
  cgst?:number;
  sgst?:number;
  users?:Member[];
  billerPin?:string;
  devices?:string[]
}

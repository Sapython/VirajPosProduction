import { AfterViewInit, Component, OnInit, ViewContainerRef } from '@angular/core';
import { debounceTime, firstValueFrom, Subject } from 'rxjs';
import { Category, RootCategory, ViewCategory } from 'src/app/structures/general.structure';
import { Dialog } from '@angular/cdk/dialog'
import { DataProvider } from 'src/app/provider/data-provider.service';
import { DatabaseService } from 'src/app/services/database.service';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { StockListComponent } from './stock-list/stock-list.component';
declare var Hammer:any;
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit,AfterViewInit {
  closeStockListPanelSubscription:Subject<boolean> = new Subject<boolean>();
  isStockListOpen = false;
  
  public recommended:Category[] = []
  public rootCategories:Category[] = []

  public products:any[] = []

  currentCategory:Category|undefined = undefined;
  currentEvent:any = undefined;
  stockConsumption:number = 0;
  constructor(public viewContainerRef: ViewContainerRef,private dialog:Dialog,public dataProvider:DataProvider,private databaseService:DatabaseService,private indexedDb:NgxIndexedDBService) {
    this.closeStockListPanelSubscription.pipe(debounceTime(600)).subscribe((data)=>{
      this.isStockListOpen = data;
    })
  }

  ngOnInit(): void {
    this.getDineInProducts();
    this.recommended = this.dataProvider.recommendedCategories.map(recommendedCategory => {
      return {
        name:recommendedCategory.name,
        id:recommendedCategory.id,
        products:this.dataProvider.products.filter(product => recommendedCategory.products.includes(product.id)),
        averagePrice:0,
        enabled:recommendedCategory.enabled
      }
    });
    console.log("this.dataProvider.rootCategories",this.dataProvider.rootCategories);
    this.rootCategories = this.dataProvider.rootCategories.map(rootCategory => {
      return {
        name:rootCategory.name,
        id:rootCategory.id,
        products:this.dataProvider.products.filter(product => rootCategory.id == product.category.id),
        averagePrice:0,
        enabled:rootCategory.enabled
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.dataProvider.touchMode){
      // stockConsumptionTrigger recognizer
      var mc = new Hammer.Manager(document.getElementById('stockConsumptionTrigger'));
      mc.add( new Hammer.Press({ time:500 }) );
      mc.on("press", (ev:any) => {
        console.log("press",ev);
        const dialog = this.dialog.open(StockListComponent)
        dialog.componentInstance?.close.subscribe((data)=>{
          dialog.close();
        })
      });
    }
  }

  getDineInProducts() {
    this.products = []
    this.dataProvider.categories = []
    this.dataProvider.productsLoaded.subscribe((data)=>{
      // console.log("Loaded",data);
      if (data){
        this.dataProvider.categories = []
        this.dataProvider.viewCategories.forEach((category:ViewCategory)=>{
          let products = this.dataProvider.products.filter((product)=> category.products.includes(product.id) );
          console.log("products",products);
          this.dataProvider.categories.push({
            id:category.id,
            name:category.name,
            products:products,
            averagePrice: (products.reduce((a, b) => a + b.price, 0) / products.length),
            enabled:category.enabled
          });
        })
        console.log("Sagadi",this.dataProvider.categories,this.dataProvider.products);
        // let allCategories:Category[] = []
        // this.dataProvider.products.forEach((data: any) => {
        //   this.products.push(
        //     {
        //       ...data,
        //       id:data.id,
        //       quantity:1,
        //     }
        //   );
        //   // console.log("data.category",data.category);
        //   if (data.category){
        //     allCategories.push(JSON.parse(JSON.stringify(data.category)));
        //   }
        //   console.log("categories",allCategories);
        // });
        // let filteredCat: any[] = [];
        // allCategories.forEach((item, index) => {
        //   let found = false;
        //   // console.log(item)
        //   if (item){
        //     filteredCat.forEach((item2) => {
        //       if (item2.name == item.name) {
        //         found = true;
        //       }
        //     });
        //     if (!found) {
        //       filteredCat.push(item);
        //     }
        //   } else {
        //     // console.log("No Category",index, this.products[index]?.id)
        //   }
        // });
        // this.dataProvider.categories = filteredCat;
        // // // map categories to products
        // this.dataProvider.categories.forEach((category,index) => {
        //   category.products = [];
        //   console.log("Sagadi",category,this.products,this.dataProvider.products);
        //   this.products.forEach((product) => {
        //     if (product.category?.id == category.id) {
        //       console.log("Sagadi",product,category.products);
        //       category.products.push(product);
        //     }
        //   });
        //   // calculate average price
        //   let total = 0;
        //   category.products.forEach((product) => {
        //     total += product.price;
        //   })
        //   category.averagePrice = total / category.products.length;
        // });
        // this.dataProvider.categories.forEach((category)=>{
        //   this.databaseService.addCategory({name:category.name,id:category.id,averagePrice:category.averagePrice},category.id)
        // })
        // console.log("Storing categories to indexedDB");
        // store to indexedDB
       this.storeCategoriesIndexedDb()
      }
    })
  }

  storeCategoriesIndexedDb(){
    this.indexedDb.getAll('categories').subscribe((data)=>{
      if (data.length == 0){
        this.dataProvider.categories.forEach((category)=>{
          this.indexedDb.add('categories',category)
        })
      } else {
        if (data.length > 0) {
          this.dataProvider.categories.forEach((category)=>{
            firstValueFrom(this.indexedDb.update('categories',category))
          })
        }
      }
    },(err)=>{
      console.log("Serious error occured while storing categories",err)
    })
    this.indexedDb.getAll('recommendedCategories').subscribe((data)=>{
      if (data.length == 0){
        this.dataProvider.recommendedCategories.forEach((category)=>{
          this.indexedDb.add('recommendedCategories',category)
        })
      } else {
        if (data.length > 0) {
          this.dataProvider.recommendedCategories.forEach((category)=>{
            firstValueFrom(this.indexedDb.update('recommendedCategories',category))
          })
        }
      }
    },(err)=>{
      console.log("Serious error occured while storing categories",err)
    })
  }

  openCategory(category:Category){
    if (category.products?.length > 0){
      this.dataProvider.menuProducts.next(category);
    }
  }
}

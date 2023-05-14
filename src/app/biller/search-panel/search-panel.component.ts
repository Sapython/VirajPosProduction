import { Component, OnInit } from '@angular/core';
import { debounce, debounceTime, Subject, Subscription } from 'rxjs';
import Fuse from 'fuse.js';
import { DataProvider } from '../../provider/data-provider.service';
import { Dialog } from '@angular/cdk/dialog';
import { TableComponent } from '../table/table.component';
import { DatabaseService } from '../../services/database.service';
@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrls: ['./search-panel.component.scss']
})
export class SearchPanelComponent implements OnInit {
  placeholders:string[] = [
    "Search any dish...",
    "Search any bill...",
    "Search any customer...",
    "Search any order...",
    "Search any payment...",
    "Search any kot...",
    "Search any table..."
  ]
  searchResults:any[] = [];
  billResults:any[] = [];
  allBills:any[] = [];
  index:number = 0;
  active:boolean = false;
  dynamicPlaceholder:string = this.placeholders[0];
  selectedMode:'dineIn'|'takeAway'|'online' = "dineIn";
  searchSubcription:Subject<string> = new Subject<string>();
  currentSearchTerm:string = "";
  billListnerActive:boolean = false;
  billListner:Subscription = Subscription.EMPTY;
  searchInstance = new Fuse(this.dataProvider.products, {
    keys: ['dishName','count'],
  })
  searchVisible:boolean = false;
  constructor(public dataProvider:DataProvider,private dialog:Dialog,private databaseService:DatabaseService) {
    this.searchSubcription.pipe(debounceTime(400)).subscribe((value)=>{
      console.log(value);
      this.fetchAdvancedResults(value)
    })
    this.dataProvider.modeChanged.subscribe((mode)=>{
      if(this.dataProvider.currentMenu){
        this.searchInstance.setCollection(this.dataProvider.currentMenu?.products)
      }
    })
    this.searchSubcription.pipe(debounceTime(200)).subscribe((value)=>{
      console.log(value);
      this.currentSearchTerm = value;
      this.basicSearch(value)
    })
  }

  getBills(){
    this.billListnerActive = true;
    this.billListner = this.databaseService.getBillsSubscription().subscribe((bills)=>{
      this.allBills = bills;
    })
  }

  ngOnInit(): void {
    setInterval(()=>{
      this.dynamicPlaceholder = this.placeholders[this.index];
      this.index = (this.index+1)%this.placeholders.length;
    }, 2000);
  }

  basicSearch(value:string){
    this.searchInstance = new Fuse(this.dataProvider.products, {
      keys: ['name','count'],
    })
    let results = this.searchInstance.search(value)
    console.log("results",results);
    this.searchResults = results.map((result)=>{return result.item})
    if (value){
      this.dataProvider.searchResults.next(this.searchResults);
    } else {
      this.dataProvider.searchResults.next(false);
    }
  }

  fetchAdvancedResults(value:string){
    if (value.startsWith('#')){
      if (!this.billListnerActive){
        this.getBills();
      }
      if (this.allBills.length > 0){
        this.billResults.push({
          type:'bill',
          billId: this.allBills[0].id,
        })
      }
    }
  }

  selectTable(){
    this.dataProvider.openTableView.next(true)
  }

  switchMode(mode:any){
    console.log("mode",mode);
    this.dataProvider.billingMode = mode.value;
    this.dataProvider.modeChanged.next(mode.value);
    if (mode.value == 'dineIn'){
      console.log("this.dataProvider.dineInMenu",this.dataProvider.dineInMenu);
      if(!this.dataProvider.dineInMenu){
        alert("No dine-in menu found");
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu)=>{
        return menu.selectedMenu?.id == this.dataProvider.dineInMenu?.id
      });
      if (this.dataProvider.currentMenu){
        this.dataProvider.currentMenu.type = 'dineIn';
      } else {
        console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
      console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    } else if (mode.value == 'takeaway'){
      console.log("this.dataProvider.takeawayMenu",this.dataProvider.takeawayMenu);
      if(!this.dataProvider.takeawayMenu){
        alert("No takeaway menu found");
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu)=>{
        return menu.selectedMenu?.id == this.dataProvider.takeawayMenu?.id
      });
      if (this.dataProvider.currentMenu){
        this.dataProvider.currentMenu.type = 'takeaway';
      } else {
        console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
      console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    } else if (mode.value == 'online'){
      console.log("this.dataProvider.onlineMenu",this.dataProvider.onlineMenu);
      if(!this.dataProvider.onlineMenu){
        alert("No online menu found");
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu)=>{
        return menu.selectedMenu?.id == this.dataProvider.onlineMenu?.id
      });
      if (this.dataProvider.currentMenu){
        this.dataProvider.currentMenu.type = 'online';
      } else {
        console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
      console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    }
  }
}

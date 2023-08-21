import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { debounce, debounceTime, Subject, Subscription } from 'rxjs';
import Fuse from 'fuse.js';
import { Dialog } from '@angular/cdk/dialog';
import { DataProvider } from '../../../core/services/provider/data-provider.service';
import { BillService } from '../../../core/services/database/bill/bill.service';
import { Combo } from '../../../types/combo.structure';
import { Product } from '../../../types/product.structure';
@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrls: ['./search-panel.component.scss'],
})
export class SearchPanelComponent implements OnInit {
  placeholders: string[] = [
    'Search any dish...',
    'Search any bill...',
    'Search any customer...',
    'Search any order...',
    'Search any payment...',
    'Search any kot...',
    'Search any table...',
  ];
  searchResults: any[] = [];
  billResults: any[] = [];
  allBills: any[] = [];
  index: number = 0;
  active: boolean = false;
  dynamicPlaceholder: string = this.placeholders[0];
  selectedMode: 'dineIn' | 'takeAway' | 'online' = 'dineIn';
  searchSubscription: Subject<string> = new Subject<string>();
  currentSearchTerm: string = '';
  billListenerActive: boolean = false;
  billListener: Subscription = Subscription.EMPTY;
  searchInstance: Fuse<Product | Combo> = new Fuse(this.dataProvider.products, {
    keys: ['name'],
  });
  searchVisible: boolean = false;
  @ViewChild('search') searchInput: ElementRef;
  constructor(
    public dataProvider: DataProvider,
    private billsService: BillService,
  ) {
    this.searchSubscription.pipe(debounceTime(400)).subscribe((value) => {
      this.basicSearch(value);
    });
    this.dataProvider.menuLoadSubject.subscribe((value) => {
      if (value) {
        // console.log("SETTING COLLECTION",this.dataProvider.currentMenu?.products);
        this.searchInstance.setCollection(
          this.dataProvider.currentMenu?.products,
        );
      }
    });

    this.dataProvider.clearSearchField.subscribe((value) => {
      this.searchInput.nativeElement.value = '';
    });
    this.dataProvider.modeChanged.subscribe(() => {
      // console.log("this.dataProvider.modeChanged",mode,this.dataProvider.currentMenu?.products);
      this.searchResults = [];
      this.billResults = [];
      if (this.dataProvider.currentMenu) {
        this.searchInstance.setCollection(
          this.dataProvider.currentMenu?.products,
        );
      }
    });
    this.searchSubscription.pipe(debounceTime(200)).subscribe((value) => {
      // console.log(value);
      this.currentSearchTerm = value;
      this.basicSearch(value);
    });

    this.dataProvider.productPanelState.subscribe((value) => {
      this.searchInstance.setCollection(
        this.dataProvider.currentMenu?.products,
      );
      // if (value == 'combos') {
      //   this.searchInstance.setCollection(
      //     this.dataProvider.currentMenu?.combos,
      //   );
      // } else {
      // }
    });
  }

  getBills() {
    this.billListenerActive = true;
    this.billListener = this.billsService
      .getBillsSubscription()
      .subscribe((bills) => {
        this.allBills = bills;
      });
  }

  ngOnInit(): void {
    setInterval(() => {
      this.dynamicPlaceholder = this.placeholders[this.index];
      this.index = (this.index + 1) % this.placeholders.length;
    }, 2000);
  }

  basicSearch(value: string) {
    let results = this.searchInstance.search(value);
    console.log("results",results,this.searchInstance);
    this.searchResults = results.map((result) => {
      return result.item;
    });
    console.log("this.searchResults",this.searchResults);
    if (value) {
      this.dataProvider.searchResults.next(this.searchResults);
    } else {
      this.dataProvider.searchResults.next(false);
    }
  }

  fetchAdvancedResults(value: string) {
    if (value.startsWith('#')) {
      if (!this.billListenerActive) {
        this.getBills();
      }
      if (this.allBills.length > 0) {
        this.billResults.push({
          type: 'bill',
          billId: this.allBills[0].id,
        });
      }
    }
  }

  selectTable() {
    this.dataProvider.openTableView.next(true);
  }

  switchMode(mode: any) {
    // console.log("mode",mode);
    this.dataProvider.billingMode = mode.value;
    if (mode.value == 'dineIn') {
      localStorage.setItem('billingMode', 'dineIn');
      // console.log("this.dataProvider.dineInMenu",this.dataProvider.dineInMenu);
      if (!this.dataProvider.dineInMenu) {
        alert('No dine-in menu found');
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu) => {
        return menu.selectedMenu?.id == this.dataProvider.dineInMenu?.id && menu.type == 'dineIn';
      });
      if (this.dataProvider.currentMenu) {
        // this.dataProvider.currentMenu.type = 'dineIn';
        this.dataProvider.products = this.dataProvider.currentMenu.products;
      } else {
        // console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
      // console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    } else if (mode.value == 'takeaway') {
      localStorage.setItem('billingMode', 'takeaway');
      // console.log("this.dataProvider.takeawayMenu",this.dataProvider.takeawayMenu);
      if (!this.dataProvider.takeawayMenu) {
        alert('No takeaway menu found');
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu) => {
        return menu.selectedMenu?.id == this.dataProvider.takeawayMenu?.id && menu.type == 'takeaway';
      });
      if (this.dataProvider.currentMenu) {
        // this.dataProvider.currentMenu.type = 'takeaway';
        this.dataProvider.products = this.dataProvider.currentMenu.products;
      } else {
        // console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
      // console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    } else if (mode.value == 'online') {
      localStorage.setItem('billingMode', 'online');
      // console.log("this.dataProvider.onlineMenu",this.dataProvider.onlineMenu);
      if (!this.dataProvider.onlineMenu) {
        alert('No online menu found');
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu) => {
        return menu.selectedMenu?.id == this.dataProvider.onlineMenu?.id && menu.type == 'online';
      });
      if (this.dataProvider.currentMenu) {
        // this.dataProvider.currentMenu.type = 'online';
        this.dataProvider.products = this.dataProvider.currentMenu.products;
      } else {
        // console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
      // console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    }
    this.dataProvider.clearSearchField.next();
    this.dataProvider.modeChanged.next(mode.value);
  }
}

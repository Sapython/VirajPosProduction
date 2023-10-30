import { Dialog } from '@angular/cdk/dialog';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { SalesSummaryComponent } from './sales-summary/sales-summary.component';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import { UpgradeComponent } from './upgrade/upgrade.component';
import { environment } from '../../../../../environments/environment';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';
import { ElectronService } from '../../../../core/services/electron/electron.service';
import { UpdaterComponent } from './updater/updater.component';
import { ReportsComponent } from '../reports/reports.component';
declare var Hammer: any;
@Component({
  selector: 'app-info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.scss'],
})
export class InfoPanelComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  limitedSale: string = '0';
  isOpen = false;
  isSalesOpen = false;
  version: string = '1.0.0';
  height: number = 0;
  closeOrdersPanelSubscription: Subject<boolean> = new Subject<boolean>();
  closeSalesPanelSubscription: Subject<boolean> = new Subject<boolean>();
  closeAllPanelSubscription:Subscription = Subscription.EMPTY;
  softwareUpdateSubscription:Subscription = Subscription.EMPTY;
  salesSummaryComponentCloseSubscription:Subscription = Subscription.EMPTY;
  orderSummaryComponentCloseSubscription:Subscription = Subscription.EMPTY;
  closeOrderSubjectSubscription:Subscription = Subscription.EMPTY;
  closeSalesSubjectSubscription:Subscription = Subscription.EMPTY;
  downloadPercentage: number = 0;
  constructor(
    public dataProvider: DataProvider,
    private el: ElementRef,
    private dialog: Dialog,
    private electronService: ElectronService,
  ) {
    this.closeAllPanelSubscription = this.closeAllPanelSubscription = this.dataProvider.closeAllPanel.subscribe((data) => {
      this.isOpen = false;
      this.isSalesOpen = false;
    });
    this.version = environment.appVersion;
    // console.log("this.el.nativeElement",this.el.nativeElement.offsetHeight);
    this.height = this.el.nativeElement.offsetHeight;
    this.softwareUpdateSubscription = this.dataProvider.softwareUpdateFilteredSubject.subscribe(async (data) => {
      console.log('softwareUpdateSubject', data);
      if (data.stage && data.stage == 'update-available') {
        await alert('New update available');
        const dialog = this.dialog.open(UpdaterComponent, { data: data.info });
      }
      if (data.stage && data.stage == 'update-downloaded') {
        await alert('New update Downloaded');
        const dialog = this.dialog.open(UpdaterComponent, { data: data.info });
      }
    });
  }

  ngOnDestroy(): void {
    this.closeAllPanelSubscription.unsubscribe();
    this.softwareUpdateSubscription.unsubscribe();
    this.salesSummaryComponentCloseSubscription.unsubscribe();
    this.orderSummaryComponentCloseSubscription.unsubscribe();
    this.closeOrderSubjectSubscription.unsubscribe();
    this.closeSalesSubjectSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    // console.log("this.el.nativeElement",this.el.nativeElement.offsetHeight);
    this.height = this.el.nativeElement.offsetHeight;
    if (this.dataProvider.touchMode) {
      // sales recognizer
      var mc = new Hammer.Manager(document.getElementById('salesTrigger'));
      mc.add(new Hammer.Press({ time: 500 }));
      mc.on('press', (ev: any) => {
        //  console.log("press",ev);
        const dialog = this.dialog.open(SalesSummaryComponent);
        this.salesSummaryComponentCloseSubscription = dialog.componentInstance?.close.subscribe((data) => {
          dialog.close();
        });
      });
      var mc = new Hammer.Manager(document.getElementById('ordersTrigger'));
      mc.add(new Hammer.Press({ time: 500 }));
      mc.on('press', (ev: any) => {
        //  console.log("press",ev);
        const dialog = this.dialog.open(OrderSummaryComponent);
        this.orderSummaryComponentCloseSubscription = dialog.componentInstance?.close.subscribe((data) => {
          dialog.close();
        });
      });
    }
  }

  ngOnInit(): void {
    // convert this.dataProvider.sale to string with K if greater than 1000 and L if greater than 100000

    // convert this.dataProvider.billToken to string with K if greater than 1000 and L if greater than 100000

    if (this.dataProvider.sale > 1000 && this.dataProvider.sale < 100000) {
      this.limitedSale = '₹' + (this.dataProvider.sale / 1000).toFixed(2) + 'K';
    } else if (this.dataProvider.sale > 100000) {
      this.limitedSale =
        '₹' + (this.dataProvider.sale / 100000).toFixed(2) + 'L';
    } else {
      this.limitedSale = '₹' + this.dataProvider.sale.toString() + '.00';
    }

    this.closeOrderSubjectSubscription = this.closeOrdersPanelSubscription
      .pipe(debounceTime(600))
      .subscribe((data) => {
        //  console.log("closePanelSubscription",data);
        this.isOpen = data;
      });
    this.closeSalesSubjectSubscription = this.closeSalesPanelSubscription
      .pipe(debounceTime(600))
      .subscribe((data) => {
        //  console.log("closePanelSubscription",data);
        this.isSalesOpen = data;
      });
  }

  ngOnChanges(): void {
    if (this.dataProvider.sale > 1000 && this.dataProvider.sale < 100000) {
      this.limitedSale = '₹' + (this.dataProvider.sale / 1000).toFixed(2) + 'K';
    } else if (this.dataProvider.sale > 100000) {
      this.limitedSale =
        '₹' + (this.dataProvider.sale / 100000).toFixed(2) + 'L';
    } else {
      this.limitedSale = '₹' + this.dataProvider.sale.toString() + '.00';
    }
  }

  openUpgrade() {
    // alert("Checking for updates")
    // this.dataProvider.loading = true;
    // let res = this.electronService.checkForUpdate()
    // if (res){
    //   res.then((res)=>{
    //   //  console.log("UPDATE RES",res);
    //   }).catch((error)=>{
    //   //  console.log("UPDATE RES error",error);
    //   }).finally(()=>{
    //     this.dataProvider.loading = false;
    //   })
    // } else {
    //   this.dataProvider.loading = false;
    // }
    // // const dialog = this.dialog.open(UpgradeComponent)
    // // dialog.closed.subscribe((data)=>{
    // //   // dialog.close();
    // // })
    this.electronService.checkForUpdate();
  }

  openReports() {
    this.dialog.open(ReportsComponent);
  }
}

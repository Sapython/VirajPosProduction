import { Dialog } from '@angular/cdk/dialog';
import { AfterViewInit, Component, EventEmitter, Output } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { CloseInComponent } from './close-in/close-in.component';
import { DispenseComponent } from './dispense/dispense.component';
import { ReceiveStockComponent } from './receive-stock/receive-stock.component';
import { DataProvider } from '../../../provider/data-provider.service';
import { StockValuationComponent } from './stock-valuation/stock-valuation.component';
import { CashCounterComponent } from './cash-counter/cash-counter.component';
declare var Hammer:any;
@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements AfterViewInit{
  stockValuation: number = 1234;
  totalCash: number = 1234;
  isReceivingSummaryOpen: boolean = false;
  isCashSummaryOpen: boolean = false;
  isStockValuationOpen: boolean = false;
  closeStockValuePanelSubscription:Subject<boolean> = new Subject<boolean>();
  cashCounterPanelSubscription:Subject<boolean> = new Subject<boolean>();
  @Output() close:EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(private dialog:Dialog,public dataProvider:DataProvider){
    this.closeStockValuePanelSubscription.pipe(debounceTime(600)).subscribe((data)=>{
      this.isStockValuationOpen = data;
    })
    this.cashCounterPanelSubscription.pipe(debounceTime(600)).subscribe((data)=>{
      this.isCashSummaryOpen = data;

    })
  }

  ngAfterViewInit(): void {
    if (this.dataProvider.touchMode){
      // sales recognizer
      var mc = new Hammer.Manager(document.getElementById('stockValuationTrigger'));
      mc.add( new Hammer.Press({ time:500 }) );
      mc.on("press", (ev:any) => {
        console.log("press",ev);
        const dialog = this.dialog.open(StockValuationComponent)
        dialog.componentInstance?.close.subscribe((data)=>{
          dialog.close();
        })
      });
      // cashCounterTrigger
      var mc = new Hammer.Manager(document.getElementById('cashCounterTrigger'));
      mc.add( new Hammer.Press({ time:500 }) );
      mc.on("press", (ev:any) => {
        console.log("press",ev);
        const dialog = this.dialog.open(CashCounterComponent)
        dialog.componentInstance?.close.subscribe((data)=>{
          dialog.close();
        })
      });
    }
  }

  openReceiving(){
    const dialog = this.dialog.open(ReceiveStockComponent)
  }

  openDispersion(){
    const dialog = this.dialog.open(DispenseComponent)
  }

  closeIn(){
    const dialog = this.dialog.open(CloseInComponent)
  }
}

import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Subject, debounceTime, filter, firstValueFrom } from 'rxjs';
import Fuse from 'fuse.js';
import {
  flipInYOnEnterAnimation,
  flipOutYOnLeaveAnimation,
  slideInDownOnEnterAnimation,
  slideOutUpOnLeaveAnimation,
} from 'angular-animations';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ReprintReasonComponent } from './reprint-reason/reprint-reason.component';
import { Timestamp } from '@angular/fire/firestore';
import { PrinterService } from '../../../../core/services/printing/printer/printer.service';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';
import { HistoryService } from '../../../../core/services/database/history/history.service';
import { BillService } from '../../../../core/services/database/bill/bill.service';
import {
  BillConstructor,
  PrintableBill,
} from '../../../../types/bill.structure';
import { KotConstructor, PrintableKot } from '../../../../types/kot.structure';
import { getPrintableBillConstructor } from '../../../../core/constructors/bill/methods/getHelpers.bill';
import { calculateBill } from '../../actions/split-bill/split-bill.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../../../types/product.structure';
import { ApplicableCombo } from '../../../../core/constructors/comboKot/comboKot';
import { TableService } from '../../../../core/services/database/table/table.service';
import { TableConstructor } from '../../../../types/table.structure';
import { ReportViewComponent } from './report-view/report-view.component';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  animations: [
    slideInDownOnEnterAnimation(),
    slideOutUpOnLeaveAnimation(),
    flipInYOnEnterAnimation(),
    flipOutYOnLeaveAnimation(),
  ],
})
export class HistoryComponent {
  totalSales: number = 0;
  totalCancelledSales: number = 0;
  startKot: string = '';
  endKot: string = '';
  groupByTable: boolean = false;
  groupByDate: boolean = false;
  loading: boolean = false;
  minimumAmount: number = 0;
  totalKots: number = 0;
  totalBills: number = 0;
  startingKotNumber: number | string = 0;
  endingKotNumber: number | string = 0;
  // mode vars
  currentMode: 'all' | 'dineIn' | 'takeaway' | 'online' = 'all';

  // Reports
  bills: ExtendedBillConstructor[] = [];
  filteredBills: ExtendedBillConstructor[] = [];
  fuseSearchInstance = new Fuse(this.bills, { keys: ['orderNo'] });
  numberSearchSubject: Subject<string> = new Subject<string>();
  dateRangeFormGroup: FormGroup = new FormGroup({
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
  });
  tablesCache:any[] = [];
  noFuture = (d: Date | null): boolean => {
    const today = new Date();
    return d!.valueOf() < today.valueOf();
  };
  constructor(
    private historyService: HistoryService,
    private tableService:TableService,
    private billService: BillService,
    private printingService: PrinterService,
    private dialog: Dialog,
    private dataProvider: DataProvider,
    public dialogRef: DialogRef,
  ) {
    this.numberSearchSubject.pipe(debounceTime(600)).subscribe((searchTerm) => {
      if (searchTerm.length > 0) {
        this.filteredBills = this.fuseSearchInstance
          .search(searchTerm)
          .map((result) => {
            return result.item;
          });
         console.log("filteredBills",this.filteredBills);
      } else {
        this.filteredBills = [];
      }
    });
    this.dateRangeFormGroup.valueChanges.subscribe((value) => {
      console.log('Picker range changed', value);
      if (this.dateRangeFormGroup.valid) {
        this.getReport();
      }
    });
  }

  endDateChanged(value: any) {
    console.log('value', value);
  }

  ngOnInit(): void {
    // patch value of dateRangeFormGroup with current date as startDate and endDate
    this.dateRangeFormGroup.patchValue({
      startDate: new Date(),
      endDate: new Date(),
    });
  }

  regenerateStats() {
    this.totalSales = 0;
    this.startKot = '';
    this.endKot = '';
    this.totalKots = 0;
    this.totalBills = 0;
    this.startingKotNumber = 0;
    this.endingKotNumber = 0;
    let filteredBills = this.bills.filter((bill) => {
      if (!bill){
        return
      }
      return this.currentMode == 'all' || bill.mode == this.currentMode;
    });
    filteredBills.forEach((bill) => {
      // recalculate stats totalSales, startKot, endKot, totalKots, totalBills, startingKotNumber, endingKotNumber
      if (bill.stage == 'hold'){
        return
      }
      if (!bill.cancelledReason){
        this.totalSales += bill.billing.grandTotal;
      } else {
        this.totalCancelledSales += bill.billing.grandTotal;
      }
      this.totalKots += bill.kots.length;
      this.totalBills++;
      if (bill.kots.length > 0){
        if (this.startingKotNumber == '') {
          this.startingKotNumber = bill.kots[0].id;
        }
        this.endingKotNumber = bill.kots[bill.kots.length - 1].id;
      }
    });
  }

  getReport() {
    this.loading = true;
    this.billService
      .getBillsByDay(
        this.dateRangeFormGroup.value.startDate,
        this.dateRangeFormGroup.value.endDate,
      )
      .then(async (bills) => {
        this.bills = await Promise.all(bills.docs.map(async (doc) => {
          var foundTable;
          if (doc.data()['mode']=='takeaway'){
            foundTable = this.tablesCache.find((table)=>table.id==doc.data()['id'] && table.type == 'token');
            if (!foundTable){
              let tableDoc = await this.tableService.getTablePromise(doc.data()['table'],'tokens');
              this.tablesCache.push({...tableDoc.data(),id:doc.data()['table'],type:'token'});
              foundTable = {...tableDoc.data(),id:doc.data()['table'],type:'token'};
            }
          } else if (doc.data()['mode']=='dineIn'){
            foundTable = this.tablesCache.find((table)=>table.id==doc.data()['table'] && table.type == 'table');
            if (!foundTable){
              let tableDoc = await this.tableService.getTablePromise(doc.data()['table'],'tables');
              this.tablesCache.push({...tableDoc.data(),id:doc.data()['table'],type:'table'});
              foundTable = {...tableDoc.data(),id:doc.data()['table'],type:'token'};
            }
          } else if (doc.data()['mode']=='online'){
            foundTable = this.tablesCache.find((table)=>table.id==doc.data()['table'] && table.type == 'online');
            if (!foundTable){
              let tableDoc = await this.tableService.getTablePromise(doc.data()['table'],'onlineTokens');
              this.tablesCache.push({...tableDoc.data(),id:doc.data()['table'],type:'online'});
              foundTable = {...tableDoc.data(),id:doc.data()['table'],type:'token'};
            }
          }
          let allProducts = doc.data().kots.reduce((acc, kot) => {
            acc.push(...kot.products);
            return acc;
          }, [] as any[]);
          console.log('BILL: ', doc.data());
          if (doc.data().settlement?.additionalInfo?.splitBill){
            // fetch splitted bill
            var splittedBills = await Promise.all(doc.data().settlement?.additionalInfo?.bills.map(async (splitBillId:string)=>{
              let billDoc = await this.billService.getSplittedBill(doc.id,splitBillId);
              console.log("allProducts",allProducts);
              let data = {
                ...billDoc.data(),
                id:doc.id,
              };
              return data;
            }));
            console.log("splittedBills",splittedBills);
          };
          // console.log("allProducts",allProducts);
          // let printableBillData = getPrintableBillConstructor(
          //   doc.data() as BillConstructor,
          //   allProducts,
          //   this.dataProvider,
          // );
          return {
            ...doc.data(),
            id: doc.id,
            kotVisible: false,
            table: foundTable,
            flipped: false,
            kotOrBillVisible: false,
            splittedBills,
          } as ExtendedBillConstructor;
        }));
        this.regenerateStats();
        this.bills.sort((a,b)=>{
          return (b.createdDate?.toDate().getTime() || 0) - (a.createdDate?.toDate().getTime() || 0);
        });
        this.bills = this.bills.filter((bill) => {
          if (!bill){
            return false
          }
          return bill.stage != 'hold';
        })
        // this.bills.reverse();
        this.fuseSearchInstance.setCollection(this.bills);
        this.loading = false;
      });
  }

  getGroupsByTable(bills: BillConstructor[]) {
    let groups = bills.reduce(
      (acc, bill) => {
        let index = acc.findIndex((group) => group.table == bill.table);
        if (index == -1) {
          acc.push({ table: bill.table, bills: [bill] });
        } else {
          acc[index].bills.push(bill);
        }
        return acc;
      },
      [] as { table: { id: string; name: string }; bills: BillConstructor[] }[],
    );
    return groups;
  }

  generateConsolidatedReport() {
    let filteredBills = this.bills.filter(
      (bill) =>
        bill.billing.grandTotal >= this.minimumAmount &&
        bill.stage == 'settled',
    );
  }

  openReport(){
    let dialog = this.dialog.open(ReportViewComponent,{data:this.dateRangeFormGroup.value});
  }

  
}
export interface ExtendedBillConstructor extends BillConstructor {
  kotVisible: boolean;
  flipped: boolean;
  kotOrBillVisible: 'kot' | 'bill' | false;
  splittedBills?: BillConstructor[];
  table:TableConstructor;
}


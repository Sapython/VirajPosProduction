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
  noFuture = (d: Date | null): boolean => {
    const today = new Date();
    return d!.valueOf() < today.valueOf();
  };
  constructor(
    private historyService: HistoryService,
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
      return this.currentMode == 'all' || bill.mode == this.currentMode;
    });
    filteredBills.forEach((bill) => {
      // recalculate stats totalSales, startKot, endKot, totalKots, totalBills, startingKotNumber, endingKotNumber
      this.totalSales += bill.billing.grandTotal;
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
    this.billService
      .getBillsByDay(
        this.dateRangeFormGroup.value.startDate,
        this.dateRangeFormGroup.value.endDate,
      )
      .then(async (bills) => {
        //  console.log("bills",bills.docs);
        this.bills.sort((a,b)=>{
          return (a.createdDate?.toDate().getTime() || 0) - (b.createdDate?.toDate().getTime() || 0);
        });
        this.bills = await Promise.all(bills.docs.map(async (doc) => {
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
            flipped: false,
            kotOrBillVisible: false,
            splittedBills,
          } as ExtendedBillConstructor;
        }));
        console.log("this.bills",this.bills);
        this.regenerateStats();
        this.bills.reverse();
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


  exportToPdf() {
    // do it by selected mode
    let filteredBills = this.bills.filter(
      (bill) => this.currentMode == 'all' || bill.mode == this.currentMode,
    );
    // create a jspdf doc with autotable
    // heading should be Bill No, Order No, Table, Time, Total, Mode
    // body should be the filtered bills
    // export to excel

    let doc = new jsPDF();
    autoTable(doc, {
      head: [
        ['Total KOT', 'Total Bills', 'Starting KOT', 'End KOT', 'Total Sales'],
      ],
      body: [
        [
          this.totalKots,
          this.totalBills,
          this.startingKotNumber,
          this.endingKotNumber,
          this.totalSales,
        ],
      ],
    });
    autoTable(doc, {
      head: [['Time', 'Mode', 'Table', 'Bill No', 'Order No', 'Total']],
      body: [
        ...filteredBills.map((bill: any) => {
          return [
            bill.createdDate.toDate().toLocaleString(),
            bill.mode,
            bill.table,
            bill.billNo || 'Unsettled',
            bill.orderNo,
            bill.billing.grandTotal,
          ];
        }),
      ],
    });
    doc.save('Bills Report.pdf');
  }

  exportToExcel() {
    // generate a csv file exactly same as exportToPdf function
    let filteredBills = this.bills.filter(
      (bill) => this.currentMode == 'all' || bill.mode == this.currentMode,
    );
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Total KOT,Total Bills,Starting KOT,End KOT,Total Sales\n';
    csvContent +=
      this.totalKots +
      ',' +
      this.totalBills +
      ',' +
      this.startingKotNumber +
      ',' +
      this.endingKotNumber +
      ',' +
      this.totalSales +
      '\n';
    csvContent += 'Time,Mode,Table,Bill No,Order No,Total\n';
    filteredBills.forEach((bill: any) => {
      csvContent +=
        bill.createdDate.toDate().toLocaleString().replace(',', ' ') +
        ',' +
        bill.mode +
        ',' +
        bill.table +
        ',' +
        (bill.billNo || 'Unsettled') +
        ',' +
        bill.orderNo +
        ',' +
        bill.billing.grandTotal +
        '\n';
    });
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Bills Report.csv');
    document.body.appendChild(link); // Required for FF
    link.click();
  }

  
}
export interface ExtendedBillConstructor extends BillConstructor {
  kotVisible: boolean;
  flipped: boolean;
  kotOrBillVisible: 'kot' | 'bill' | false;
  splittedBills?: BillConstructor[];
}


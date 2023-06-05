import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Subject, debounceTime, firstValueFrom } from 'rxjs';
import Fuse from 'fuse.js';
import { slideInDownOnEnterAnimation, slideOutUpOnLeaveAnimation } from 'angular-animations';
import { Dialog } from '@angular/cdk/dialog';
import { ReprintReasonComponent } from './reprint-reason/reprint-reason.component';
import { Timestamp } from '@angular/fire/firestore';
import { PrinterService } from '../../../../core/services/printing/printer/printer.service';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';
import { HistoryService } from '../../../../core/services/database/history/history.service';
import { BillService } from '../../../../core/services/database/bill/bill.service';
import { BillConstructor } from '../../../../types/bill.structure';
import { KotConstructor, PrintableKot } from '../../../../types/kot.structure';
import { getPrintableBillConstructor } from '../../../../core/constructors/bill/methods/getHelpers.bill';
import { calculateBill } from '../../actions/split-bill/split-bill.component';
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  animations:[
    slideInDownOnEnterAnimation(),
    slideOutUpOnLeaveAnimation()
  ]
})
export class HistoryComponent {
  selectedDate:Date = new Date();
  loading:boolean = false;
  minimumAmount:number = 0;
  // Reports
  bills:ExtendedBillConstructor[] = []
  filteredBills:ExtendedBillConstructor[] = []
  fuseSearchInstance = new Fuse(this.bills, {keys:['billNo','orderNo']})
  numberSearchSubject:Subject<string> = new Subject<string>();

  constructor(private historyService: HistoryService,private billService:BillService,private printingService:PrinterService,private dialog:Dialog,private dataProvider:DataProvider) {
    this.numberSearchSubject.pipe(debounceTime(600)).subscribe((searchTerm) => {
      if(searchTerm.length > 0){
        this.filteredBills = this.fuseSearchInstance.search(searchTerm).map((result) => {
          return result.item;
        })
      //  console.log("filteredBills",this.filteredBills);
      } else {
        this.filteredBills = [];
      }
    })
  }

  ngOnInit(): void {
    this.getReport();
  }

  getReport(){
    this.billService.getBillsByDay(this.selectedDate).then((bills) => {
    //  console.log("bills",bills.docs);
      this.bills = bills.docs.map((doc) => {
        return {...doc.data(),id:doc.id,kotVisible:false} as ExtendedBillConstructor;
      })
      this.fuseSearchInstance.setCollection(this.bills);
    //  console.log("bills",this.bills);
      this.loading = false;
    });
  }

  async reprintBill(bill:BillConstructor){
    const dialog = this.dialog.open(ReprintReasonComponent)
    let res = await firstValueFrom(dialog.closed)
    if(res && typeof res == 'string'){
      let userRes = this.dataProvider.currentUser.business.find((business) => business.businessId == this.dataProvider.currentBusiness.businessId)!;
      bill.billReprints.push({
        reprintReason:res,
        time:Timestamp.now(),
        user:{
          access:userRes.access.accessLevel,
          username:userRes.name,
        }
      });
      // let products = bill.kots.reduce((acc,kot) => {
      //   kot.products.forEach((product) => {
      //     let index = acc.findIndex((accProduct) => accProduct.name == product.name);
      //     if(index == -1){
      //       acc.push({...product,quantity:1});
      //     } else {
      //       acc[index].quantity++;
      //     }
      //   })
      //   return acc;
      // },[] as any[])
      // let printableBillData = getPrintableBillConstructor(bill,products,this.dataProvider)
      calculateBill(bill,this.dataProvider);
      this.printingService.reprintBill(bill.printableBillData);
    } else {
      alert("Reprint Cancelled")
      return;
    }
  }

  async reprintKot(kot:KotConstructor,bill:BillConstructor){
    const dialog = this.dialog.open(ReprintReasonComponent)
    let res = await firstValueFrom(dialog.closed)
    if(res && typeof res == 'string'){
      let printableKot:PrintableKot = {
        billingMode:bill.mode,
        // date in dd/mm/yyyy format
        date: kot.createdDate.toDate().toLocaleDateString('en-GB'),
        // time in 12 hour format
        time: kot.createdDate.toDate().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }),
        mode:'reprintKot',
        orderNo:bill.orderNo,
        products:kot.products.map((product)=>{
          return {
            id:product.id,
            category:product.category,
            instruction:product.instruction,
            name: product.name,
            quantity:product.quantity,
            edited:product.cancelled,
          }
        }),
        table:bill.table as unknown as string,
        token:kot.id,
      }
      this.printingService.printKot(printableKot)
      // this.printingService.reprintKot(kot,bill.table.name,bill);
    } else {
      alert("Reprint Cancelled")
      return;
    }
  }

  generateConsolidatedReport(){
    let filteredBills = this.bills.filter((bill) => bill.billing.grandTotal >=this.minimumAmount && bill.stage=='settled');
    // let consolidated = filteredBills.reduce((acc,bill) => {
    //   bill.modifiedAllProducts.forEach((product) => {
    //     let index = acc.findIndex((accProduct) => accProduct.name == product.name);
    //     if(index == -1){
    //       acc.push({...product,quantity:1});
    //     } else {
    //       acc[index].quantity++;
    //     }
    //   })
    //   return acc;
    // },[] as Product[])
    // let consolidated 
  }
}
interface ExtendedBillConstructor extends BillConstructor{
  kotVisible:boolean;
}
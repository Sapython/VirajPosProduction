import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BillConstructor, TableConstructor, KotConstructor, Product } from '../../constructors';
import { Subject, debounceTime, firstValueFrom } from 'rxjs';
import Fuse from 'fuse.js';
import { PrintingService } from '../../../services/printing.service';
import { DatabaseService } from '../../../services/database.service';
import { slideInDownOnEnterAnimation, slideOutUpOnLeaveAnimation } from 'angular-animations';
import { Dialog } from '@angular/cdk/dialog';
import { ReprintReasonComponent } from './reprint-reason/reprint-reason.component';
import { Timestamp } from '@angular/fire/firestore';
import { DataProvider } from '../../../provider/data-provider.service';
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
  // Reports
  bills:ExtendedBillConstructor[] = []
  filteredBills:ExtendedBillConstructor[] = []
  fuseSearchInstance = new Fuse(this.bills, {keys:['billNo','orderNo']})

  constructor(private databaseService: DatabaseService,private printingService:PrintingService,private dialog:Dialog,private dataProvider:DataProvider) {
    this.numberSearchSubject.pipe(debounceTime(600)).subscribe((searchTerm) => {
      if(searchTerm.length > 0){
        this.filteredBills = this.fuseSearchInstance.search(searchTerm).map((result) => {
          return result.item;
        })
      }
    })
  }

  numberSearchSubject:Subject<string> = new Subject<string>();
  ngOnInit(): void {
    this.getReport();
  }

  getReport(){
    this.databaseService.getBillsByDay(this.selectedDate).then((bills) => {
      console.log("bills",bills.docs);
      this.bills = bills.docs.map((doc) => {
        return {...doc.data(),id:doc.id,kotVisible:false} as ExtendedBillConstructor;
      })
      console.log("bills",this.bills);
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
      this.printingService.reprintBill(bill);
    } else {
      alert("Reprint Cancelled")
      return;
    }
  }

  reprintKot(kot:KotConstructor,bill:BillConstructor){
    this.printingService.reprintKot(kot,bill.table.name,bill.billNo||'');
  }
}
interface ExtendedBillConstructor extends BillConstructor{
  kotVisible:boolean;
}
import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BillConstructor, TableConstructor, KotConstructor, Product } from '../../constructors';
import { Subject, debounceTime } from 'rxjs';
import Fuse from 'fuse.js';
import { PrintingService } from '../../../services/printing.service';
import { DatabaseService } from '../../../services/database.service';
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {
  selectedDate:Date = new Date();
  loading:boolean = false;
  // Reports
  bills:ExtendedBillConstructor[] = []
  filteredBills:ExtendedBillConstructor[] = []
  fuseSearchInstance = new Fuse(this.bills, {keys:['billNo','orderNo']})

  constructor(private databaseService: DatabaseService,private printingService:PrintingService) {
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

  reprintBill(bill:BillConstructor){
    this.printingService.reprintBill(bill);
  }

  reprintKot(kot:KotConstructor,bill:BillConstructor){
    this.printingService.reprintKot(kot,bill.table.name,bill.billNo||'');
  }
}
interface ExtendedBillConstructor extends BillConstructor{
  kotVisible:boolean;
}
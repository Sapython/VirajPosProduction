import { Dialog } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { DataProvider } from '../provider/data-provider.service';
import { TableComponent } from './table/table.component';
import { CustomerPanelComponent } from './customer-panel/customer-panel.component';

@Component({
  selector: 'app-biller',
  templateUrl: './biller.component.html',
  styleUrls: ['./biller.component.scss']
})
export class BillerComponent {
  expanded:boolean = true;
  constructor(private dialog:Dialog,public dataProvider:DataProvider){
    this.dataProvider.openTableView.subscribe((open)=>{
      dialog.open(TableComponent)
    })
    this.dataProvider.currentBill?.updated.subscribe((bill)=>{
      alert("Bill Updated")
    })
  }

}

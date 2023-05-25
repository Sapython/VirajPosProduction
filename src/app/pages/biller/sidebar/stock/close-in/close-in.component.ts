import { Dialog } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { LockedComponent } from '../../../locked/locked.component';
import { ConfirmDialogComponent } from '../../../../../shared/helpers/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-close-in',
  templateUrl: './close-in.component.html',
  styleUrls: ['./close-in.component.scss']
})
export class CloseInComponent {
  items:any[] = [
    {
      name: 'Bread',
      quantity: 10,
      unit: 'kg',
      price: 1000,
    },
    {
      name: 'Bread',
      quantity: 10,
      unit: 'kg',
      price: 1000,
    },
    {
      name: 'Bread',
      quantity: 10,
      unit: 'kg',
      price: 1000,
    },
  ];
  constructor(private dialog:Dialog) { }
  closeIn(){
    // use confirm dialog
    const dialog = this.dialog.open(ConfirmDialogComponent,{data:{
      title: "Close In",
      message: "Are you sure you want to close in?",
      buttons:['No','Yes']
    }})
    dialog.closed.subscribe((data)=>{
      if(data){
        // close in
        alert("System closed")
        const lockDialog = this.dialog.open(LockedComponent)
        lockDialog.disableClose = true;

      }
    })
  }
}

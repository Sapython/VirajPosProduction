import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  constructor( @Inject(DIALOG_DATA) public modelData:ModelData = {buttons:['Cancel','Confirm'],title:'Are you sure ?'}, public dialogRef:DialogRef){}
}
export interface ModelData {
  title: string;
  message?: string;
  buttons: string[];
}

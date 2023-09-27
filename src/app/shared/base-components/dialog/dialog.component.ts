import { Component, EventEmitter, Inject, Input } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  shakeOnEnterAnimation,
  zoomOutOnLeaveAnimation,
} from 'angular-animations';
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  animations: [
    zoomOutOnLeaveAnimation(),
    shakeOnEnterAnimation({ duration: 500 }),
  ],
})
export class DialogComponent {
  buttons: string[];
  primary: number[];
  title: string;
  description: string;
  constructor(
    @Inject(DIALOG_DATA)
    data: {
      title: string;
      description: string;
      buttons: string[];
      primary: number[];
    },
    public dialogRef: DialogRef,
  ) {
    this.title = data.title || 'Are you sure ?';
    this.description = data.description || 'This action cannot be undone.';
    this.buttons = data.buttons || ['Cancel', 'Confirm'];
    this.primary = data.primary || [1];
  }
}

import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-rearrange',
  templateUrl: './rearrange.component.html',
  styleUrls: ['./rearrange.component.scss']
})
export class RearrangeComponent{
  constructor(@Inject(DIALOG_DATA) public data:{
    listItems:any[],
    mainKey:string
  },public dialogRef:DialogRef){}


  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.data.listItems, event.previousIndex, event.currentIndex);
  }
}

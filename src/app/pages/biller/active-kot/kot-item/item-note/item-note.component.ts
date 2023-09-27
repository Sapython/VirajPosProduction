import { DialogRef } from '@angular/cdk/dialog';
import { Element } from '@angular/compiler';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-item-note',
  templateUrl: './item-note.component.html',
  styleUrls: ['./item-note.component.scss']
})
export class ItemNoteComponent implements AfterViewInit {
  noteForm:FormGroup = new FormGroup({
    instruction:new FormControl('')
  });
  @ViewChild('instructionInput') instructionInput:ElementRef;
  constructor(public dialogRef:DialogRef,private dataProvider:DataProvider){}
  quickOptions:string[] = this.dataProvider.quickReasons;
  ngAfterViewInit(): void {
    setTimeout(()=>{
      this.instructionInput.nativeElement.focus()
    },200)
  }
}

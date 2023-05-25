import { Component } from '@angular/core';

@Component({
  selector: 'app-locked',
  templateUrl: './locked.component.html',
  styleUrls: ['./locked.component.scss']
})
export class LockedComponent {
  closeInName:string = "Kumar Saptam";
  date:Date = new Date();
} 

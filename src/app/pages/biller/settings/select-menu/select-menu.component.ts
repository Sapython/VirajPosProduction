import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { Menu } from '../../../../types/menu.structure';


@Component({
  selector: 'app-select-menu',
  templateUrl: './select-menu.component.html',
  styleUrls: ['./select-menu.component.scss']
})
export class SelectMenuComponent {
  constructor(@Inject(DIALOG_DATA) public data:{
    type:'dineIn'|'takeaway'|'online',
    value:string,
    menus:Menu[]
  },public dialogRef:DialogRef) {}
}

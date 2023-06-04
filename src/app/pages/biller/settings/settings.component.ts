import { DialogRef } from '@angular/cdk/dialog';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DataProvider } from '../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  activeTab:
    | 'printer'
    | 'account'
    | 'view'
    | 'about'
    | 'config'
    | 'discount'
    | 'payment'
    | 'taxes' = 'config';
    constructor(public dialogRef:DialogRef,public dataProvider:DataProvider){}
}
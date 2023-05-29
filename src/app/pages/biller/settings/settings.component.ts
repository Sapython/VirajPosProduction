import { DialogRef } from '@angular/cdk/dialog';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { debounceTime, firstValueFrom } from 'rxjs';
import { AlertsAndNotificationsService } from '../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { APP_CONFIG } from '../../../../environments/environment';
import { AddDiscountComponent } from './add-discount/add-discount.component';
import { ElectronService } from '../../../core/services';
import { SelectMenuComponent } from './select-menu/select-menu.component';
import { AddMethodComponent } from './add-method/add-method.component';
import { AddTaxComponent } from './add-tax/add-tax.component';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { CheckPasswordComponent } from './check-password/check-password.component';
import { CodeBaseDiscount } from '../../../types/discount.structure';
import { Tax } from '../../../types/tax.structure';
import { DataProvider } from '../../../core/services/provider/data-provider.service';
import { SettingsService } from '../../../core/services/database/settings/settings.service';
import { MenuManagementService } from '../../../core/services/database/menuManagement/menu-management.service';
import { ModeConfig } from '../../../core/constructors/menu/menu';
import { ProductsService } from '../../../core/services/database/products/products.service';

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
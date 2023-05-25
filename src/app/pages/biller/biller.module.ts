import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BillerRoutingModule } from './biller-routing.module';
import { BillerComponent } from './biller.component';
import { SearchPanelComponent } from './search-panel/search-panel.component';
import { SearchPanelModule } from './search-panel/search-panel.module';
import { ProductsPanelComponent } from './products-panel/products-panel.component';
import { ProductsPanelModule } from './products-panel/products-panel.module';
import { RecommendedModule } from './recommended/recommended.module';
import { EmergencyModule } from './emergency/emergency.module';
import { ActiveKotComponent } from './active-kot/active-kot.component';
import { CustomerPanelComponent } from './customer-panel/customer-panel.component';
import { SystemModule } from './system/system.module';
import { ActiveKotModule } from './active-kot/active-kot.module';
import { ActionsModule } from './actions/actions.module';
import { LockedComponent } from './locked/locked.component';
import { MatButtonModule } from '@angular/material/button';
import { TableModule } from './table/table.module';
import { SettingsComponent } from './settings/settings.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BaseComponentsModule } from '../../shared/base-components/base-components.module';
import { SidebarModule } from './sidebar/sidebar.module';
import { MatDialogModule } from '@angular/material/dialog';
import { AddDiscountComponent } from './settings/add-discount/add-discount.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactivateKotComponent } from './reactivate-kot/reactivate-kot.component';
import { SelectMenuComponent } from './settings/select-menu/select-menu.component';
import { AddMethodComponent } from './settings/add-method/add-method.component';
import { AddTaxComponent } from './settings/add-tax/add-tax.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CheckPasswordComponent } from './settings/check-password/check-password.component'; 

@NgModule({
  declarations: [
    BillerComponent,
    LockedComponent,
    SettingsComponent,
    CustomerPanelComponent,
    AddDiscountComponent,
    ReactivateKotComponent,
    SelectMenuComponent,
    AddMethodComponent,
    AddTaxComponent,
    CheckPasswordComponent
  ],
  imports: [
    CommonModule,
    BillerRoutingModule,
    SidebarModule,
    SearchPanelModule,ProductsPanelModule,
    RecommendedModule,
    EmergencyModule,
    SystemModule,
    ActiveKotModule,
    ActionsModule,
    MatButtonModule,
    TableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatOptionModule,
    MatIconModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    BaseComponentsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ]
})
export class BillerModule { }

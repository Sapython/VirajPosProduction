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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactivateKotComponent } from './reactivate-kot/reactivate-kot.component';
import { SelectMenuComponent } from './settings/select-menu/select-menu.component';
import { AddMethodComponent } from './settings/add-method/add-method.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CheckPasswordComponent } from './settings/check-password/check-password.component';
import { PrinterComponent } from './settings/sections/printer/printer.component';
import { AccountComponent } from './settings/sections/account/account.component';
import { ViewComponent } from './settings/sections/view/view.component';
import { AboutComponent } from './settings/sections/about/about.component';
import { ConfigComponent } from './settings/sections/config/config.component';
import { DiscountComponent } from './settings/sections/discount/discount.component';
import { PaymentComponent } from './settings/sections/payment/payment.component';
import { TaxesComponent } from './settings/sections/taxes/taxes.component';
import { AddComponent } from './settings/sections/account/add/add.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { LoyaltyComponent } from './settings/sections/loyalty/loyalty.component';
import { OffersComponent } from './settings/sections/offers/offers.component';

import { UpdateComponent } from './settings/sections/account/update/update.component';
import { SelectPropertiesComponent } from './settings/sections/account/select-properties/select-properties.component';
import { ChargesComponent } from './settings/sections/charges/charges.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { QuickReasonsComponent } from './settings/sections/quick-reasons/quick-reasons.component';
import { ResetComponent } from './settings/sections/config/reset/reset.component';
import { CountersComponent } from './settings/sections/counters/counters.component';
import { AddEditComponent } from './settings/sections/counters/add-edit/add-edit.component'; 

@NgModule({
  declarations: [
    BillerComponent,
    LockedComponent,
    SettingsComponent,
    CustomerPanelComponent,
    ReactivateKotComponent,
    SelectMenuComponent,
    AddMethodComponent,
    CheckPasswordComponent,
    PrinterComponent,
    AccountComponent,
    ViewComponent,
    AboutComponent,
    ConfigComponent,
    DiscountComponent,
    PaymentComponent,
    TaxesComponent,
    AddComponent,
    LoyaltyComponent,
    OffersComponent,
    UpdateComponent,
    SelectPropertiesComponent,
    ChargesComponent,
    QuickReasonsComponent,
    ResetComponent,
    CountersComponent,
    AddEditComponent,
  ],
  imports: [
    CommonModule,
    BillerRoutingModule,
    SidebarModule,
    SearchPanelModule,
    ProductsPanelModule,
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
    MatTooltipModule,
    MatAutocompleteModule,
    MatExpansionModule
  ],
})
export class BillerModule {}

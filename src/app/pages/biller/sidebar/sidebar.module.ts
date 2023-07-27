import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoPanelComponent } from './info-panel/info-panel.component';
import { MenuComponent } from './menu/menu.component';
import { CategoryCardComponent } from './menu/category-card/category-card.component';
import { StockComponent } from './stock/stock.component';
import { DispenseComponent } from './stock/dispense/dispense.component';
import { OptionComponent } from './menu/option/option.component';
import { MenuItemComponent } from './menu/option/menu-item/menu-item.component';
import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { EditMenuComponent } from './edit-menu/edit-menu.component';
import { ReceiveStockComponent } from './stock/receive-stock/receive-stock.component';
import { DispersionComponent } from './stock/dispersion/dispersion.component';
import { CloseInComponent } from './stock/close-in/close-in.component';
import { DispenseSmallComponent } from './stock/dispense-small/dispense-small.component';
import { ReceivingSmallComponent } from './stock/receiving-small/receiving-small.component';
import { ReceivingComponent } from './stock/receiving/receiving.component';
import { SidebarComponent } from './sidebar.component';
import { BrandingComponent } from './info-panel/branding/branding.component';
import { PopoverModule } from '../../../shared/popover/popover.module';
import { MatIconModule } from '@angular/material/icon'; 
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip'; 
import { MatRippleModule } from '@angular/material/core'; 

import { OverlayModule } from '@angular/cdk/overlay';
import { SalesSummaryComponent } from './info-panel/sales-summary/sales-summary.component';
import { OrderSummaryComponent } from './info-panel/order-summary/order-summary.component';
import { StockListComponent } from './menu/stock-list/stock-list.component';
import { StockValuationComponent } from './stock/stock-valuation/stock-valuation.component';
import { CashCounterComponent } from './stock/cash-counter/cash-counter.component'; 
import { DialogModule } from '@angular/cdk/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox'; 
import { MatSliderModule } from '@angular/material/slider'; 
import { AddNewCategoryComponent } from './edit-menu/add-new-category/add-new-category.component';
import { MatTabsModule } from '@angular/material/tabs'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HelpersModule } from '../../../shared/helpers/helpers.module';
import { MatStepperModule } from '@angular/material/stepper';
import { AddDishComponent } from './edit-menu/add-dish/add-dish.component';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { ReportsComponent } from './info-panel/sales-summary/reports/reports.component'; 
import { BaseComponentsModule } from '../../../shared/base-components/base-components.module';
import { ProductCostingComponent } from './edit-menu/product-costing/product-costing.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SelectRecipeComponent } from './edit-menu/select-recipe/select-recipe.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UpgradeComponent } from './info-panel/upgrade/upgrade.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AddMenuComponent } from './edit-menu/add-menu/add-menu.component';
import { SelectCategoryComponent } from './edit-menu/select-category/select-category.component'; 
import { MatRadioModule } from '@angular/material/radio'; 
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SetTaxComponent } from './edit-menu/set-tax/set-tax.component';
import { EnabledPipe } from './menu/enabled.pipe'; 
import { MatPaginatorModule } from '@angular/material/paginator';
import { AddComboComponent } from './edit-menu/add-combo/add-combo.component';
import { AddTypeComponent } from './edit-menu/add-type/add-type.component'; 
import { AddTaxComponent } from './edit-menu/add-tax/add-tax.component';
import { AddDiscountComponent } from './edit-menu/add-discount/add-discount.component';
import { AddTimeGroupComponent } from './edit-menu/add-time-group/add-time-group.component';
import {MatProgressBarModule} from '@angular/material/progress-bar'; 
import { UpdaterComponent } from './info-panel/updater/updater.component';
import { ReportViewComponent } from './info-panel/sales-summary/reports/report-view/report-view.component';
import { DaySummaryComponent } from './info-panel/sales-summary/reports/report-view/day-summary/day-summary.component';
import { ItemWiseSalesComponent } from './info-panel/sales-summary/reports/report-view/item-wise-sales/item-wise-sales.component';
import { DineInBillsComponent } from './info-panel/sales-summary/reports/report-view/dine-in-bills/dine-in-bills.component';
import { TakeawayBillsComponent } from './info-panel/sales-summary/reports/report-view/takeaway-bills/takeaway-bills.component';
import { OnlineBillsComponent } from './info-panel/sales-summary/reports/report-view/online-bills/online-bills.component';
import { KotWiseReportComponent } from './info-panel/sales-summary/reports/report-view/kot-wise-report/kot-wise-report.component';
import { ItemWiseReportComponent } from './info-panel/sales-summary/reports/report-view/item-wise-report/item-wise-report.component';
import { DiscountedBillsComponent } from './info-panel/sales-summary/reports/report-view/discounted-bills/discounted-bills.component';
import { NonChargeableBillsComponent } from './info-panel/sales-summary/reports/report-view/non-chargeable-bills/non-chargeable-bills.component';
import { BillEditsComponent } from './info-panel/sales-summary/reports/report-view/bill-edits/bill-edits.component';
import { CustomerWiseReportComponent } from './info-panel/sales-summary/reports/report-view/customer-wise-report/customer-wise-report.component';
import { HourlyItemSalesComponent } from './info-panel/sales-summary/reports/report-view/hourly-item-sales/hourly-item-sales.component';
import { KotEditsComponent } from './info-panel/sales-summary/reports/report-view/kot-edits/kot-edits.component';
import { PaymentWiseComponent } from './info-panel/sales-summary/reports/report-view/payment-wise/payment-wise.component';
import { WaiterWiseItemsComponent } from './info-panel/sales-summary/reports/report-view/waiter-wise-items/waiter-wise-items.component';
import { BillWiseComponent } from './info-panel/sales-summary/reports/report-view/bill-wise/bill-wise.component';
import { ConsolidatedComponent } from './info-panel/sales-summary/reports/report-view/consolidated/consolidated.component';
import { TableWiseComponent } from './info-panel/sales-summary/reports/report-view/table-wise/table-wise.component';
import { DiscountedBillsPipe } from './info-panel/sales-summary/reports/report-view/discounted-bills.pipe';
import { ComboComponent } from './info-panel/sales-summary/reports/report-view/combo/combo.component';
import { TableMergesComponent } from './info-panel/sales-summary/reports/report-view/table-merges/table-merges.component';
import { TableExchangesComponent } from './info-panel/sales-summary/reports/report-view/table-exchanges/table-exchanges.component';
import { TableSplitsComponent } from './info-panel/sales-summary/reports/report-view/table-splits/table-splits.component';
import { SplitBillsComponent } from './info-panel/sales-summary/reports/report-view/split-bills/split-bills.component';
import {MatChipsModule} from '@angular/material/chips'; 
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {MatExpansionModule} from '@angular/material/expansion'; 

@NgModule({
  declarations: [
    InfoPanelComponent,
    MenuComponent,
    CategoryCardComponent,
    StockComponent,
    ReceivingComponent,
    DispenseComponent,
    ReceivingSmallComponent,
    DispenseSmallComponent,
    OptionComponent,
    MenuItemComponent,
    InventoryListComponent,
    ReceiveStockComponent,
    DispersionComponent,
    CloseInComponent,
    SidebarComponent,
    BrandingComponent,
    SalesSummaryComponent,
    OrderSummaryComponent,
    StockListComponent,
    StockValuationComponent,
    CashCounterComponent,
    EditMenuComponent,
    AddNewCategoryComponent,
    AddDishComponent,
    ReportsComponent,
    ProductCostingComponent,
    SelectRecipeComponent,
    UpgradeComponent,
    AddMenuComponent,
    SelectCategoryComponent,
    SetTaxComponent,
    EnabledPipe,
    AddComboComponent,
    AddTypeComponent,
    AddTaxComponent,
    AddDiscountComponent,
    AddTimeGroupComponent,
    UpdaterComponent,
    ReportViewComponent,
    DaySummaryComponent,
    ItemWiseSalesComponent,
    DineInBillsComponent,
    TakeawayBillsComponent,
    OnlineBillsComponent,
    KotWiseReportComponent,
    ItemWiseReportComponent,
    DiscountedBillsComponent,
    NonChargeableBillsComponent,
    BillEditsComponent,
    CustomerWiseReportComponent,
    HourlyItemSalesComponent,
    KotEditsComponent,
    PaymentWiseComponent,
    WaiterWiseItemsComponent,
    BillWiseComponent,
    ConsolidatedComponent,
    TableWiseComponent,
    DiscountedBillsPipe,
    ComboComponent,
    TableMergesComponent,
    TableExchangesComponent,
    TableSplitsComponent,
    SplitBillsComponent
  ],
  imports: [
    CommonModule,
    PopoverModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatRippleModule,
    OverlayModule,
    DialogModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    HelpersModule,
    MatStepperModule,
    MatSelectModule,
    MatMenuModule,
    BaseComponentsModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatRadioModule,
    DragDropModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatExpansionModule
  ],
  exports:[SidebarComponent,AddDishComponent,AddNewCategoryComponent,SelectRecipeComponent]
})
export class SidebarModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActiveKotComponent } from './active-kot.component';
import { KotItemComponent } from './kot-item/kot-item.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseComponentsModule } from '../../../shared/base-components/base-components.module';
import { MergedProductsPipe } from './merged-products.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { LineDiscountComponent } from './kot-item/line-discount/line-discount.component';
import { LineCancelComponent } from './kot-item/line-cancel/line-cancel.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReasonComponent } from './reason/reason.component';
import { ManageKotComponent } from './sections/manage-kot/manage-kot.component';
import { NormalKotComponent } from './sections/normal-kot/normal-kot.component';
import { EditKotComponent } from './sections/edit-kot/edit-kot.component';
import { QuickKotViewComponent } from './sections/quick-kot-view/quick-kot-view.component';
import { BillPreviewComponent } from './sections/bill-preview/bill-preview.component';
import { CancelKOtComponent } from './cancel-kot/cancel-kot.component';
import { ComboItemComponent } from './combo-item/combo-item.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ItemNoteComponent } from './kot-item/item-note/item-note.component';
import { KotNoteComponent } from './sections/kot-note/kot-note.component';

@NgModule({
  declarations: [
    ActiveKotComponent,
    KotItemComponent,
    LineDiscountComponent,
    LineCancelComponent,
    ReasonComponent,
    ManageKotComponent,
    NormalKotComponent,
    EditKotComponent,
    QuickKotViewComponent,
    BillPreviewComponent,
    CancelKOtComponent,
    ComboItemComponent,
    ItemNoteComponent,
    KotNoteComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    BaseComponentsModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule
  ],
  exports: [ActiveKotComponent, KotItemComponent, BillPreviewComponent],
})
export class ActiveKotModule {}

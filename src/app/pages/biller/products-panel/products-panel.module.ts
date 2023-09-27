import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsPanelComponent } from './products-panel.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ProductCardComponent } from './product-card/product-card.component';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ComboCardComponent } from './combo-card/combo-card.component';
import { BaseComponentsModule } from '../../../shared/base-components/base-components.module';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { OpenProductComponent } from './open-product/open-product.component'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    ProductsPanelComponent,
    ProductCardComponent,
    ComboCardComponent,
    OpenProductComponent,
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    BaseComponentsModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [ProductsPanelComponent, ProductCardComponent],
})
export class ProductsPanelModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsPanelComponent } from './products-panel.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import { ProductCardComponent } from './product-card/product-card.component'; 
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  declarations: [ProductsPanelComponent, ProductCardComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRippleModule
  ],
  exports:[ProductsPanelComponent,ProductCardComponent]
})
export class ProductsPanelModule { }

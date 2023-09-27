import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecommendedComponent } from './recommended.component';
import { ProductsPanelModule } from '../products-panel/products-panel.module';

@NgModule({
  declarations: [RecommendedComponent],
  imports: [CommonModule, ProductsPanelModule],
  exports: [RecommendedComponent],
})
export class RecommendedModule {}

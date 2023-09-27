import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCostingComponent } from './product-costing.component';

describe('ProductCostingComponent', () => {
  let component: ProductCostingComponent;
  let fixture: ComponentFixture<ProductCostingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductCostingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCostingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

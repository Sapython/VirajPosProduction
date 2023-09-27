import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockValuationComponent } from './stock-valuation.component';

describe('StockValuationComponent', () => {
  let component: StockValuationComponent;
  let fixture: ComponentFixture<StockValuationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StockValuationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockValuationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

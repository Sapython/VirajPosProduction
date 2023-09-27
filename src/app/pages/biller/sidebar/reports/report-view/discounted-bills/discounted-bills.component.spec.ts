import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountedBillsComponent } from './discounted-bills.component';

describe('DiscountedBillsComponent', () => {
  let component: DiscountedBillsComponent;
  let fixture: ComponentFixture<DiscountedBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DiscountedBillsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DiscountedBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

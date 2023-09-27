import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HourlyItemSalesComponent } from './hourly-item-sales.component';

describe('HourlyItemSalesComponent', () => {
  let component: HourlyItemSalesComponent;
  let fixture: ComponentFixture<HourlyItemSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HourlyItemSalesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HourlyItemSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

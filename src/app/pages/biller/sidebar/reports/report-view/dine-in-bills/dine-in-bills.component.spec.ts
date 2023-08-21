import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DineInBillsComponent } from './dine-in-bills.component';

describe('DineInBillsComponent', () => {
  let component: DineInBillsComponent;
  let fixture: ComponentFixture<DineInBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DineInBillsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DineInBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

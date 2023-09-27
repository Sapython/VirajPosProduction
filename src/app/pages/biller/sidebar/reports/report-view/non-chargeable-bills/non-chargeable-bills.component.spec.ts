import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonChargeableBillsComponent } from './non-chargeable-bills.component';

describe('NonChargeableBillsComponent', () => {
  let component: NonChargeableBillsComponent;
  let fixture: ComponentFixture<NonChargeableBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NonChargeableBillsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NonChargeableBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

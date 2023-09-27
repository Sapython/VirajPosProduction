import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentWiseComponent } from './payment-wise.component';

describe('PaymentWiseComponent', () => {
  let component: PaymentWiseComponent;
  let fixture: ComponentFixture<PaymentWiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentWiseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentWiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

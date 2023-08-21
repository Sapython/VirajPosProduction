import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillWiseComponent } from './bill-wise.component';

describe('BillWiseComponent', () => {
  let component: BillWiseComponent;
  let fixture: ComponentFixture<BillWiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillWiseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BillWiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

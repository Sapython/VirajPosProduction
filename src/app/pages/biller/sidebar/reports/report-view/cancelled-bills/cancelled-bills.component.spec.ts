import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelledBillsComponent } from './cancelled-bills.component';

describe('CancelledBillsComponent', () => {
  let component: CancelledBillsComponent;
  let fixture: ComponentFixture<CancelledBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelledBillsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelledBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

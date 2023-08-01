import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeawayBillsComponent } from './takeaway-bills.component';

describe('TakeawayBillsComponent', () => {
  let component: TakeawayBillsComponent;
  let fixture: ComponentFixture<TakeawayBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TakeawayBillsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TakeawayBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

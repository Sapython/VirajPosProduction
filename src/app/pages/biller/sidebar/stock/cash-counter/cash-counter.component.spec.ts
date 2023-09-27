import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashCounterComponent } from './cash-counter.component';

describe('CashCounterComponent', () => {
  let component: CashCounterComponent;
  let fixture: ComponentFixture<CashCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CashCounterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CashCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

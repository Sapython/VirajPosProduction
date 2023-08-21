import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitBillsComponent } from './split-bills.component';

describe('SplitBillsComponent', () => {
  let component: SplitBillsComponent;
  let fixture: ComponentFixture<SplitBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SplitBillsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SplitBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

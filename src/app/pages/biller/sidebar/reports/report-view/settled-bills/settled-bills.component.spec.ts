import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettledBillsComponent } from './settled-bills.component';

describe('SettledBillsComponent', () => {
  let component: SettledBillsComponent;
  let fixture: ComponentFixture<SettledBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettledBillsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettledBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

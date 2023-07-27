import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeExchangeTableComponent } from './merge-exchange-table.component';

describe('MergeExchangeTableComponent', () => {
  let component: MergeExchangeTableComponent;
  let fixture: ComponentFixture<MergeExchangeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MergeExchangeTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MergeExchangeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

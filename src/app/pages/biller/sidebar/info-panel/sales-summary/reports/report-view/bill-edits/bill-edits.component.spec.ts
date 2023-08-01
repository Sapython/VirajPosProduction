import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillEditsComponent } from './bill-edits.component';

describe('BillEditsComponent', () => {
  let component: BillEditsComponent;
  let fixture: ComponentFixture<BillEditsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillEditsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BillEditsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

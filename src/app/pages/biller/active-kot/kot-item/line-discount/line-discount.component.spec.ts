import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineDiscountComponent } from './line-discount.component';

describe('LineDiscountComponent', () => {
  let component: LineDiscountComponent;
  let fixture: ComponentFixture<LineDiscountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LineDiscountComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

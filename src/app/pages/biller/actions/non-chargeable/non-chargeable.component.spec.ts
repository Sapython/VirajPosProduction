import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonChargeableComponent } from './non-chargeable.component';

describe('NonChargeableComponent', () => {
  let component: NonChargeableComponent;
  let fixture: ComponentFixture<NonChargeableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NonChargeableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NonChargeableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

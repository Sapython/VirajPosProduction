import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillerComponent } from './biller.component';

describe('BillerComponent', () => {
  let component: BillerComponent;
  let fixture: ComponentFixture<BillerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

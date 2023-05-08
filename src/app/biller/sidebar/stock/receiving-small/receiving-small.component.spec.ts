import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivingSmallComponent } from './receiving-small.component';

describe('ReceivingSmallComponent', () => {
  let component: ReceivingSmallComponent;
  let fixture: ComponentFixture<ReceivingSmallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceivingSmallComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivingSmallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

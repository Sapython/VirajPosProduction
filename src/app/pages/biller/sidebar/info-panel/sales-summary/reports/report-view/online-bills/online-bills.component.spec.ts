import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineBillsComponent } from './online-bills.component';

describe('OnlineBillsComponent', () => {
  let component: OnlineBillsComponent;
  let fixture: ComponentFixture<OnlineBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OnlineBillsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OnlineBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

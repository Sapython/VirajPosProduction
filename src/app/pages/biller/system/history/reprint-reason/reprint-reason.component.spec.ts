import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReprintReasonComponent } from './reprint-reason.component';

describe('ReprintReasonComponent', () => {
  let component: ReprintReasonComponent;
  let fixture: ComponentFixture<ReprintReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReprintReasonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReprintReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

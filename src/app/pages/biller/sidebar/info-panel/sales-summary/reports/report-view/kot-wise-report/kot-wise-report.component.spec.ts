import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KotWiseReportComponent } from './kot-wise-report.component';

describe('KotWiseReportComponent', () => {
  let component: KotWiseReportComponent;
  let fixture: ComponentFixture<KotWiseReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KotWiseReportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KotWiseReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

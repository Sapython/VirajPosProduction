import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelKOtComponent } from './cancel-kot.component';

describe('CancelKOtComponent', () => {
  let component: CancelKOtComponent;
  let fixture: ComponentFixture<CancelKOtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelKOtComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelKOtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

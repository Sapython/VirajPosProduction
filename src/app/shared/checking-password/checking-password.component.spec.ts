import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckingPasswordComponent } from './checking-password.component';

describe('CheckingPasswordComponent', () => {
  let component: CheckingPasswordComponent;
  let fixture: ComponentFixture<CheckingPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckingPasswordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckingPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetChargesComponent } from './set-charges.component';

describe('SetChargesComponent', () => {
  let component: SetChargesComponent;
  let fixture: ComponentFixture<SetChargesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetChargesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

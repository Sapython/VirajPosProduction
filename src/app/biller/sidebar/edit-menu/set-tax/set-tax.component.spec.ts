import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetTaxComponent } from './set-tax.component';

describe('SetTaxComponent', () => {
  let component: SetTaxComponent;
  let fixture: ComponentFixture<SetTaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetTaxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetTaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

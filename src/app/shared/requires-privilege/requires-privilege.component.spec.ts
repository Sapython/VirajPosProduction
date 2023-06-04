import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequiresPrivilegeComponent } from './requires-privilege.component';

describe('RequiresPrivilegeComponent', () => {
  let component: RequiresPrivilegeComponent;
  let fixture: ComponentFixture<RequiresPrivilegeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequiresPrivilegeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequiresPrivilegeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

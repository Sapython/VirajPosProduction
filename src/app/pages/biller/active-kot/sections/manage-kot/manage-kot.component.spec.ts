import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageKotComponent } from './manage-kot.component';

describe('ManageKotComponent', () => {
  let component: ManageKotComponent;
  let fixture: ComponentFixture<ManageKotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageKotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageKotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

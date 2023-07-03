import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTimeGroupComponent } from './add-time-group.component';

describe('AddTimeGroupComponent', () => {
  let component: AddTimeGroupComponent;
  let fixture: ComponentFixture<AddTimeGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTimeGroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTimeGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

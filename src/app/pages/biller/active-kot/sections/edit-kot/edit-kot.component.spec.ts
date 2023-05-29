import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditKotComponent } from './edit-kot.component';

describe('EditKotComponent', () => {
  let component: EditKotComponent;
  let fixture: ComponentFixture<EditKotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditKotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditKotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPropertiesComponent } from './select-properties.component';

describe('SelectPropertiesComponent', () => {
  let component: SelectPropertiesComponent;
  let fixture: ComponentFixture<SelectPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectPropertiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

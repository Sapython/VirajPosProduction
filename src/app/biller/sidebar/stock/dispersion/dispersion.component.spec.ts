import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispersionComponent } from './dispersion.component';

describe('DispersionComponent', () => {
  let component: DispersionComponent;
  let fixture: ComponentFixture<DispersionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DispersionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DispersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

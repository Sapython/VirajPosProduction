import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispenseSmallComponent } from './dispense-small.component';

describe('DispenseSmallComponent', () => {
  let component: DispenseSmallComponent;
  let fixture: ComponentFixture<DispenseSmallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DispenseSmallComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DispenseSmallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

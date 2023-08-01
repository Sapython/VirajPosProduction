import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveKotComponent } from './active-kot.component';

describe('ActiveKotComponent', () => {
  let component: ActiveKotComponent;
  let fixture: ComponentFixture<ActiveKotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActiveKotComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveKotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

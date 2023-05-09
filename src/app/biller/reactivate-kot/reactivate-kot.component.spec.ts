import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactivateKotComponent } from './reactivate-kot.component';

describe('ReactivateKotComponent', () => {
  let component: ReactivateKotComponent;
  let fixture: ComponentFixture<ReactivateKotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReactivateKotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReactivateKotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

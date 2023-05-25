import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineCancelComponent } from './line-cancel.component';

describe('LineCancelComponent', () => {
  let component: LineCancelComponent;
  let fixture: ComponentFixture<LineCancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LineCancelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

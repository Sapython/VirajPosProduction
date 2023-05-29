import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalKotComponent } from './normal-kot.component';

describe('NormalKotComponent', () => {
  let component: NormalKotComponent;
  let fixture: ComponentFixture<NormalKotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NormalKotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NormalKotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

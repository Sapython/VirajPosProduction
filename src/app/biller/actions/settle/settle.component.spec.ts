import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettleComponent } from './settle.component';

describe('SettleComponent', () => {
  let component: SettleComponent;
  let fixture: ComponentFixture<SettleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

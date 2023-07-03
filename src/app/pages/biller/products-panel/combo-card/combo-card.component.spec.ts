import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboCardComponent } from './combo-card.component';

describe('ComboCardComponent', () => {
  let component: ComboCardComponent;
  let fixture: ComponentFixture<ComboCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComboCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComboCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

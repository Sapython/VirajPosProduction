import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveKotItemComponent } from './move-kot-item.component';

describe('MoveKotItemComponent', () => {
  let component: MoveKotItemComponent;
  let fixture: ComponentFixture<MoveKotItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveKotItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MoveKotItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

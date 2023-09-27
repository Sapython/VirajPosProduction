import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KotItemComponent } from './kot-item.component';

describe('KotItemComponent', () => {
  let component: KotItemComponent;
  let fixture: ComponentFixture<KotItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KotItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KotItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

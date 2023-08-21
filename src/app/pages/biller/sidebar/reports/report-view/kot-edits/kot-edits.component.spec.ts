import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KotEditsComponent } from './kot-edits.component';

describe('KotEditsComponent', () => {
  let component: KotEditsComponent;
  let fixture: ComponentFixture<KotEditsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KotEditsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KotEditsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

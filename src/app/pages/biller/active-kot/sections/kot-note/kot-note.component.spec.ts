import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KotNoteComponent } from './kot-note.component';

describe('KotNoteComponent', () => {
  let component: KotNoteComponent;
  let fixture: ComponentFixture<KotNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KotNoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KotNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

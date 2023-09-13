import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemNoteComponent } from './item-note.component';

describe('ItemNoteComponent', () => {
  let component: ItemNoteComponent;
  let fixture: ComponentFixture<ItemNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemNoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

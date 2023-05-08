import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseInComponent } from './close-in.component';

describe('CloseInComponent', () => {
  let component: CloseInComponent;
  let fixture: ComponentFixture<CloseInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseInComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloseInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisperseComponent } from './disperse.component';

describe('DisperseComponent', () => {
  let component: DisperseComponent;
  let fixture: ComponentFixture<DisperseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DisperseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DisperseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

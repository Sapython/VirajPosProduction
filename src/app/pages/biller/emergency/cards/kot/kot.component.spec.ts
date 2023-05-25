import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KotComponent } from './kot.component';

describe('KotComponent', () => {
  let component: KotComponent;
  let fixture: ComponentFixture<KotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

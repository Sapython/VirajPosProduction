import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenProductComponent } from './open-product.component';

describe('OpenProductComponent', () => {
  let component: OpenProductComponent;
  let fixture: ComponentFixture<OpenProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenProductComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

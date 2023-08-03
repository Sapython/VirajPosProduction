import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMainCategoryComponent } from './add-main-category.component';

describe('AddMainCategoryComponent', () => {
  let component: AddMainCategoryComponent;
  let fixture: ComponentFixture<AddMainCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMainCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMainCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

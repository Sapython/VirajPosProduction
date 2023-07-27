import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemWiseSalesComponent } from './item-wise-sales.component';

describe('ItemWiseSalesComponent', () => {
  let component: ItemWiseSalesComponent;
  let fixture: ComponentFixture<ItemWiseSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemWiseSalesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemWiseSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

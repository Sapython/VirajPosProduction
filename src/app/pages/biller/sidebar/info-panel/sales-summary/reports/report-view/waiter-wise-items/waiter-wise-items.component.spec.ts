import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaiterWiseItemsComponent } from './waiter-wise-items.component';

describe('WaiterWiseItemsComponent', () => {
  let component: WaiterWiseItemsComponent;
  let fixture: ComponentFixture<WaiterWiseItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WaiterWiseItemsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WaiterWiseItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLoyaltySettingComponent } from './add-loyalty-setting.component';

describe('AddLoyaltySettingComponent', () => {
  let component: AddLoyaltySettingComponent;
  let fixture: ComponentFixture<AddLoyaltySettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddLoyaltySettingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddLoyaltySettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

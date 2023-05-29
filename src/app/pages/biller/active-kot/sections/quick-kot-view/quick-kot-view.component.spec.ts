import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickKotViewComponent } from './quick-kot-view.component';

describe('QuickKotViewComponent', () => {
  let component: QuickKotViewComponent;
  let fixture: ComponentFixture<QuickKotViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuickKotViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickKotViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

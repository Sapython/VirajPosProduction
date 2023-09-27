import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickReasonsComponent } from './quick-reasons.component';

describe('QuickReasonsComponent', () => {
  let component: QuickReasonsComponent;
  let fixture: ComponentFixture<QuickReasonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuickReasonsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickReasonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

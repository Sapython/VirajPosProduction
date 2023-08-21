import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSplitsComponent } from './table-splits.component';

describe('TableSplitsComponent', () => {
  let component: TableSplitsComponent;
  let fixture: ComponentFixture<TableSplitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableSplitsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableSplitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

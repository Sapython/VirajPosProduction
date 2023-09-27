import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableMergesComponent } from './table-merges.component';

describe('TableMergesComponent', () => {
  let component: TableMergesComponent;
  let fixture: ComponentFixture<TableMergesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableMergesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableMergesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

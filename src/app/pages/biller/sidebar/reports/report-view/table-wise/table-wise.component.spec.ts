import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableWiseComponent } from './table-wise.component';

describe('TableWiseComponent', () => {
  let component: TableWiseComponent;
  let fixture: ComponentFixture<TableWiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableWiseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableWiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

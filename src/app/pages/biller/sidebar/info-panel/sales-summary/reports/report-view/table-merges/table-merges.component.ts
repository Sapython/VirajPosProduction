import { Component } from '@angular/core';
import { TableActivity } from '../../../../../../../../core/services/database/table/table.service';
import { ReplaySubject } from 'rxjs';
import { ReportService } from '../../report.service';

@Component({
  selector: 'app-table-merges',
  templateUrl: './table-merges.component.html',
  styleUrls: ['./table-merges.component.scss']
})
export class TableMergesComponent {
  tableMergeReport:ReplaySubject<TableActivity[]> = new ReplaySubject<TableActivity[]>(1);
  loading:boolean = true;
  constructor(private reportService:ReportService){}

  ngOnInit(): void {
    this.loading = true;
    this.reportService.dataChanged.subscribe(()=>{
      this.reportService.getTableActivity().then((res:any)=>{
        this.tableMergeReport.next(res);
      }).finally(()=>{
        this.loading = false;
      });
    });
  }
}

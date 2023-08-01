import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss'],
})
export class OrderSummaryComponent {
  @Input() dine: number = 9;
  @Input() takeAway: number = 15;
  @Input() online: number = 10;
  @Input() nonChargable: number = 45;
  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>();
  total: number = this.dine + this.takeAway + this.online + this.nonChargable;
  @ViewChild('myChart') myChart:
    | { nativeElement: HTMLCanvasElement }
    | undefined;
  barThickness = 40;
  ngAfterViewInit(): void {
    const DATA_COUNT = 7;
    const NUMBER_CFG = { count: DATA_COUNT, min: -100, max: 100 };
    // 7 months
    const labels = ['Orders'];
    const data = {
      labels: labels,
      datasets: [
        {
          data: [this.dine],
          backgroundColor: '#FF6384',
          borderSkipped: false,
          borderRadius: Number.MAX_VALUE,
          width: '20px',
          barThickness: this.barThickness,
        },
        {
          data: [this.takeAway],
          backgroundColor: '#36A2EB',
          width: '20px',
          barThickness: this.barThickness,
        },
        {
          data: [this.online],
          backgroundColor: '#FFCE56',
          width: '20px',
          barThickness: this.barThickness,
        },
        {
          data: [this.nonChargable],
          backgroundColor: '#4BC0C0',
          borderRadius: Number.MAX_VALUE,
          width: '20px',
          barThickness: this.barThickness,
        },
      ],
    };
    if (this.myChart) {
      //  console.log("this.myChart",this.myChart);
      new Chart(this.myChart.nativeElement, {
        type: 'bar',
        data: data,
        options: {
          // responsive:true,
          // maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            decimation: {
              enabled: false,
            },
            title: {
              display: false,
            },
            tooltip: {
              enabled: false,
            },
          },
          indexAxis: 'y',
          scales: {
            x: {
              stacked: true,
              display: false,
            },
            y: {
              stacked: true,
              display: false,
            },
          },
        },
      });
    }
  }
}

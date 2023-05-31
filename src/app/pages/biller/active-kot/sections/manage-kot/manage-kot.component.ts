import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Kot } from '../../../../../core/constructors/kot/Kot';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { zoomInOnEnterAnimation, zoomOutOnLeaveAnimation } from 'angular-animations';
import { Product } from '../../../../../types/product.structure';

@Component({
  selector: 'app-manage-kot',
  templateUrl: './manage-kot.component.html',
  styleUrls: ['./manage-kot.component.scss'],
  animations:[zoomInOnEnterAnimation({duration:300}),
    zoomOutOnLeaveAnimation({duration:300}),]
})
export class ManageKotComponent {
   @Input() allKot: Kot[] = [];
   @Input() kotNoColors:any[] = [];
   @Output() printKot = new EventEmitter<Kot>();
   @Output() deleteKot = new EventEmitter<Kot>();
   @Output() editKot = new EventEmitter<Kot>();
   @Output() saveEditedKot = new EventEmitter<Kot>();
   @Output() delete = new EventEmitter<Product>();
   constructor(public dataProvider:DataProvider){}
}

import { Component, Input } from '@angular/core';
import { UserBusiness } from '../../../../types/user.structure';

@Component({
  selector: 'app-business-card',
  templateUrl: './business-card.component.html',
  styleUrls: ['./business-card.component.scss']
})
export class BusinessCardComponent {
  @Input() business:UserBusiness;
  @Input() userId:string;
}

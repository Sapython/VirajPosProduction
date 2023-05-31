import { Component } from '@angular/core';
import { bounceInUpOnEnterAnimation, bounceOutUpOnLeaveAnimation } from 'angular-animations';

@Component({
  selector: 'app-checking-password',
  templateUrl: './checking-password.component.html',
  styleUrls: ['./checking-password.component.scss'],
  animations:[
    bounceInUpOnEnterAnimation(),
    bounceOutUpOnLeaveAnimation()
  ]
})
export class CheckingPasswordComponent {

}

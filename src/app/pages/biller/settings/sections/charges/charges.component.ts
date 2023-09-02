import { Component } from '@angular/core';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { MenuManagementService } from '../../../../../core/services/database/menuManagement/menu-management.service';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';

@Component({
  selector: 'app-charges',
  templateUrl: './charges.component.html',
  styleUrls: ['./charges.component.scss']
})
export class ChargesComponent {
  constructor(public dataProvider:DataProvider,private menuMgmtService:MenuManagementService,private alertify:AlertsAndNotificationsService) { }

  updateSettings(){
    this.menuMgmtService.updateRootSettings({"charges":this.dataProvider.charges},this.dataProvider.currentBusiness.businessId).then((res)=>{
      this.alertify.presentToast('Settings Updated');
    }).catch((err)=>{
      this.alertify.presentToast('Error Updating Settings');
    });
  }
}


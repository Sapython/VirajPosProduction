import { Component } from '@angular/core';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { MenuManagementService } from '../../../../../core/services/database/menuManagement/menu-management.service';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent {
  viewSettings: FormGroup = new FormGroup({
    smartView: new FormControl(false),
    touchMode: new FormControl(false),
  });
  constructor(public dataProvider:DataProvider,private alertify:AlertsAndNotificationsService,private menuManagementService:MenuManagementService){
    this.viewSettings.patchValue(
      localStorage.getItem('viewSettings')
        ? JSON.parse(localStorage.getItem('viewSettings')!)
        : {}
    );
    this.viewSettings.valueChanges
      .pipe(debounceTime(1000))
      .subscribe((data) => {
        localStorage.setItem('viewSettings', JSON.stringify(data));
      });
  }
  smartModeToggle(value: boolean) {
    localStorage.setItem(
      'viewSettings',
      JSON.stringify({
        smartView: value,
        touchMode: this.dataProvider.touchMode,
      })
    );
    this.dataProvider.smartMode = value;
    console.log(localStorage.getItem('viewSettings'));
  }

  touchModeToggle(value: boolean) {
    localStorage.setItem(
      'viewSettings',
      JSON.stringify({
        touchMode: value,
        smartView: this.dataProvider.smartMode,
      })
    );
    this.dataProvider.touchMode = value;
    console.log(localStorage.getItem('viewSettings'));
  }
  setLocalShowTable(event: any) {
    localStorage.setItem('showTable', JSON.stringify(event.target.checked));
  }

  updateSettings(data: any) {
    this.menuManagementService
      .updateRootSettings(data, this.dataProvider.currentBusiness?.businessId!)
      .then(() => {
        this.alertify.presentToast('Settings updated successfully');
      })
      .catch((err) => {
        this.alertify.presentToast('Error while updating settings');
      });
  }
}

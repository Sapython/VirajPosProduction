import { Component } from '@angular/core';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { MenuManagementService } from '../../../../../core/services/database/menuManagement/menu-management.service';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs';
import {
  zoomInOnEnterAnimation,
  zoomOutOnLeaveAnimation,
} from 'angular-animations';
var debug: boolean = true;
@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  animations: [zoomInOnEnterAnimation(), zoomOutOnLeaveAnimation()],
})
export class ViewComponent {
  viewSettings: FormGroup = new FormGroup({
    smartView: new FormControl(false),
    touchMode: new FormControl(false),
  });
  constructor(
    public dataProvider: DataProvider,
    private alertify: AlertsAndNotificationsService,
    private menuManagementService: MenuManagementService,
  ) {
    this.viewSettings.patchValue(
      localStorage.getItem('viewSettings')
        ? JSON.parse(localStorage.getItem('viewSettings')!)
        : {},
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
      }),
    );
    this.dataProvider.smartMode = value;
    //  console.log(localStorage.getItem('viewSettings'));
  }

  touchModeToggle(value: boolean) {
    localStorage.setItem(
      'viewSettings',
      JSON.stringify({
        touchMode: value,
        smartView: this.dataProvider.smartMode,
      }),
    );
    this.dataProvider.touchMode = value;
    //  console.log(localStorage.getItem('viewSettings'));
  }
  setLocalShowTable(event: any) {
    localStorage.setItem(
      'showTable',
      JSON.stringify(this.dataProvider.showTableOnBillAction),
    );
    this.alertify.presentToast('Settings updated successfully');
  }

  updateSettings(data: any) {
    if (debug) console.log('Updating settings Data', data);

    this.menuManagementService
      .updateRootSettings(data, this.dataProvider.currentBusiness?.businessId!)
      .then(() => {
        this.alertify.presentToast('Settings updated successfully');
      })
      .catch((err) => {
        this.alertify.presentToast('Error while updating settings');
      });
  }

  isValidNumber(number: any) {
    console.log(
      'number',
      number,
      !Number(number) || typeof number !== 'number' || number < 0,
    );
    if (!Number(number) || typeof number !== 'number' || number < 0) {
      alert('Please enter a valid number');
      return false;
    } else {
      return true;
    }
  }

  setNewTime() {
    if (
      isNaN(Number(this.dataProvider.editKotTime)) ||
      typeof this.dataProvider.editKotTime !== 'number' ||
      this.dataProvider.editKotTime < 0
    ) {
      alert('Please enter a valid number');
      this.dataProvider.editKotTime = 0;
      return;
    }
    this.updateSettings({ editKotTime: this.dataProvider.editKotTime });
  }
}

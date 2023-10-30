import { Component, OnDestroy } from '@angular/core';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { MenuManagementService } from '../../../../../core/services/database/menuManagement/menu-management.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription, debounceTime, firstValueFrom } from 'rxjs';
import {
  zoomInOnEnterAnimation,
  zoomOutOnLeaveAnimation,
} from 'angular-animations';
import { Dialog } from '@angular/cdk/dialog';
import { PromptComponent } from '../../../../../shared/base-components/prompt/prompt.component';
var debug: boolean = true;
@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  animations: [zoomInOnEnterAnimation(), zoomOutOnLeaveAnimation()],
})
export class ViewComponent implements OnDestroy {
  viewSettings: FormGroup = new FormGroup({
    smartView: new FormControl(false),
    touchMode: new FormControl(false),
  });
  valueChangesSubscription: Subscription = Subscription.EMPTY;
  constructor(
    public dataProvider: DataProvider,
    private alertify: AlertsAndNotificationsService,
    private menuManagementService: MenuManagementService,
    private dialog:Dialog
  ) {
    this.viewSettings.patchValue(
      localStorage.getItem('viewSettings')
        ? JSON.parse(localStorage.getItem('viewSettings')!)
        : {},
    );
    this.valueChangesSubscription = this.viewSettings.valueChanges
      .pipe(debounceTime(1000))
      .subscribe((data) => {
        localStorage.setItem('viewSettings', JSON.stringify(data));
      });
  }

  ngOnDestroy(): void {
    this.valueChangesSubscription.unsubscribe();
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

  updateLocalSettings(data: any) {
    if (debug) console.log('Updating settings Data', data);
    this.menuManagementService.updateLocalSettings(data);
    this.alertify.presentToast('Settings updated successfully');
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
      isNaN(Number(this.dataProvider.localSettings.editKotTime)) ||
      typeof this.dataProvider.localSettings.editKotTime !== 'number' ||
      this.dataProvider.localSettings.editKotTime < 0
    ) {
      alert('Please enter a valid number');
      this.dataProvider.localSettings.editKotTime = 0;
      return;
    }
    this.updateSettings({ editKotTime: this.dataProvider.localSettings.editKotTime });
  }

  async addNewQuickReason(){
    const dialog = this.dialog.open(PromptComponent, {
      data: {
        title: 'Enter a quick instruction',
        placeholder: 'Instruction',
        value: '',
        type: 'text',
        required: false,
        description: 'Enter a instruction for adding a quick reason',
      },
    });
    let value = await firstValueFrom(dialog.closed);
    console.log("value",value);
    if (value){
      this.dataProvider.quickReasons.push(value as any);
    }
    this.updateSettings({quickReasons:this.dataProvider.quickReasons});
  }
}


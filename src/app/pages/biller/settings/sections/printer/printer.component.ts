import { Component } from '@angular/core';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { MenuManagementService } from '../../../../../core/services/database/menuManagement/menu-management.service';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { SettingsService } from '../../../../../core/services/database/settings/settings.service';

@Component({
  selector: 'app-printer',
  templateUrl: './printer.component.html',
  styleUrls: ['./printer.component.scss'],
})
export class PrinterComponent {
  printers: string[] = [];
  constructor(public dataProvider: DataProvider,private menuManagementService:MenuManagementService,private settingsService:SettingsService,private alertify:AlertsAndNotificationsService) {}
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
  updateBillPrinter(value: string) {
    this.dataProvider.currentBusiness!.billerPrinter = value;
    this.settingsService
      .updateBusiness({
        billerPrinter: value,
        businessId: this.dataProvider.currentBusiness?.businessId!,
      })
      .then(() => {
        this.alertify.presentToast('Printer updated successfully');
      })
      .catch((err) => {
        this.alertify.presentToast('Error while updating printer');
      });
  }
}

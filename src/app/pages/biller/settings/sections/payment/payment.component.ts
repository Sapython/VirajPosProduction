import { Component, OnInit } from '@angular/core';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { Dialog } from '@angular/cdk/dialog';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { SettingsService } from '../../../../../core/services/database/settings/settings.service';
import { firstValueFrom } from 'rxjs';
import { AddMethodComponent } from '../../add-method/add-method.component';
import { PaymentMethod } from '../../../../../types/payment.structure';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {
  paymentMethods: PaymentMethod[] = [];
  loadingPaymentMethods: boolean = false;
  constructor(
    public dataProvider: DataProvider,
    private dialog: Dialog,
    private alertify: AlertsAndNotificationsService,
    private settingsService: SettingsService,
  ) {}
  ngOnInit(): void {
    this.getPaymentMethods();
  }
  editMethod(method: PaymentMethod) {
    const dialog = this.dialog.open(AddMethodComponent, {
      data: { mode: 'edit', setting: method },
    });
    firstValueFrom(dialog.closed).then((data: any) => {
      //  console.log('data', data);
      this.dataProvider.loading = true;
      if (data && data.name && typeof data.detail == 'boolean') {
        this.settingsService
          .addPaymentMethod({
            ...data,
            addDate: new Date(),
            updateDate: new Date(),
          })
          .then((res) => {
            this.alertify.presentToast('Payment method added successfully');
            this.getPaymentMethods();
          })
          .catch((err) => {
            this.alertify.presentToast('Error while adding payment method');
          })
          .finally(() => {
            this.dataProvider.loading = false;
          });
      } else {
        this.dataProvider.loading = false;
        this.alertify.presentToast('Cancelled adding payment method');
      }
    });
  }
  deleteMethod(id: string) {
    if (
      this.dataProvider.confirm(
        'Are you sure you want to delete payment method ?',
        [1],
      )
    ) {
      this.settingsService
        .deletePaymentMethod(id)
        .then((res) => {
          this.alertify.presentToast('Payment method deleted successfully');
        })
        .catch((err) => {
          this.alertify.presentToast('Error while deleting payment method');
        });
    }
  }
  getPaymentMethods() {
    this.loadingPaymentMethods = true;
    this.settingsService
      .getPaymentMethods()
      .then((res) => {
        this.paymentMethods = res.docs.map((d) => {
          return { ...d.data(), id: d.id } as PaymentMethod;
        });
      })
      .finally(() => {
        this.loadingPaymentMethods = false;
      });
  }
  addMethod() {
    const dialog = this.dialog.open(AddMethodComponent, {
      data: { mode: 'add' },
    });
    firstValueFrom(dialog.closed).then((data: any) => {
      //  console.log('data', data);
      this.dataProvider.loading = true;
      if (data && data.name && typeof data.detail == 'boolean') {
        this.settingsService
          .addPaymentMethod({
            ...data,
            addDate: new Date(),
            updateDate: new Date(),
          })
          .then((res) => {
            this.alertify.presentToast('Payment method added successfully');
          })
          .catch((err) => {
            this.alertify.presentToast('Error while adding payment method');
          })
          .finally(() => {
            this.dataProvider.loading = false;
          });
      } else {
        this.dataProvider.loading = false;
        this.alertify.presentToast('Cancelled adding payment method');
      }
    });
  }
}

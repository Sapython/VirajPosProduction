import { Component, OnInit } from '@angular/core';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { Dialog } from '@angular/cdk/dialog';
import { SettingsService } from '../../../../../core/services/database/settings/settings.service';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { firstValueFrom } from 'rxjs';
import { Tax } from '../../../../../types/tax.structure';
import { Timestamp } from '@angular/fire/firestore';
import { AddTaxComponent } from '../../../sidebar/edit-menu/add-tax/add-tax.component';

@Component({
  selector: 'app-taxes',
  templateUrl: './taxes.component.html',
  styleUrls: ['./taxes.component.scss'],
})
export class TaxesComponent implements OnInit {
  taxes: Tax[] = [];
  constructor(
    private alertify: AlertsAndNotificationsService,
    private dialog: Dialog,
    private settingsService: SettingsService,
    private dataProvider: DataProvider,
  ) {}

  ngOnInit(): void {
    this.getTaxes();
  }

  getTaxes() {
    this.settingsService.getTaxes().then((res) => {
      this.taxes = res.docs.map((d) => {
        return { ...d.data(), id: d.id } as Tax;
      });
    });
  }

  addTax() {
    const dialog = this.dialog.open(AddTaxComponent, { data: { mode: 'add' } });
    firstValueFrom(dialog.closed)
      .then((data: any) => {
        //  console.log('data', data);
        if (data) {
          this.dataProvider.loading = true;
          this.settingsService
            .addTax({
              ...data,
              creationDate: new Date(),
              updateDate: new Date(),
            })
            .then((res) => {
              this.alertify.presentToast('Tax added successfully');
              this.getTaxes();
            })
            .catch((err) => {
              this.alertify.presentToast('Error while adding tax');
            })
            .finally(() => {
              this.dataProvider.loading = false;
            });
        } else {
          this.alertify.presentToast('Cancelled adding tax');
        }
      })
      .catch((err: any) => {
        this.alertify.presentToast('Error while adding tax');
      });
  }

  editTax(tax: Tax) {
    const dialog = this.dialog.open(AddTaxComponent, {
      data: { mode: 'edit', setting: tax },
    });
    firstValueFrom(dialog.closed)
      .then((data: any) => {
        //  console.log('data', data);
        if (data) {
          this.settingsService
            .updateTax(tax.id, { ...data, updateDate: Timestamp.now() })
            .then((res) => {
              this.alertify.presentToast('Tax updated successfully');
              this.getTaxes();
            })
            .catch((err) => {
              this.alertify.presentToast('Error while updating tax');
            });
        } else {
          this.alertify.presentToast('Cancelled updating tax');
        }
      })
      .catch((err: any) => {
        this.alertify.presentToast('Error while updating tax');
      });
  }

  async deleteTax(id: string) {
    if (
      await this.dataProvider.confirm('Are you sure you want to delete tax ?', [
        1,
      ])
    ) {
      this.settingsService
        .deleteTax(id)
        .then((res) => {
          this.alertify.presentToast('Tax deleted successfully');
        })
        .catch((err) => {
          this.alertify.presentToast('Error while deleting tax');
        });
    }
  }
}

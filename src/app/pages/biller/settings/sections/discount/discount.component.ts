import { Component, OnInit } from '@angular/core';
import { CodeBaseDiscount } from '../../../../../types/discount.structure';
import { Dialog } from '@angular/cdk/dialog';
import { SettingsService } from '../../../../../core/services/database/settings/settings.service';
import { Timestamp } from '@angular/fire/firestore';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { MenuManagementService } from '../../../../../core/services/database/menuManagement/menu-management.service';
import { AddDiscountComponent } from '../../../actions/add-discount/add-discount.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.scss'],
})
export class DiscountComponent implements OnInit {
  loadingDiscount: boolean = false;
  discounts: CodeBaseDiscount[] = [];
  constructor(
    private dialog: Dialog,
    private settingsService: SettingsService,
    private menuManagementService: MenuManagementService,
    private alertify: AlertsAndNotificationsService,
    public dataProvider: DataProvider,
  ) {}

  ngOnInit(): void {
    this.getDiscounts();
  }

  updateSettings() {
    this.dataProvider.loading = true;
    this.menuManagementService
      .updateRootSettings(
        { multipleDiscount: this.dataProvider.multipleDiscount },
        this.dataProvider.businessId,
      )
      .then(() => {
        this.alertify.presentToast('Settings updated successfully');
      })
      .catch((err) => {
        this.alertify.presentToast('Error while updating settings');
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }
  addDiscount() {
    const dialog = this.dialog.open(AddDiscountComponent, {
      data: { mode: 'add' },
    });
    dialog.closed.subscribe((data: any) => {
      //  console.log('data', data);
      if (data) {
        if (data.menus.length === 0) {
          data.menus = null;
        }
        //  console.log('adding', data);
        this.settingsService
          .addDiscount({
            ...data,
            mode: 'codeBased',
            totalAppliedDiscount: 0,
            creationDate: Timestamp.now(),
            reason: '',
          } as CodeBaseDiscount)
          .then((res) => {
            //  console.log('res', res);
            this.getDiscounts();
            this.alertify.presentToast('Discount added successfully');
          })
          .catch((err) => {
            //  console.log('err', err);
            this.alertify.presentToast('Error adding discount');
          });
      } else {
        //  console.log('no data', data);
      }
    });
  }
  getDiscounts() {
    this.loadingDiscount = true;
    this.settingsService
      .getDiscounts()
      .then((res) => {
        this.discounts = [];
        res.forEach((data) => {
          this.discounts.push({
            ...data.data(),
            id: data.id,
          } as CodeBaseDiscount);
        });
      })
      .catch((err: any) => {
        //  console.log(err);
        this.alertify.presentToast('Error while fetching discounts');
      })
      .finally(() => {
        this.loadingDiscount = false;
      });
  }
  async getMappedMenu(menus?: string[]) {
    if (!menus) return [];
    let allMenus = await firstValueFrom(this.dataProvider.allMenus);
    return allMenus.filter((menu) =>
      menus.includes(menu.id!),
    );
  }
  editDiscount(discount: CodeBaseDiscount) {
    //  console.log('discount', discount);
    const dialog = this.dialog.open(AddDiscountComponent, {
      data: { mode: 'edit', discount: discount },
    });
    dialog.closed.subscribe((data: any) => {
      //  console.log('data', data);
      if (data) {
        if (data.menus.length === 0) {
          data.menus = null;
        }
        //  console.log('adding', data);
        this.settingsService
          .updateDiscount({ ...discount, ...data } as CodeBaseDiscount)
          .then((res) => {
            //  console.log('res', res);
            this.getDiscounts();
            this.alertify.presentToast('Discount update successfully');
          })
          .catch((err) => {
            //  console.log('err', err);
            this.alertify.presentToast('Error updating discount');
          });
      } else {
        //  console.log('no data', data);
      }
    });
  }

  deleteDiscount(discountId: string) {
    this.dataProvider.loading = true;
    this.settingsService
      .deleteDiscount(discountId)
      .then(() => {
        this.alertify.presentToast('Discount deleted successfully');
        this.getDiscounts();
      })
      .catch((err) => {
        this.alertify.presentToast('Error while deleting discount');
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }
}

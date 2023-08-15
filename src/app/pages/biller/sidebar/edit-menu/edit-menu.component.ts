import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AlertsAndNotificationsService } from '../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { AddMenuComponent } from './add-menu/add-menu.component';
import { Category } from '../../../../types/category.structure';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';
import { MenuManagementService } from '../../../../core/services/database/menuManagement/menu-management.service';
import { Menu } from '../../../../types/menu.structure';
import { ElectronService } from '../../../../core/services/electron/electron.service';
import { ModeConfig } from '../../../../core/constructors/menu/menu';
@Component({
  selector: 'app-edit-menu',
  templateUrl: './edit-menu.component.html',
  styleUrls: ['./edit-menu.component.scss'],
})
export class EditMenuComponent implements OnInit {
  public recommended: Category[] = [];
  printers: string[] = [];
  activeTab: string = 'Products';
  currentType: 'recommended' | 'root' | 'view' | 'all' = 'all';
  menus: {
    name: string;
    toggled: boolean;
    menuSwitcher: boolean;
    menu: ModeConfig;
  }[] = [];
  constructor(
    private dialog: Dialog,
    public dataProvider: DataProvider,
    private menuManagementService: MenuManagementService,
    private alertify: AlertsAndNotificationsService,
    public dialogRef: DialogRef,
    private electronService: ElectronService,
  ) {
    this.dialogRef.closed.subscribe(() => {
      this.dataProvider.loading = true;
      Promise.all(
        this.dataProvider.menus.map((menu) => {
          menu.resetActivateCategory();
          this.dataProvider.modeChanged.next();
          return menu.updateChanged();
        }),
      )
        .then(async (r) => {
          // if (r.flat().length > 0){
          //   if (await this.dataProvider.confirm("Data is updated. Please restart the application to see the changes.",[1])){
          //     let url = window.location.href.split('/')
          //     url.pop()
          //     url.push('index.html')
          //     window.location.href = url.join('/')
          //   }
          // }
          this.alertify.presentToast('Menu changes updated successfully');
        })
        .catch((c) => {
          //  console.log(c);
          this.alertify.presentToast('Error updating menu');
        })
        .finally(() => {
          this.dataProvider.loading = false;
        });
    });
  }

  getMenus() {
    this.menuManagementService.getMenus().then((menus) => {
      this.dataProvider.allMenus = menus.docs.map((doc) => {
        return { ...doc.data(), id: doc.id } as Menu;
      });
    });
  }

  async ngOnInit(): Promise<void> {
    let localPrinters = await this.electronService.getPrinters();
    this.printers =
      localPrinters?.length > 0 ? localPrinters : ['Test 1', 'Test 2'];
    this.dataProvider.menus.forEach((menu) => {
      this.menus.push({
        name:
          menu.type == 'dineIn'
            ? 'Dine In'
            : menu.type == 'takeaway'
            ? 'Take Away'
            : 'Delivery',
        toggled: false,
        menuSwitcher: false,
        menu: menu,
      });
    });
  }

  addNewMenu() {
    const dialog = this.dialog.open(AddMenuComponent);
    dialog.closed.subscribe((data: any) => {
      //  console.log("data",data);
      this.getMenus();
      if (data) {
      }
    });
  }

  switchMode(mode: any) {
    // console.log("mode",mode);
    this.dataProvider.billingMode = mode.value;
    if (mode.value == 'dineIn') {
      localStorage.setItem('billingMode', 'dineIn');
      // console.log("this.dataProvider.dineInMenu",this.dataProvider.dineInMenu);
      if (!this.dataProvider.dineInMenu) {
        alert('No dine-in menu found');
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu) => {
        return menu.selectedMenu?.id == this.dataProvider.dineInMenu?.id;
      });
      if (this.dataProvider.currentMenu) {
        // this.dataProvider.currentMenu.type = 'dineIn';
        this.dataProvider.products = this.dataProvider.currentMenu.products;
      } else {
        // console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
      // console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    } else if (mode.value == 'takeaway') {
      localStorage.setItem('billingMode', 'takeaway');
      // console.log("this.dataProvider.takeawayMenu",this.dataProvider.takeawayMenu);
      if (!this.dataProvider.takeawayMenu) {
        alert('No takeaway menu found');
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu) => {
        return menu.selectedMenu?.id == this.dataProvider.takeawayMenu?.id;
      });
      if (this.dataProvider.currentMenu) {
        // this.dataProvider.currentMenu.type = 'takeaway';
        this.dataProvider.products = this.dataProvider.currentMenu.products;
      } else {
        // console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
      // console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    } else if (mode.value == 'online') {
      localStorage.setItem('billingMode', 'online');
      // console.log("this.dataProvider.onlineMenu",this.dataProvider.onlineMenu);
      if (!this.dataProvider.onlineMenu) {
        alert('No online menu found');
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu) => {
        return menu.selectedMenu?.id == this.dataProvider.onlineMenu?.id;
      });
      if (this.dataProvider.currentMenu) {
        // this.dataProvider.currentMenu.type = 'online';
        this.dataProvider.products = this.dataProvider.currentMenu.products;
      } else {
        // console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
      // console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    }
    this.dataProvider.modeChanged.next(mode.value);
  }
}

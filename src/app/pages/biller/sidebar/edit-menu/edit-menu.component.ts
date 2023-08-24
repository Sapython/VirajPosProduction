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
      let uniqueMenus = this.dataProvider.menus.filter((menu, index, self) => {
        return (
          index ===
          self.findIndex((t) => {
            return t.selectedMenuId === menu.selectedMenuId;
          })
        );
      });
      Promise.all(
        uniqueMenus.map(async (menu) => {
          menu.resetActivateCategory();
          this.dataProvider.modeChanged.next();
          console.log("Requesting update for menu",menu);
          let updateReqs = await menu.updateChanged();
          console.log("Updated requests with",updateReqs,menu);
          return updateReqs;
        }),
      )
        .then(async (r) => {
          
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
      if (data) {
      }
    });
  }

  switchMode(mode: any) {
    console.log("mode",mode);
    this.dataProvider.billingMode = mode.value;
    if (mode.value == 'dineIn') {
      localStorage.setItem('billingMode', 'dineIn');
      // console.log("this.dataProvider.dineInMenu",this.dataProvider.dineInMenu);
      if (!this.dataProvider.dineInMenu) {
        alert('No dine-in menu found');
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu) => {
        return menu.selectedMenu?.id == this.dataProvider.dineInMenu?.id && menu.type == 'dineIn';
      });
      console.log("selected current menu",this.dataProvider.currentMenu);
      if (this.dataProvider.currentMenu) {
        // this.dataProvider.currentMenu.type = 'dineIn';
        this.dataProvider.products = this.dataProvider.currentMenu.products;
      } else {
        // console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
      // console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    } else if (mode.value == 'takeaway') {
      localStorage.setItem('billingMode', 'takeaway');
      console.log("this.dataProvider.takeawayMenu",this.dataProvider.takeawayMenu);
      if (!this.dataProvider.takeawayMenu) {
        alert('No takeaway menu found');
        return;
      }
      this.dataProvider.currentMenu = this.dataProvider.menus.find((menu) => {
        return menu.selectedMenu?.id == this.dataProvider.takeawayMenu?.id && menu.type == 'takeaway';
      });
      console.log("selected current menu",this.dataProvider.currentMenu,this.dataProvider.menus);
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
        return menu.selectedMenu?.id == this.dataProvider.onlineMenu?.id && menu.type == 'online';
      });
      if (this.dataProvider.currentMenu) {
        // this.dataProvider.currentMenu.type = 'online';
        this.dataProvider.products = this.dataProvider.currentMenu.products;
      } else {
        // console.log("this.dataProvider.menus",this.dataProvider.menus);
      }
      // console.log("this.dataProvider.currentMenu",this.dataProvider.currentMenu);
    }
    if (mode.value){
      this.dataProvider.modeChanged.next(mode.value);
    }
    this.dataProvider.clearSearchField.next();
  }

  async close(){
    if(this.dataProvider.newMenuLoaded){
      if (await this.dataProvider.confirm("Have you made changed to the loaded menu ?",[1],{
        description: "The menu you imported has been added, but it was loaded with default settings. Like default taxes, serving sizes etc. You can always change theses settings. Do you want to keep editing the menu or exit the menu editor?",
        buttons:["Keep Editing","Exit Menu Editor"]
      })){
        this.dialogRef.close();
        this.dataProvider.newMenuLoaded = false;
      }
    } else {
      this.dialogRef.close();
    }
  }
}

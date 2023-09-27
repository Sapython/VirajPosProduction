import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { SelectMenuComponent } from '../../select-menu/select-menu.component';
import { ModeConfig } from '../../../../../core/constructors/menu/menu';
import { MenuManagementService } from '../../../../../core/services/database/menuManagement/menu-management.service';
import { ProductsService } from '../../../../../core/services/database/products/products.service';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { Dialog } from '@angular/cdk/dialog';
import { SettingsService } from '../../../../../core/services/database/settings/settings.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ElectronService } from '../../../../../core/services/electron/electron.service';
import { firstValueFrom } from 'rxjs';
import { ResetComponent } from './reset/reset.component';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
})
export class ConfigComponent implements OnInit {
  modes: [boolean, boolean, boolean] = this.dataProvider.activeModes;
  printers: string[] = [];
  statesAndCities: {state:string,districts:string[]}[] = [];
  editMode:boolean = false;
  constructor(
    public dataProvider: DataProvider,
    private menuManagementService: MenuManagementService,
    private productService: ProductsService,
    private alertify: AlertsAndNotificationsService,
    private dialog: Dialog,
    private settingsService: SettingsService,
    private electronService: ElectronService,
  ) {}

  async ngOnInit(): Promise<void> {
    fetch('assets/states-and-districts.json').then(async (res) => {
      let states = await res.json()
      console.log('res',states.states);
      this.statesAndCities = states.states;
      console.log("this.dataProvider.currentBusiness?.state",this.dataProvider.currentBusiness?.state);
      this.settingsForm.get('state')?.setValue(this.statesAndCities.find(state => state.state == this.dataProvider.currentBusiness?.state));
      this.settingsForm.get('city')?.setValue(this.dataProvider.currentBusiness?.city);
    }).catch((error) => {
      console.log('error', error);
    })
    let localPrinters = await this.electronService.getPrinters();
    this.printers =
      localPrinters?.length > 0 ? localPrinters : ['Test 1', 'Test 2'];
    this.settingsForm.disable();
    if (this.dataProvider.getAccess('changeConfig')) {
      this.settingsForm.enable();
    };
    setTimeout(()=>{
      this.settingsForm.get('state')?.setValue(this.statesAndCities.find(state => state.state == this.dataProvider.currentBusiness?.state.state));
      this.settingsForm.get('city')?.setValue(this.dataProvider.currentBusiness?.city);
    },300);
  }

  settingsForm: FormGroup = new FormGroup({
    hotelName: new FormControl(this.dataProvider.currentBusiness?.hotelName, [
      Validators.required,
    ]),
    phone: new FormControl(this.dataProvider.currentBusiness?.phone, [
      Validators.required,
    ]),
    address: new FormControl(this.dataProvider.currentBusiness?.address, [
      Validators.required,
    ]),
    state: new FormControl(this.dataProvider.currentBusiness?.state, [
      Validators.required,
    ]),
    city: new FormControl(this.dataProvider.currentBusiness?.city, [
      Validators.required,
    ]),
    gst: new FormControl(this.dataProvider.currentBusiness?.gst, [
      Validators.required,
    ]),
    fssai: new FormControl(this.dataProvider.currentBusiness?.fssai, [
      Validators.required,
    ])
  });

  async updateMode() {
    let allMenus = await firstValueFrom(this.dataProvider.allMenus);
    if (this.modes[0]) {
      if (!this.dataProvider.currentSettings.dineInMenu) {
        const dialog = this.dialog.open(SelectMenuComponent, {
          data: { type: 'dineIn', menus: allMenus },
        });
        dialog.closed.subscribe(async (data: any) => {
          //  console.log('data', data);
          if (data) {
            let currentMenu = allMenus.find(
              (menu) => menu.id == data,
            );
            let inst = new ModeConfig(
              'Dine In',
              'dineIn',
              currentMenu,
              data,
              this.dataProvider,
              this.menuManagementService,
              this.productService,
              this.alertify,
              this.dialog,
              this.settingsService,
            );
            this.dataProvider.menus.push(inst);
            this.modes[0] = true;
            this.dataProvider.dineInMenu = currentMenu;
            this.dataProvider.currentSettings.dineInMenu = currentMenu;
            await this.updateSettings({ dineInMenu: currentMenu });
            this.alertify.presentToast('Dine In menu set successfully');
          } else {
            this.modes[0] = false;
          }
        });
      }
    }
    if (this.modes[1]) {
      if (!this.dataProvider.currentSettings.takeawayMenu) {
        const dialog = this.dialog.open(SelectMenuComponent, {
          data: { type: 'takeaway', menus: allMenus },
        });
        dialog.closed.subscribe(async (data: any) => {
          //  console.log('data', data);
          if (data) {
            let currentMenu = allMenus.find(
              (menu) => menu.id == data,
            );
            let inst = new ModeConfig(
              'Takeaway',
              'takeaway',
              currentMenu,
              data,
              this.dataProvider,
              this.menuManagementService,
              this.productService,
              this.alertify,
              this.dialog,
              this.settingsService,
            );
            this.dataProvider.menus.push(inst);
            this.modes[0] = true;
            this.dataProvider.takeawayMenu = currentMenu;
            this.dataProvider.currentSettings.takeawayMenu = currentMenu;
            await this.updateSettings({ takeawayMenu: currentMenu });
            this.alertify.presentToast('Takeaway menu set successfully');
          } else {
            this.modes[0] = false;
          }
        });
      }
    }
    if (this.modes[2]) {
      if (!this.dataProvider.currentSettings.onlineMenu) {
        const dialog = this.dialog.open(SelectMenuComponent, {
          data: { type: 'online', menus: allMenus },
        });
        dialog.closed.subscribe(async (data: any) => {
          //  console.log('data', data);
          if (data) {
            let currentMenu = allMenus.find(
              (menu) => menu.id == data,
            );
            let inst = new ModeConfig(
              'Online',
              'online',
              currentMenu,
              data,
              this.dataProvider,
              this.menuManagementService,
              this.productService,
              this.alertify,
              this.dialog,
              this.settingsService,
            );
            this.dataProvider.menus.push(inst);
            this.modes[0] = true;
            this.dataProvider.onlineMenu = currentMenu;
            this.dataProvider.currentSettings.onlineMenu = currentMenu;
            await this.updateSettings({ onlineMenu: currentMenu });
            this.alertify.presentToast('Online menu set successfully');
          } else {
            this.modes[0] = false;
          }
        });
      }
    }
    let currentMenu = this.dataProvider.menus.find(
      (menu) =>
        (menu.type == 'dineIn' && this.modes[0]) ||
        (this.dataProvider.menus.find((menu) => menu.type == 'takeaway') &&
          this.modes[1]) ||
        (this.dataProvider.menus.find((menu) => menu.type == 'online') &&
          this.modes[2]),
    );
    //  console.log('currentMenu', currentMenu);
    if (currentMenu) {
      this.dataProvider.menuLoadSubject.next(currentMenu);
    }
    this.dataProvider.loading = true;
    await this.settingsService.updateMode(this.modes);
    this.dataProvider.loading = false;
    if (
      await this.dataProvider.confirm(
        'Data is updated. Please restart the application to see the changes.',
        [1],
      )
    ) {
      let url = window.location.href.split('/');
      url.pop();
      url.push('index.html');
      window.location.href = url.join('/');
    }
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

  saveSettings() {
    this.dataProvider.currentBusiness.users.forEach((user) => {
      console.log('user',user);
      let userBusinessRecord = {
        businessId: this.dataProvider.currentBusiness?.businessId,
        access: this.dataProvider.currentBusinessUser,
        address: this.settingsForm.get('address')?.value,
        city: this.settingsForm.get('city')?.value,
        state: this.settingsForm.get('state')?.value.state,
        name: this.settingsForm.get('hotelName')?.value,
      };
      this.settingsService.updateUserBusiness(user.username,userBusinessRecord);
    });
    this.settingsService
      .updateBusiness(this.settingsForm.value)
      .then(() => {
        this.alertify.presentToast('Settings saved successfully');
        this.editMode = false;
        // this.cancel.emit()
      })
      .catch((err) => {
        this.alertify.presentToast('Error while saving settings');
        //  console.log(err);
      });
  }

  get twoModeDeactived(): boolean {
    // return true when any two modes are false from all modes
    return this.modes.filter((mode) => !mode).length >= 2;
  }

  updateBillPrinter(value: string) {
    localStorage.setItem('billerPrinter', value);
    // this.dataProvider.currentBusiness!.billerPrinter = value;
    // this.settingsService
    //   .updateBusiness({
    //     billerPrinter: value,
    //     businessId: this.dataProvider.currentBusiness?.businessId!,
    //   })
    //   .then(() => {
    //     this.alertify.presentToast('Printer updated successfully');
    //   })
    //   .catch((err) => {
    //     this.alertify.presentToast('Error while updating printer');
    //   });
  }
  
  async resetAccount(){
    let dialog = this.dialog.open(ResetComponent);
    let result = await firstValueFrom(dialog.closed);
    if (result){
      console.log('result',result);
      await this.settingsService.deleteAllData();
    }
  }
}

import { Component } from '@angular/core';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { environment } from '../../../../../../environments/environment';
import { Dialog } from '@angular/cdk/dialog';
import { ResetPasswordComponent } from '../../../../auth/reset-password/reset-password.component';
import { firstValueFrom } from 'rxjs';
import { ElectronService } from '../../../../../core/services/electron/electron.service';
import { SettingsService } from '../../../../../core/services/database/settings/settings.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  version: string = environment.appVersion;
  serverVersion: string = '0.0.2';
  constructor(
    public dataProvider: DataProvider,
    private dialog: Dialog,
    public electronService: ElectronService,
    public settingService:SettingsService
  ) {}

  async resetPassword() {
    let res = await this.dialog.open(ResetPasswordComponent);
    res.disableClose = true;
    firstValueFrom(res.closed).finally(() => {
      res.close();
    });
  }

  fetchEmail(){

  }

  setPrimaryOutlet(){
    localStorage.setItem('primaryOutlet', this.dataProvider.primaryOutletId);
  }
}

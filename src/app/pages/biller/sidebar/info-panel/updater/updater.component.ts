import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { updateData } from '../../../../../types/update.structure';
import { ElectronService } from '../../../../../core/services/electron/electron.service';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-updater',
  templateUrl: './updater.component.html',
  styleUrls: ['./updater.component.scss'],
})
export class UpdaterComponent {
  constructor(
    @Inject(DIALOG_DATA) public data: updateData,
    private electronService: ElectronService,
    private dialogRef: DialogRef,
    public dataProvider: DataProvider,
  ) {}
  downloadNow() {
    let res = this.electronService.downloadUpdate();
    console.log('Download now res:', res);
    this.dialogRef.close();
  }

  installNow() {
    let res = this.electronService.installNow();
    console.log('Install now res:', res);
    this.dialogRef.close();
  }
}

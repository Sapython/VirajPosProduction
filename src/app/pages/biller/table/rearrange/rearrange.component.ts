import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';
import { Table } from '../../../../core/constructors/table/Table';
import { SettingsService } from '../../../../core/services/database/settings/settings.service';
import { MenuManagementService } from '../../../../core/services/database/menuManagement/menu-management.service';
import { AlertsAndNotificationsService } from '../../../../core/services/alerts-and-notification/alerts-and-notifications.service';

@Component({
  selector: 'app-rearrange',
  templateUrl: './rearrange.component.html',
  styleUrls: ['./rearrange.component.scss'],
})
export class RearrangeComponent {
  updatedGroups: { name: string; tables: Table[] }[] = [];
  constructor(
    @Inject(DIALOG_DATA)
    public data: {
      listItems: any[];
      mainKey: string;
    },
    public dialogRef: DialogRef,
    public dataProvider: DataProvider,
    private menuManagementService: MenuManagementService,
    private alertify: AlertsAndNotificationsService,
  ) {
    dialogRef.closed.subscribe(() => {
      console.log('this.updatedTables', this.updatedGroups);
      this.updatedGroups.forEach((group) => {
        group.tables.forEach((table) => {
          table.updated.next();
        });
      });
    });
  }

  drop(event: CdkDragDrop<any[]>, group: { name: string; tables: Table[] }) {
    moveItemInArray(group.tables, event.previousIndex, event.currentIndex);
    group.tables = group.tables.map((table, index) => {
      table.order = index;
      return table;
    });
    if (this.updatedGroups.length == 0) {
      this.updatedGroups.push(group);
    } else {
      let found = this.updatedGroups.find(
        (updatedGroup) => updatedGroup.name == group.name,
      );
      if (found) {
        found.tables = group.tables;
      } else {
        this.updatedGroups.push(group);
      }
    }
  }

  dropGroup(event: CdkDragDrop<any[]>) {
    console.log("event.currentIndex",event.currentIndex,event.previousIndex);
    moveItemInArray(
      this.dataProvider.groupedTables,
      event.currentIndex,
      event.previousIndex,
    );
    this.saveTableGroupSettings();
  }

  saveTableGroupSettings() {
    console.log("this.dataProvider.groupedTables.map((group) => group.name),",this.dataProvider.groupedTables.map((group) => group.name));
    var data = {
      groupOrders: this.dataProvider.groupedTables.map((group) => group.name),
    };
    this.menuManagementService
      .updateRootSettings(data, this.dataProvider.currentBusiness?.businessId!)
      .then(() => {
        this.alertify.presentToast('Settings updated successfully');
      })
      .catch((err) => {
        this.alertify.presentToast('Error while updating settings');
      });
  }
}

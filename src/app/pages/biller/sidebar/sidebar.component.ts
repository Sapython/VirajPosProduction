import { Dialog } from '@angular/cdk/dialog';
import { Component, OnDestroy } from '@angular/core';
import { EditMenuComponent } from './edit-menu/edit-menu.component';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { PopoverService } from '../../../shared/popover/popover.service';
import { DataProvider } from '../../../core/services/provider/data-provider.service';
import {firstValueFrom} from 'rxjs';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnDestroy{
  closeStockListPanelSubject: Subject<boolean> = new Subject<boolean>();
  closeStockListPanelSubscription:Subscription = Subscription.EMPTY;
  isStockListOpen = false;
  stockConsumption: number = 0;
  constructor(
    private popoverService: PopoverService,
    public dataProvider: DataProvider,
    private dialog: Dialog,
  ) {
    this.closeStockListPanelSubscription = this.closeStockListPanelSubject
      .pipe(debounceTime(600))
      .subscribe((data) => {
        this.isStockListOpen = data;
      });
  }

  ngOnDestroy(): void {
    this.closeStockListPanelSubscription.unsubscribe();
  }

  closePopover() {
    this.popoverService.setState(true);
  }

  editMenu() {
    const dialog = this.dialog.open(EditMenuComponent);
    firstValueFrom(dialog.closed).then((data) => {
      // update all menus
      this.dataProvider.menus.forEach((menu) => {
        menu.updateChanged();
        menu.getAllData();
      });
    });
  }
}

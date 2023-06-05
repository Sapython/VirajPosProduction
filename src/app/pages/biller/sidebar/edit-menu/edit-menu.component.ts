import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component, OnInit } from '@angular/core';
import { AlertsAndNotificationsService } from '../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { AddMenuComponent } from './add-menu/add-menu.component';
import { ElectronService } from '../../../../core/services';
import { Category } from '../../../../types/category.structure';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';
import { MenuManagementService } from '../../../../core/services/database/menuManagement/menu-management.service';
import { Menu } from '../../../../types/menu.structure';
@Component({
  selector: 'app-edit-menu',
  templateUrl: './edit-menu.component.html',
  styleUrls: ['./edit-menu.component.scss']
})
export class EditMenuComponent implements OnInit {
  public recommended:Category[] = []
  printers:string[] = [];

  currentType:'recommended'|'root'|'view'|'all' = 'all';
  constructor(private dialog:Dialog,public dataProvider:DataProvider,private menuManagementService:MenuManagementService,private alertify:AlertsAndNotificationsService,public dialogRef:DialogRef,private electronService:ElectronService){
    this.dialogRef.closed.subscribe(()=>{
      this.dataProvider.loading = true;
      Promise.all(this.dataProvider.menus.map((menu)=>{
        menu.resetActivateCategory();
        this.dataProvider.modeChanged.next();
        return menu.updateChanged()
      })).then(async (r)=>{
        // if (r.flat().length > 0){
        //   if (await this.dataProvider.confirm("Data is updated. Please restart the application to see the changes.",[1])){
        //     let url = window.location.href.split('/')
        //     url.pop()
        //     url.push('index.html')
        //     window.location.href = url.join('/') 
        //   }
        // }
        this.alertify.presentToast("Menu changes updated successfully")
      }).catch((c)=>{
      //  console.log(c);
        this.alertify.presentToast("Error updating menu")
      }).finally(()=>{
        this.dataProvider.loading = false;
      })
    })
  }

  getMenus(){
    this.menuManagementService.getMenus().then((menus)=>{
      this.dataProvider.allMenus = menus.docs.map((doc)=>{ return {...doc.data(),id:doc.id} as Menu});
    })
  };

  async ngOnInit(): Promise<void> {
    let localPrinters = (await this.electronService.getPrinters());
    this.printers = localPrinters.length > 0 ? localPrinters : []
  }

  addNewMenu(){
    const dialog = this.dialog.open(AddMenuComponent)
    dialog.closed.subscribe((data:any)=>{
    //  console.log("data",data);
      this.getMenus();
      if(data){
      }
    })
  }

}

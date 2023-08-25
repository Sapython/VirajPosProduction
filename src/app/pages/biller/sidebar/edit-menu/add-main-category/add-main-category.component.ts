import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { AddDishComponent } from '../add-dish/add-dish.component';
import { firstValueFrom } from 'rxjs';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { MenuManagementService } from '../../../../../core/services/database/menuManagement/menu-management.service';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-add-main-category',
  templateUrl: './add-main-category.component.html',
  styleUrls: ['./add-main-category.component.scss']
})
export class AddMainCategoryComponent {
  category:{
    products:any[],name:string
  } ={
    products:[],
    name:''
  };
  type: string[] = ['veg', 'non-veg'];
  tags: { color: string; name: string; contrast: string }[] = [
    {
      color: 'tomato',
      contrast: 'white',
      name: 'Half',
    },
    {
      color: 'green',
      contrast: 'white',
      name: 'Full',
    },
  ];
  constructor(private dialogRef:DialogRef,private dialog:Dialog,private alertify:AlertsAndNotificationsService, private menuManagementService:MenuManagementService,private dataProvider:DataProvider){}
  close(){
    this.dialogRef.close();
  }

  addProduct(category:{name:string,products:any[]}){
    const dishComp = this.dialog.open(AddDishComponent,{data:{mode:'add'}});
    firstValueFrom(dishComp.closed).then((value)=>{
      console.log("TO be added product",value);
      if(value){
        category.products.push(value);
        this.alertify.presentToast("Product Added");
      }
    });
  }
  
  submit(){
    this.dataProvider.loading = true;
    this.menuManagementService.addNewRootCategory(this.category.products,this.category.name).then(()=>{
      this.alertify.presentToast("Category Added");
      alert("Category has been added. The new products are uploaded with no taxes. Update product taxes from the edit menu.")
      this.dialogRef.close();
    }).catch((err)=>{
      console.log("Failed to add category error:",err);
      this.alertify.presentToast("Failed to add category");
    }).finally(()=>{
      this.dataProvider.loading = false;
    });
  }
}

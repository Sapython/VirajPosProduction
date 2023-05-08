import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
// import fuse
import Fuse from 'fuse.js';
import { debounceTime } from 'rxjs';
import { DataProvider } from 'src/app/provider/data-provider.service';
import { AlertsAndNotificationsService } from 'src/app/services/alerts-and-notification/alerts-and-notifications.service';
import { DatabaseService } from 'src/app/services/database.service';
@Component({
  selector: 'app-add-new-category',
  templateUrl: './add-new-category.component.html',
  styleUrls: ['./add-new-category.component.scss']
})
export class AddNewCategoryComponent {
  maxPrice: number = 100;
  products:any[] = []
  searchResults:any[] = []
  newCategoryForm:FormGroup = new FormGroup({
    name: new FormControl('',Validators.required),
    search: new FormControl(''),
  })
  constructor(private dialogRef:DialogRef,@Inject(DIALOG_DATA) private dialogData:any,private dataProvider:DataProvider,private databaseService:DatabaseService,private alertify:AlertsAndNotificationsService){
    this.products = dialogData.products || [];
    this.newCategoryForm.valueChanges.pipe(debounceTime(600)).subscribe((value)=>{
      // use fuse
      let fuse = new Fuse(this.products, {
        keys: ['name','price'],
      })
      this.searchResults = fuse.search(value.search).map(item => item.item);
    })
  }
  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }
    return `${value}`;
  }

  cancel(){ 
    this.dialogRef.close();
  }

  async addCategory(){
    if(this.dialogData.noSave){
      let selectedItems = this.products.filter(item => item.selected);
      // let averagePrice = selectedItems.reduce((acc, item) => acc + item.price, 0) / selectedItems.length;
      let category:{name:string,products:string[]} = {
        name: this.newCategoryForm.value.name,
        products:selectedItems
      }
      this.dialogRef.close(category);
    } else {
      try {
        let selectedItems = this.products.filter(item => item.selected);
        // let averagePrice = selectedItems.reduce((acc, item) => acc + item.price, 0) / selectedItems.length;
        let category:{name:string,products:string[]} = {
          name: this.newCategoryForm.value.name,
          products:selectedItems.map((item) => item.id)
        }
        // selectedItems.forEach(item => {
        //   category.products.push(item.id)
        // })
        this.dataProvider.loading = true;
        let res = await this.databaseService.addViewCategory(category);
        this.alertify.presentToast('Category Added');
      } catch (error) {
        this.alertify.presentToast('Something went wrong');
      } finally {
        this.dataProvider.loading = false;
      }
    }
  }

  randomIdGenerator(){
    return Math.random().toString(36).substr(2, 9);
  }
}

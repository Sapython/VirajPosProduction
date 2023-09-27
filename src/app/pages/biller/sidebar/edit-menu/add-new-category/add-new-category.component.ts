import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
// import fuse
import Fuse from 'fuse.js';
import { debounceTime } from 'rxjs';
import { Category } from '../../../../../types/category.structure';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { MenuManagementService } from '../../../../../core/services/database/menuManagement/menu-management.service';
@Component({
  selector: 'app-add-new-category',
  templateUrl: './add-new-category.component.html',
  styleUrls: ['./add-new-category.component.scss'],
})
export class AddNewCategoryComponent implements OnInit {
  maxPrice: number = 100;
  products: any[] = [];
  searchResults: any[] = [];
  newCategoryForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    search: new FormControl(''),
  });
  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA)
    public dialogData: {
      products: any[];
      noSave: boolean;
      mode: 'add' | 'edit';
      category: Category;
      rootProducts?: any[];
      userId:string
    },
    private dataProvider: DataProvider,
    private alertify: AlertsAndNotificationsService,
    private menuManagementService: MenuManagementService,
  ) {
    this.products = dialogData.products || [];
    this.products.sort((a, b) => a.name.localeCompare(b.name));
    this.newCategoryForm.valueChanges
      .pipe(debounceTime(600))
      .subscribe((value) => {
        // use fuse
        let fuse = new Fuse(this.products, {
          keys: ['name', 'price'],
        });
        this.searchResults = fuse.search(value.search).map((item) => item.item);
      });
  }

  ngOnInit(): void {
    let allProducts = this.dialogData.rootProducts
      ? this.dialogData.rootProducts
      : this.dataProvider.products;
    if (this.dialogData.mode == 'edit') {
      this.newCategoryForm.patchValue({
        name: this.dialogData.category.name,
        search: '',
      });
      //  console.log("this.dataProvider.products all",allProducts);
      this.products = allProducts.map((item) => {
        if (
          this.dialogData.category.products.find(
            (product) => product.id == item.id,
          )
        ) {
          return {
            ...this.dialogData.category.products.find(
              (product) => product.id == item.id,
            ),
            selected: true,
          };
        } else {
          return {
            ...item,
            selected: false,
          };
        }
      });
    } else {
      this.newCategoryForm.patchValue({
        name: '',
        search: '',
      });
      this.products = allProducts.map((item) => {
        return {
          ...item,
          selected: false,
        };
      });
    }
  }

  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }
    return `${value}`;
  }

  cancel() {
    this.dialogRef.close();
  }

  async addCategory() {
    if (this.newCategoryForm.invalid) {
      alert('Please fill all the fields');
      return;
    }
    // check if no products are selected
    if (this.products.filter((item) => item.selected).length == 0) {
      alert('Please select at least one product');
      return;
    }
    if (this.dialogData.mode == 'edit') {
      let selectedItems = this.products.filter((item) => item.selected);
      // let averagePrice = selectedItems.reduce((acc, item) => acc + item.price, 0) / selectedItems.length;
      let category: Category = {
        ...this.dialogData.category,
        name: this.newCategoryForm.value.name,
        products: selectedItems,
        enabled:true,
        productOrders: selectedItems.map((item) => item.id),
      };
      this.dialogRef.close(category);
      return;
    }
    if (this.dialogData.noSave) {
      let selectedItems = this.products.filter((item) => item.selected);
      // let averagePrice = selectedItems.reduce((acc, item) => acc + item.price, 0) / selectedItems.length;
      let category: any = {
        name: this.newCategoryForm.value.name,
        products: selectedItems,
        enabled:true,
      };
      this.dialogRef.close(category);
    } else {
      try {
        let selectedItems = this.products.filter((item) => item.selected);
        // let averagePrice = selectedItems.reduce((acc, item) => acc + item.price, 0) / selectedItems.length;
        let category:any= {
          name: this.newCategoryForm.value.name,
          products: selectedItems.map((item) => item.id),
          enabled:true,
        };
        // selectedItems.forEach(item => {
        //   category.products.push(item.id)
        // })
        this.dataProvider.loading = true;
        let res = await this.menuManagementService.addViewCategory(category,this.dialogData.userId);
        if (res) {
          this.alertify.presentToast('Category Added');
          this.dialogRef.close({ ...category, id: res.id });
        }
      } catch (error) {
        this.alertify.presentToast('Something went wrong');
      } finally {
        this.dataProvider.loading = false;
      }
    }
  }

  randomIdGenerator() {
    return Math.random().toString(36).substr(2, 9);
  }
}

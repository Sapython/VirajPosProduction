import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AddDishComponent } from '../add-dish/add-dish.component';
import { SelectRecipeComponent } from '../select-recipe/select-recipe.component';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { AddNewCategoryComponent } from '../add-new-category/add-new-category.component';
import { Product } from '../../../../../types/product.structure';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { MenuManagementService } from '../../../../../core/services/database/menuManagement/menu-management.service';

@Component({
  selector: 'app-add-menu',
  templateUrl: './add-menu.component.html',
  styleUrls: ['./add-menu.component.scss'],
})
export class AddMenuComponent {
  menuImage: File | undefined;
  products: Product[] = [];
  customDishes: any[] = [];
  selectedProducts: Product[] = [];
  addNewMenuForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.nullValidator]),
    description: new FormControl('', [
      Validators.required,
      Validators.nullValidator,
    ]),
  });
  rootCategories:{name:string,products:Product[]}[] = []
  imageUrl: string = '';
  constructor(
    private dialog: Dialog,
    private menuManagementService: MenuManagementService,
    private dataProvider: DataProvider,
    private dialogRef: DialogRef,
    private alertify: AlertsAndNotificationsService
  ) {}

  setImage(event: any) {
    // validate image and make sure it's less than 1 mb
    let file: File = event.target.files[0];
    if (file.type != 'image/png' && file.type != 'image/jpeg') {
      alert('Image type is not supported, please choose a png or jpeg image');
      return;
    }
    if (file.size > 1000000) {
      alert('Image size is too large, please choose a smaller image');
      return;
    }
    this.menuImage = file;
    // convert image to base64
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imageUrl = reader.result as string;
    };
  }

  openDishes() {
    // open dishes dialog
    this.dataProvider.loading = true;
    this.menuManagementService
      .getRootProducts()
      .then((products) => {
        const dialog = this.dialog.open(SelectRecipeComponent, {
          data: products.docs.map((p) => {
            return { ...p.data(), id: p.id };
          }),
        });
        dialog.componentInstance!.editMode = true;
        let a = dialog.closed.subscribe((value: any) => {
        //  console.log('value', value);
          if (value) {
            this.selectedProducts = value.filter((p: Product) => {
              return p.selected;
            });
          //  console.log('selectedProducts', this.selectedProducts);
          }
          a.unsubscribe();
        });
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }

  addDish() {
    const dialog = this.dialog.open(AddDishComponent);
    let a = dialog.closed.subscribe((value) => {
    //  console.log('value', value);
      a.unsubscribe();
    });
    // open dishes dialog
  }

  addNewMenu() {
    // validate 
    if (this.addNewMenuForm.invalid){
      alert("Invalid form")
      return
    }
    if (this.rootCategories.length == 0){
      alert("Add some root categories ")
      return
    }
    this.dataProvider.loading = true;
    // filter rootCategories prdoucts to only include selected products
    this.rootCategories.forEach((category)=>{
      category.products = category.products.filter((product)=> product.selected)
    })
    this.menuManagementService
      .addNewMenu(this.addNewMenuForm.value, this.rootCategories)
      .then(() => {
        this.alertify.presentToast('Menu added successfully');
        this.dialogRef.close();
      })
      .catch((err) => {
      //  console.log('err', err);
        this.alertify.presentToast(
          'Error adding menu, please try again later',
          'error'
        );
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }

  close() {
    this.dialogRef.close();
  }

  openCategoryDialog() {
    let filteredProducts:Product[] = []
    this.rootCategories.forEach((category)=>{
      filteredProducts.push(...category.products)
    })
    // fincal products that are not in the filtered products
    let finalProducts:Product[] = []
    this.selectedProducts.forEach((product)=>{
      if(!filteredProducts.find((p)=>p.id == product.id)){
        finalProducts.push(product)
      }
    })
  //  console.log('filteredProducts', filteredProducts);
    const dialog = this.dialog.open(AddNewCategoryComponent,{data:{noSave:true,products:finalProducts}})
    dialog.closed.subscribe((value:any)=>{
    //  console.log('value', value);
      if(value){
        this.rootCategories.push(value)
      }
    })
  }
}

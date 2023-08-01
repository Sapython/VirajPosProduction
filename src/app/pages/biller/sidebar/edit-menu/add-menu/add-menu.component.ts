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
import Fuse from 'fuse.js';
import { Subject, firstValueFrom } from 'rxjs';
import { read, utils, writeFile } from 'xlsx';
@Component({
  selector: 'app-add-menu',
  templateUrl: './add-menu.component.html',
  styleUrls: ['./add-menu.component.scss'],
})
export class AddMenuComponent {
  menuImage: File | undefined;
  products: ExcelProduct[] = [];
  customDishes: any[] = [];
  selectedProducts: ExcelProduct[] = [];
  addNewMenuForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.nullValidator]),
  });
  rootCategories: { name: string; products: any[] }[] = [];
  imageUrl: string = '';
  filteredProducts: ExcelProduct[] = [];
  fuseSearchInstance: Fuse<ExcelProduct> = new Fuse<ExcelProduct>(this.products, {
    keys: ['name', 'price'],
  });
  searchSubject: Subject<string> = new Subject<string>();
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
  constructor(
    private dialog: Dialog,
    private menuManagementService: MenuManagementService,
    private dataProvider: DataProvider,
    private dialogRef: DialogRef,
    private alertify: AlertsAndNotificationsService,
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
    firstValueFrom(dialog.closed).then((value) => {
    });
  }

  addNewMenu() {
    // validate
    if (this.addNewMenuForm.invalid) {
      alert('Invalid form');
      return;
    }
    if (this.rootCategories.length == 0) {
      alert('Add some root categories ');
      return;
    }
    this.dataProvider.loading = true;
    // filter rootCategories prdoucts to only include selected products
    this.rootCategories.forEach((category) => {
      category.products = category.products.filter(
        (product) => product.selected,
      );
    });
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
          'error',
        );
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }

  close() {
    this.dialogRef.close();
  }

  downloadFormat(){
    // create a csv file with this format
    // name, category, price,veg/nonveg , half/full (half/full is optional),
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "name,category,price,veg/nonveg,half/full\n";
    // download the file
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "menu_format.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click(); // This will download the data file named "my_data.csv".
  }

  readFormat(event:any){
    // handle file event
    let file: File = event.target.files[0];

    if (file.size > 10000000) {
      alert('File size is too large, please choose a smaller file');
      return;
    }
    // read the file
    let reader = new FileReader();
    reader.readAsBinaryString(file)
    reader.onload = (e) => {
      let spreadSheetWorkBook = read(e.target.result, {type:'binary'});
      console.log('spreadSheetFile', spreadSheetWorkBook);
      const data = utils.sheet_to_json<ExcelProduct>(spreadSheetWorkBook.Sheets[spreadSheetWorkBook.SheetNames[0]]);
      console.log('data', data);
      
      //  console.log('reader.result', reader.result);
      // let lines = (reader.result as string).split('\n');
      // //  console.log('lines', lines);
      let products = [];
      this.rootCategories = [];
      data.forEach((line)=>{
        line.tag = line['half/full'] == 'full' ? {color:'green',contrast:'white',name:'Full'} : { color: 'tomato', contrast: 'white', name: 'Half'};
        line.type = line['veg/nonveg'] == 'veg' ? 'veg' : 'non-veg';
        let product = {
          name:line.name,
          category:line.category,
          price:line.price,
          type:line.type,
          tag:line.tag,
          selected:true
        };
        products.push(product);
        // add to root category if not already present
        if(!this.rootCategories.find((category)=>category.name == line.category)){
          this.rootCategories.push({name:line.category,products:[product]});
        } else {
          // add to the products of the category
          this.rootCategories.find((category)=>category.name == line.category)?.products.push(product);
        }
      });

      console.log('products', products);
      // this.selectedProducts = products;
    }
  }

  switchAll(event: any,category:{name:string,products:any[]}) {
    category.products.forEach((product: any) => {
      product.selected = event.checked;
    });
  }

  checkedAll(category:{name:string,products:any[]}){
    return category.products.every((product:any)=>product.selected);
  }

  deleteCategory(category:{name:string,products:any[]}){
    this.rootCategories = this.rootCategories.filter((c)=>c.name != category.name);
    this.alertify.presentToast("Category Deleted");
  }

  async addCategory(){
    let categoryName = await this.dataProvider.prompt('Add new category',{
      required:true
    });
    if(categoryName){
      this.rootCategories.push({name:categoryName,products:[]});
      this.alertify.presentToast("Category Added");
    }
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
}


interface ExcelProduct {
  name:string;
  category:string;
  price:number;
  type:'veg'|'non-veg';
  tag:{color:'green',contrast:'white',name:'Full'} | { color: 'tomato', contrast: 'white', name: 'Half'};
  selected?:boolean;
}
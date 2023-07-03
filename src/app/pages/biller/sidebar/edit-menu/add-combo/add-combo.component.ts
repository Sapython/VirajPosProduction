import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ComboType, TimeGroup, TypeCategory, productTree } from '../../../../../types/combo.structure';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { AddTypeComponent } from '../add-type/add-type.component';
import { Menu } from '../../../../../types/menu.structure';
import { ModeConfig } from '../../../../../core/constructors/menu/menu';
import { FileStorageService } from '../../../../../core/services/database/fileStorage/file-storage.service';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-add-combo',
  templateUrl: './add-combo.component.html',
  styleUrls: ['./add-combo.component.scss']
})
export class AddComboComponent {
  offerImageFile: File = null;
  comboFormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    offerImage: new FormControl('', Validators.required),
    discounted: new FormControl(''),
    numberOfProducts: new FormControl('', Validators.required),
    maximumNoOfPurchases: new FormControl(''),
    type: new FormControl('', Validators.required),
    offerPrice: new FormControl('', Validators.required),
  });
  constructor(private dialogRef:DialogRef,@Inject(DIALOG_DATA) public dialogData:{mode:'add'|'edit',menu:ModeConfig},private fileService:FileStorageService,private dataProvider:DataProvider) {
    if (dialogData.menu){
      this.types = dialogData.menu.types;
    }
    this.comboFormGroup.get('type').valueChanges.subscribe(value => {
      if(value == 'combo'){
        // disable
        this.comboFormGroup.get('offerPrice').disable();
      } else {
        // enable
        this.comboFormGroup.get('offerPrice').enable();
      }
    })
  }

  configurations = []

  types:ComboType[] = [];
  selectedType:ExtendedComboType = null;
  currentTypeCategory:TypeCategory = null;

  buildSelectedTypes() {
    this.types = this.dialogData.menu.types;
    const selectedTypes = this.types.filter(type => type.selected);
    console.log(selectedTypes,this.configurations);
    this.configurations = selectedTypes.map(type => {
      return {
        ...type,
        categories: []
      }
    })
    if (this.configurations.length > 0){
      this.selectedType = this.configurations[0];
      if(this.selectedType.categories.length > 0){
        this.currentTypeCategory = this.selectedType.categories[0];
      } else {
        this.currentTypeCategory = null;
      }
    }
    // let notFoundTypes = selectedTypes.filter(type => !this.configurations.find(t => {
    //   console.log("Check",t.id === type.id);
    //   return t.id === type.id
    // }));
    // console.log("notFoundTypes",notFoundTypes);
    // let newConfigs = notFoundTypes.map(type => {
    //   return {
    //     ...type,
    //     categories: []
    //   }
    // });
    // this.configurations = [...this.configurations, ...newConfigs];
    // console.log(this.configurations);
  }

  setImage(event){
    // verify it's image
    if (event.target.files[0].type.indexOf('image') === -1){
      return;
    }
    if (event.target.files){
      this.offerImageFile = event.target.files[0];
    }
  }

  selectTypeCategory(category:TypeCategory){
    this.currentTypeCategory = category;
  }

  selectType(type:ExtendedComboType){
    this.selectedType = type;
    this.currentTypeCategory = null;
    console.log(type);
  }

  addCategory(selectedType:ExtendedComboType){
    selectedType.categories.push({
      id: this.randomId,
      name:'New Category' + (selectedType.categories.length+1),
      products:[],
      offerType:'discount',
      productTree: this.cloneProductTree()
    });
  }

  cloneProductTree():productTree[]{
    return this.dialogData.menu.mainCategories.map(category => {
      return {
        categoryName: category.name || '',
        categoryId: category.id,
        selected: false,
        products: category.products.map(subCategory => {
          return {
            id: subCategory.id,
            name: subCategory.name,
            price: subCategory.price,
            image: subCategory.images[0] || '',
            selected: false
          }
        })
      }
    })
  }

  someSelected(category:productTree){
    return category.products.some(item => item.selected) && !category.selected;
  }

  allSelected(category:productTree){
    return category.products.every(item => item.selected) && category.selected;
  }

  selectAll(category:productTree){
    category.selected = !category.selected;
    category.products.forEach(product => {
      product.selected = category.selected;
    })
  }

  checkAll(category:productTree){
    category.selected = this.allSelected(category);
    if (!category.selected){
      this.someSelected(category)
    }
  }

  generateSelectedProducts(type:TypeCategory){
    type.products = []
    if (type){
      type.productTree.forEach(category => {
        category.products.forEach(product => {
          if (product.selected && !type.products.find(p => p.id === product.id)){
            type.products.push({
              id: product.id,
              name: product.name,
              price: product.price,
            })
          }
        })
      })
    }
  }

  addTypeCategory(){
    this.dialogData.menu.addType()
  }

  addTimeGroup(){
    this.dialogData.menu.addTimeGroup()
  }

  async save(){
    // verify if everything is ok
    console.log("this.comboFormGroup",this.comboFormGroup);
    if (this.comboFormGroup.invalid){
      alert("Please fill all the fields");
      return;
    }
    if (this.offerImageFile){
      this.dataProvider.loading = true;
      let url = await this.fileService.upload(`business/${this.dataProvider.currentBusiness.businessId}/menus/${this.dialogData.menu.selectedMenu.id}/combos/images/${(new Date()).getTime()}_${this.offerImageFile.name}`,this.offerImageFile);
      console.log(url);
      let data = {
        ...this.comboFormGroup.value,
        offerImage: url,
        types: this.configurations,
        timeGroups: this.dialogData.menu.timeGroups.filter(group => group.selected)
      }
      this.dialogRef.close(data);
      console.log("data",data);
      this.dataProvider.loading = false;
    } else {
      alert("Please select offer image");
    }
  }

  cancel(){
    this.dialogRef.close();
  }

  get randomId(){
    return Math.floor(Math.random() * 1000000000).toString(36);
  }

}

interface ExtendedComboType extends ComboType {
  categories:TypeCategory[];
}

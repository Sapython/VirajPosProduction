import { Component, ElementRef, Inject, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ComboType, TypeCategory, productTree } from '../../../../../types/combo.structure';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ModeConfig } from '../../../../../core/constructors/menu/menu';
import { FileStorageService } from '../../../../../core/services/database/fileStorage/file-storage.service';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, startWith, map } from 'rxjs';
import { Category } from '../../../../../types/category.structure';
import Fuse from 'fuse.js';
import { Product } from '../../../../../types/product.structure';

@Component({
  selector: 'app-add-combo',
  templateUrl: './add-combo.component.html',
  styleUrls: ['./add-combo.component.scss']
})
export class AddComboComponent {
  offerImageFile: File = null;
  availableTimes:{
    value:number;
    time:string;
  }[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  categorySearchControl = new FormControl('');
  categorySearchFuseInstance: Fuse<Category>;
  filteredCategories: Observable<Category[]>;
  selectedCategories: {category:Category,offerType:'fixed'|'free'|'discount',appliedOn:'item'|'group',amount:number,minimumProducts:number,maximumProducts:number}[] = [];
  allCategories: Category[] = [];

  selectedMonths:string[] = []
  allMonths:string[] = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  filteredMonths: Observable<string[]>;

  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;

  announcer = inject(LiveAnnouncer);

  comboFormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    offerImage: new FormControl('', Validators.required),
    discounted: new FormControl(''),
    numberOfProducts: new FormControl('', Validators.required),
    maximumNoOfPurchases: new FormControl(''),
    type: new FormControl('', Validators.required),
    offerPrice: new FormControl('', Validators.required),
  });

  visibilityEnabled:boolean = false;
  visibilitySettings = {
    mode:'monthly',
    repeating:false,
    dateRange:{},
    selectedMonths:this.selectedMonths,
  }
  constructor(private dialogRef:DialogRef,@Inject(DIALOG_DATA) public dialogData:{mode:'add'|'edit',menu:ModeConfig},private fileService:FileStorageService,private dataProvider:DataProvider) {
    if (dialogData.menu){
      // this.allCategories
      this.dialogData.menu.mainCategories.forEach(category => {
        this.allCategories.push(category);
      });
      this.dialogData.menu.viewCategories.forEach(category => {
        this.allCategories.push(category);
      });
      this.categorySearchFuseInstance = new Fuse(this.allCategories, {keys:['name']});
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
    });
    this.filteredCategories = this.categorySearchControl.valueChanges.pipe(
      startWith(null),
      map((searchQuery: string | null) => {
        if (searchQuery && typeof searchQuery == 'string'){
          console.log("searchQuery",searchQuery);
          return this.categorySearchFuseInstance.search(searchQuery).map((category) => {
            return category.item;
          });
        } else {
          return this.allCategories.map(category => category);
        }
      }),
    );

    // add time at intervals of 30 minutes from 00:00 to 23:30
    for (let i = 1; i < 48; i++){
      let time = new Date();
      time.setHours(0,0,0,0);
      time.setMinutes(time.getMinutes() + i * 30);
      this.availableTimes.push({
        value: i * .5,
        time: time.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
      })
    }
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

  add(event: MatChipInputEvent): void {
    // Add our fruit
    console.log("event.value",event);
    
    // if (event.value) {
    //   this.selectedCategories.push(event.value);
    // }

    // Clear the input value
    event.chipInput!.clear();

    this.categorySearchControl.setValue(null);
  }

  removeCategory(category: Category): void {
    const index = this.selectedCategories.findIndex((res)=>res.category.id == category.id);

    if (index >= 0) {
      this.selectedCategories.splice(index, 1);

      this.announcer.announce(`Removed ${category}`);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    let category:any = {
      category: event.option.value,
      offerType:'discount',
      appliedOn:'item',
      amount:0,
      minimumProducts:1,
      maximumProducts:null
    }
    this.selectedCategories.push(category);
    this.fruitInput.nativeElement.value = '';
    this.categorySearchControl.setValue(null);
  }

  selectMonth(event: MatAutocompleteSelectedEvent){
    this.selectedMonths.push(event.option.value);
    this.fruitInput.nativeElement.value = '';
    this.categorySearchControl.setValue(null);
  }

  removeMonth(monthString:string){
    const index = this.selectedMonths.indexOf(monthString);

    if (index >= 0) {
      this.selectedMonths.splice(index, 1);

      this.announcer.announce(`Removed ${monthString}`);
    }
  }

  selectProducts(products:Product[],selected:boolean){
    products.forEach((item)=>{
      item.selected = selected;
    })
  }
}

interface ExtendedComboType extends ComboType {
  categories:TypeCategory[];
}

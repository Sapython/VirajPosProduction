import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { Ingredient, Product } from '../../../../../types/product.structure';
import { ProductsService } from '../../../../../core/services/database/products/products.service';
import { MenuManagementService } from '../../../../../core/services/database/menuManagement/menu-management.service';
@Component({
  selector: 'app-product-costing',
  templateUrl: './product-costing.component.html',
  styleUrls: ['./product-costing.component.scss']
})
export class ProductCostingComponent implements OnInit {
  mode: string = 'recipe';
  cost:number = 0;
  loading:boolean = true;
  recipeResult: RecipeResult[] = [
    {
      name: 'Veg Korma',
      cost: 0,
      serving: 0,
      ingredients: []
    }
  ];
  ingredients: Ingredient[] = []
  filteredIngredients: Ingredient[] = [];
  search:Subject<string> = new Subject();
  constructor(@Inject(DIALOG_DATA) public data:Product,private alertify:AlertsAndNotificationsService,private menuManagementService:MenuManagementService){
    this.getIngredients();
    this.search.subscribe((res)=>{
      if (res == '' || res == null){
        return
      }
      this.filteredIngredients = this.ingredients.filter((ingredient)=>{
        return ingredient.name.toLowerCase().includes(res.toLowerCase())
      })
    })
  }
  
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.getIngredients();
  }

  switch(event:any){
  //  console.log(event);
  }

  getIngredients(){
    this.menuManagementService.getIngredients().then((res:any)=>{
      this.ingredients.push(...res.docs.map((doc:any)=>{
        return {
          ...doc.data(),
          id:doc.id
        } as Ingredient
      }))
      this.filteredIngredients.push(...this.ingredients);
    }).catch((err)=>{
      this.alertify.presentToast('Something went wrong','error')
    }).finally(()=>{
      this.loading = false;
    })
  }

  sortNow(){
    // sort ingredients by checked boolean value
    this.filteredIngredients.sort((a,b)=>{
      if (a.checked && !b.checked){
        return -1
      }
      if (!a.checked && b.checked){
        return 1
      }
      return 0
    })
  }

  addIngredient(){

  }

}
export interface RecipeResult {
  name: string;
  cost: number;
  serving: number;
  ingredients: Ingredient[];
}
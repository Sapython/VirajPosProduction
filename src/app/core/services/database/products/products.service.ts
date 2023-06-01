import { Injectable } from '@angular/core';
import { Product } from '../../../../types/product.structure';
import { addDoc, collection, Timestamp, updateDoc, doc, getDocs, setDoc, deleteDoc, Firestore } from '@angular/fire/firestore';
import { DataProvider } from '../../provider/data-provider.service';
import { Menu } from '../../../../types/menu.structure';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private dataProvider:DataProvider,private firestore:Firestore) { }
  
  addRecipe(recipe: any,menuId:string) {
  //  console.log("Adding at",'business/'+this.dataProvider.businessId+'/menus/'+menuId+'/products');
    return addDoc(
      collection(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/'+menuId+'/products'),
      recipe
    );
  }

  updateRecipe(recipe:any,menuId:string){
    recipe.quantity = 1;
    recipe.selected = false;
    delete recipe.instruction
    delete recipe.lineDiscount
    recipe.createdDate = Timestamp.now()
    return updateDoc(
      doc(this.firestore,'business/'+this.dataProvider.businessId+'/menus/'+menuId+'/products/'+recipe.id),{...recipe}
    )
  }
  getProducts() {
    return getDocs(
      collection(this.firestore, '/business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/products')
    );
  }

  updateProducts(products: Product[]) {
    return Promise.all(
      products.map((product) => {
        return setDoc(
          doc(
            this.firestore,
            'business/'+this.dataProvider.businessId+'/menus/'+this.dataProvider.currentMenu?.selectedMenu?.id+'/products/' + product.id
          ),
          { ...product, quantity: 1 },
          { merge: true }
        );
      })
    );
  }

  deleteProduct(id:string,menuId:string){
    return deleteDoc(
      doc(this.firestore, 'business/'+this.dataProvider.businessId+'/menus/'+menuId+'/products/' + id)
    );
  }
  getProductsByMenu(menu:Menu){
    return getDocs(
      collection(
        this.firestore,
        'business/'+this.dataProvider.businessId+'/menus/' +
          menu.id +
          '/products/'
      ),
    )
  }
}

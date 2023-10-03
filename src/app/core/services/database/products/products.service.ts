import { Injectable } from '@angular/core';
import { Product } from '../../../../types/product.structure';
import {
  addDoc,
  collection,
  Timestamp,
  updateDoc,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  Firestore,
  runTransaction,
  writeBatch,
} from '@angular/fire/firestore';
import { DataProvider } from '../../provider/data-provider.service';
import { Menu } from '../../../../types/menu.structure';
import { MenuManagementService } from '../menuManagement/menu-management.service';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  constructor(
    private dataProvider: DataProvider,
    private firestore: Firestore,
    private menuManagementService: MenuManagementService,
  ) {}

  addRecipe(recipe: any, menuId: string) {
    //  console.log("Adding at",'business/'+this.dataProvider.businessId+'/menus/'+menuId+'/products');
    return addDoc(
      collection(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/products',
      ),
      recipe,
    );
  }

  async updateRecipe(recipe: any, menuId: string) {
    recipe.quantity = 1;
    recipe.selected = false;
    delete recipe.instruction;
    delete recipe.updated;
    delete recipe.lineDiscount;
    recipe.createdDate = Timestamp.now();
    let res = await updateDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/products/' +
          recipe.id,
      ),
      { ...recipe },
    );
    this.menuManagementService.updateMenuVersionRequest.next(menuId);
    return res;
  }
  getProducts() {
    return getDocs(
      collection(
        this.firestore,
        '/business/' +
          this.dataProvider.businessId +
          '/menus/' +
          this.dataProvider.currentMenu?.selectedMenu?.id +
          '/products',
      ),
    );
  }

  updateProducts(products: Product[]) {
    return Promise.all(
      products.map((product) => {
        return setDoc(
          doc(
            this.firestore,
            'business/' +
              this.dataProvider.businessId +
              '/menus/' +
              this.dataProvider.currentMenu?.selectedMenu?.id +
              '/products/' +
              product.id,
          ),
          { ...product, quantity: 1 },
          { merge: true },
        );
      }),
    );
  }

  deleteProduct(id: string, menuId: string) {
    return deleteDoc(
      doc(
        this.firestore,
        'business/' +
          this.dataProvider.businessId +
          '/menus/' +
          menuId +
          '/products/' +
          id,
      ),
    );
  }

  async updateBulkProducts(products: Product[],selectedMenuId:string) {
    this.dataProvider.loading = true;
    this.menuManagementService.updateMenuVersionRequest.next(selectedMenuId);
    const batch = writeBatch(this.firestore);
    products.forEach(async (product)=>{
      batch.set(
        doc(
          this.firestore,
          'business/' +
            this.dataProvider.businessId +
            '/menus/' +
            selectedMenuId +
            '/products/' +
            product.id,
        ),
        { ...product, quantity: 1 },
        { merge: true },
      );
    });
    await batch.commit().then(()=>{
      // console.log("Bulk tax update success");
    }).catch((err)=>{
      // console.log("Bulk tax update failed",err);
    }).finally(()=>{
      this.dataProvider.loading = false;
    })
  }
}

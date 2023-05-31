import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Timestamp } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Fuse from 'fuse.js';
import { Subject, debounceTime, firstValueFrom } from 'rxjs';
import { AddDishComponent } from '../../../pages/biller/sidebar/edit-menu/add-dish/add-dish.component';
import { AddNewCategoryComponent } from '../../../pages/biller/sidebar/edit-menu/add-new-category/add-new-category.component';
import { ProductCostingComponent } from '../../../pages/biller/sidebar/edit-menu/product-costing/product-costing.component';
import { SelectCategoryComponent } from '../../../pages/biller/sidebar/edit-menu/select-category/select-category.component';
import { SelectRecipeComponent } from '../../../pages/biller/sidebar/edit-menu/select-recipe/select-recipe.component';
import { SetTaxComponent } from '../../../pages/biller/sidebar/edit-menu/set-tax/set-tax.component';
import { Category } from '../../../types/category.structure';
import { AlertsAndNotificationsService } from '../../services/alerts-and-notification/alerts-and-notifications.service';
import { DataProvider } from '../../services/provider/data-provider.service';
import { Menu } from '../../../types/menu.structure';
import { Product } from '../../../types/product.structure';
import { MenuManagementService } from '../../services/database/menuManagement/menu-management.service';
import { Dialog } from '@angular/cdk/dialog';
import { ProductsService } from '../../services/database/products/products.service';

export class ModeConfig {
  name: string;
  active: boolean;
  selectedMenuId: string = '';
  selectedMenu: Menu | undefined = this.dataProvider.allMenus.find(
    (menu) => menu.id == this.selectedMenuId
  );
  filteredProducts: Product[];
  productVisibilityChanged: boolean = false;
  allProductsCategory: Category;
  products: Product[] = [];
  recommendedCategories: Category[] = [];
  viewCategories: Category[] = [];
  mainCategories: Category[] = [];
  categoryUpdated: boolean;
  productsUpdated: boolean;
  currentType: 'recommended' | 'root' | 'view' | 'all';
  selectedCategory: Category | undefined;
  type: 'dineIn' | 'takeaway' | 'online' | undefined;
  searchSubject: Subject<string> = new Subject<string>();
  fuseInstance: Fuse<Product> = new Fuse([], { keys: ['name'] });
  highCostForm: FormGroup = new FormGroup({
    min: new FormControl(this.dataProvider.highCostConfig.min, [
      Validators.required,
    ]),
    max: new FormControl(this.dataProvider.highCostConfig.max),
  });
  lowCostForm: FormGroup = new FormGroup({
    min: new FormControl(this.dataProvider.lowCostConfig.min, [
      Validators.required,
    ]),
    max: new FormControl(this.dataProvider.lowCostConfig.min),
  });
  highRangeForm: FormGroup = new FormGroup({
    min: new FormControl(this.dataProvider.highRangeConfig.min, [
      Validators.required,
    ]),
    max: new FormControl(this.dataProvider.highRangeConfig.max),
  });
  lowRangeForm: FormGroup = new FormGroup({
    min: new FormControl(this.dataProvider.lowRangeConfig.min, [
      Validators.required,
    ]),
    max: new FormControl(this.dataProvider.lowRangeConfig.max),
  });
  mostSellingForm: FormGroup = new FormGroup({
    min: new FormControl(this.dataProvider.mostSellingConfig.min, [
      Validators.required,
    ]),
    max: new FormControl(this.dataProvider.mostSellingConfig.max),
  });
  newDishesForm: FormGroup = new FormGroup({
    min: new FormControl(this.dataProvider.newDishesConfig.min, [
      Validators.required,
    ]),
    max: new FormControl(this.dataProvider.newDishesConfig.max),
  });
  constructor(
    name: string,
    type: 'dineIn' | 'takeaway' | 'online',
    selectedMenu: Menu | undefined,
    selectedMenuId: string,
    private dataProvider: DataProvider,
    private menuManagementService: MenuManagementService,
    private productService: ProductsService,
    private alertify: AlertsAndNotificationsService,
    private dialog: Dialog,
  ) {
    this.name = name;
    this.type = type;
    this.active = this.isActive;
    this.filteredProducts = [];
    this.selectedMenuId = selectedMenuId;
    this.selectedMenu = selectedMenu;
    this.categoryUpdated = false;
    this.currentType = 'all';
    this.allProductsCategory = {
      enabled: true,
      id: 'allProducts',
      name: 'All Products',
      products: this.products,
      averagePrice: 0,
    };
    this.selectedCategory = this.allProductsCategory;
    if (this.selectedMenu) {
      this.getAllData();
    }
    this.searchSubject.pipe(debounceTime(500)).subscribe((searchString) => {
      if (searchString) {
        let res = this.fuseInstance.search(searchString);
        this.filteredProducts = res.map((result) => result.item);
      } else {
        this.filteredProducts = [];
      }
    });
  }

  get isActive() {
    if (this.type == 'dineIn') {
      return this.dataProvider.activeModes[0];
    } else if (this.type == 'takeaway') {
      return this.dataProvider.activeModes[1];
    } else if (this.type == 'online') {
      return this.dataProvider.activeModes[2];
    } else {
      return false;
    }
  }

  async getProducts() {
    if (this.selectedMenu) {
      let data = await this.productService.getProductsByMenu(this.selectedMenu);
      // data.forEach((doc)=>{
      //   this.menuManagementService.updateRecipe({id:doc.id,type:doc.data().type.replace('\r','')},this.selectedMenuId)
      // })
      this.products = data.docs.map((doc) => {
        return { ...doc.data(), id: doc.id } as Product;
      });
      console.log('this.products', this.products);
      let event = {
        previousPageIndex: 0,
        pageIndex: 0,
        pageSize: 10,
        length: this.products.length,
      };
      this.allProductsCategory.products = this.products.slice(
        event.pageIndex * event.pageSize,
        (event.pageIndex + 1) * event.pageSize
      );
      this.allProductsCategory.averagePrice =
        this.products.reduce((acc, curr) => acc + curr.price, 0) /
        this.products.length;
      this.fuseInstance.setCollection(this.products);
      this.selectedCategory = this.allProductsCategory;
    }
  }

  async getRecommendedCategories() {
    if (this.selectedMenu) {
      let data =
        await this.menuManagementService.getRecommendedCategoriesByMenu(
          this.selectedMenu
        );
      this.recommendedCategories = data.map((doc) => {
        let products = this.products.filter((p) => {
          return doc['products'].includes(p.id) && p.visible;
        });
        return {
          ...doc,
          name: doc['name'],
          id: doc.id,
          products: products,
          averagePrice:
            products.reduce((acc, curr) => acc + curr.price, 0) /
            products.length,
        } as Category;
      });
      this.recommendedCategories.sort((a, b) => {
        if (a.order && b.order) {
          return a.order - b.order;
        } else {
          return 0;
        }
      });
    }
  }

  async getViewCategories() {
    if (this.selectedMenu) {
      let data = await this.menuManagementService.getViewCategoriesByMenu(
        this.selectedMenu
      );
      this.viewCategories = data.map((doc) => {
        let products = this.products.filter((p) => {
          if (doc['disabled']) {
            var notDisabled = doc['disabled'].find((id: string) => id == p.id)
              ? false
              : true;
          } else {
            var notDisabled = true;
          }
          p.visible = notDisabled && p.visible;
          return doc['products'].includes(p.id);
        });
        return {
          ...doc,
          name: doc['name'],
          id: doc.id,
          products: products,
          averagePrice:
            products.reduce((acc, curr) => acc + curr.price, 0) /
            products.length,
        } as Category;
      });
      console.log('this.viewCategories', this.viewCategories);
      // sort by order
      this.viewCategories.sort((a, b) => {
        if (a.order && b.order) {
          return a.order - b.order;
        } else {
          return 0;
        }
      });
      console.log('this.viewCategories', this.viewCategories);
      // sort all products by productOrder
      this.viewCategories.forEach((cat) => {
        // sort by cat.productOrders
        cat.products.sort((a, b) => {
          if (cat.productOrders) {
            let aOrder = cat.productOrders.indexOf(a.id);
            let bOrder = cat.productOrders.indexOf(b.id);
            if (aOrder != -1 && bOrder != -1) {
              return aOrder - bOrder;
            } else if (aOrder != -1) {
              return -1;
            } else if (bOrder != -1) {
              return 1;
            } else {
              return 0;
            }
          } else {
            return 0;
          }
        });
      });
    }
  }

  async getMainCategories() {
    if (this.selectedMenu) {
      let data = await this.menuManagementService.getMainCategoriesByMenu(
        this.selectedMenu
      );
      this.mainCategories = data.map((doc) => {
        let products = this.products.filter((p) => {
          if (doc['disabled']) {
            var notDisabled = doc
              ['disabled'].find((id: string) => id == p.id)
              ? false
              : true;
          } else {
            var notDisabled = true;
          }
          p.visible = notDisabled && p.visible;
          return (
            doc['products'] && doc['products'].includes(p.id)
          );
        });
        return {
          ...doc,
          name: doc['name'],
          id: doc.id,
          products: products,
          averagePrice:
            products.reduce((acc, curr) => acc + curr.price, 0) /
            products.length,
        } as Category;
      });
      this.mainCategories.sort((a, b) => {
        if (a.order && b.order) {
          return a.order - b.order;
        } else {
          return 0;
        }
      });
    }
  }

  async getAllData() {
    this.dataProvider.loading = true;
    await this.getProducts();
    await this.getMainCategories();
    await this.getRecommendedCategories();
    await this.getViewCategories();
    this.dataProvider.menuLoadSubject.next({
      type: this.type,
    });
    this.dataProvider.loading = false;
  }

  pageChanged(event) {
    // paginate all products
    console.log('event', event);
    this.allProductsCategory.products = this.products.slice(
      event.pageIndex * event.pageSize,
      (event.pageIndex + 1) * event.pageSize
    );
  }

  updateMenu() {
    this.selectedMenu = this.dataProvider.allMenus.find(
      (menu) => menu.id == this.selectedMenuId
    );
    console.log('updating menu', this.selectedMenu, this.type);
    if (this.selectedMenu && this.type) {
      this.menuManagementService
        .updateMenu(this.selectedMenu, this.type)
        .then(async (data) => {
          await this.getAllData();
          this.alertify.presentToast('Menu Fetched Successfully');
        })
        .catch((err) => {
          this.alertify.presentToast('Menu Update Failed');
        });
    } else {
      this.alertify.presentToast('No Valid Menu Selected');
    }
  }

  selectCategory(cat: Category) {
    this.selectedCategory = cat;
    this.categoryUpdated = false;
    this.fuseInstance.setCollection(this.selectedCategory.products);
  }

  deleteViewCategory() {
    this.dataProvider.loading = true;
    this.menuManagementService
      .deleteViewCategory(this.selectedMenuId, this.selectedCategory.id)
      .then((data) => {
        this.alertify.presentToast('Category Deleted Successfully');
        this.viewCategories = this.viewCategories.filter(
          (cat) => cat.id != this.selectedCategory.id
        );
        this.getViewCategories();
        this.selectedCategory = this.allProductsCategory;
        this.currentType = 'all';
      })
      .catch((err) => {
        this.alertify.presentToast('Category Delete Failed');
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }

  addViewCategory() {
    const dialog = this.dialog.open(AddNewCategoryComponent, {
      data: { products: this.products },
    });
    dialog.closed.subscribe((data: any) => {
      if (data) {
        this.viewCategories.push(data);
      }
      this.getViewCategories();
    });
  }

  reorderViewCategory(event: any) {
    moveItemInArray(
      this.viewCategories,
      event.previousIndex,
      event.currentIndex
    );
    this.viewCategories.forEach((cat, index) => {
      cat.order = index + 1;
      cat.updated = true;
    });
  }

  reorderRecommendedCategory(event: any) {
    moveItemInArray(
      this.recommendedCategories,
      event.previousIndex,
      event.currentIndex
    );
    this.recommendedCategories.forEach((cat, index) => {
      cat.order = index + 1;
      cat.updated = true;
    });
  }

  reorderMainCategory(event: any) {
    moveItemInArray(
      this.mainCategories,
      event.previousIndex,
      event.currentIndex
    );
    this.mainCategories.forEach((cat, index) => {
      cat.order = index + 1;
      cat.updated = true;
    });
  }

  disableAll() {
    if (this.selectedCategory) {
      this.selectedCategory.products.forEach((product) => {
        product.visible = false;
        product.updated = true;
      });
      this.selectedCategory.updated = true;
      this.productVisibilityChanged = true;
    } else {
      this.alertify.presentToast('No Valid Category');
    }
  }

  enableAll() {
    if (this.selectedCategory) {
      this.selectedCategory.products.forEach((product) => {
        product.visible = true;
        product.updated = true;
      });
      this.selectedCategory.updated = true;
      this.productVisibilityChanged = true;
    } else {
      this.alertify.presentToast('No Valid Category');
    }
  }

  recommendationSave(id: string) {
    if (this.selectedMenu) {
      console.log('this.products', this.products);
      if (id == 'highRange') {
        console.log('this.highRangeForm.value', this.highRangeForm.value);
        if (this.highRangeForm.value.min && this.highRangeForm.value.max) {
          var filteredList = this.products.filter(
            (product) =>
              product.price >= this.highRangeForm.value.min &&
              product.price <= this.highRangeForm.value.max
          );
        } else if (this.highRangeForm.value.min) {
          var filteredList = this.products.filter(
            (product) => product.price >= this.highRangeForm.value.min
          );
        } else if (this.highRangeForm.value.max) {
          var filteredList = this.products.filter(
            (product) => product.price <= this.highRangeForm.value.max
          );
        } else {
          var filteredList = this.products;
        }
        let currSelectedCategory = this.selectedCategory;
        if (currSelectedCategory && this.selectedCategory) {
          this.selectedCategory.products = filteredList;
          console.log('this.selectedCategory', this.selectedCategory.products);
          currSelectedCategory.loading = true;
        }
        this.menuManagementService
          .setSettingsMenu(
            this.highRangeForm.value,
            'highRange',
            filteredList.map((p) => p.id),
            this.selectedMenu
          )
          .then(async (data: any) => {
            await this.getRecommendedCategories();
            this.alertify.presentToast('Settings Updated Successfully');
          })
          .catch((err) => {
            this.alertify.presentToast('Settings Update Failed');
          })
          .finally(() => {
            if (currSelectedCategory) {
              currSelectedCategory.loading = false;
            }
          });
      } else if (id == 'lowRange') {
        console.log('this.lowRangeForm.value', this.lowRangeForm.value);
        if (this.lowRangeForm.value.min && this.lowRangeForm.value.max) {
          var filteredList = this.products.filter(
            (product) =>
              product.price >= this.lowRangeForm.value.min &&
              product.price <= this.lowRangeForm.value.max
          );
        } else if (this.lowRangeForm.value.min) {
          var filteredList = this.products.filter(
            (product) => product.price >= this.lowRangeForm.value.min
          );
        } else if (this.lowRangeForm.value.max) {
          var filteredList = this.products.filter(
            (product) => product.price <= this.lowRangeForm.value.max
          );
        } else {
          var filteredList = this.products;
        }
        console.log('filteredList', filteredList);
        let currSelectedCategory = this.selectedCategory;
        if (currSelectedCategory && this.selectedCategory) {
          this.selectedCategory.products = filteredList;
          console.log('this.selectedCategory', this.selectedCategory.products);
          currSelectedCategory.loading = true;
        }
        this.menuManagementService
          .setSettingsMenu(
            this.lowRangeForm.value,
            'lowRange',
            filteredList.map((p) => p.id),
            this.selectedMenu
          )
          .then(async (data: any) => {
            await this.getRecommendedCategories();
            this.alertify.presentToast('Settings Updated Successfully');
          })
          .catch((err) => {
            this.alertify.presentToast('Settings Update Failed');
          })
          .finally(() => {
            if (currSelectedCategory) {
              currSelectedCategory.loading = false;
            }
          });
      } else if (id == 'mostSelling') {
        console.log('this.mostSellingForm.value', this.mostSellingForm.value);
        // var filteredList = this.products.filter(product => (product.sales || 0) >= this.mostSellingForm.value.min && (product.sales || 0) <= this.mostSellingForm.value.max);
        if (this.mostSellingForm.value.min && this.mostSellingForm.value.max) {
          var filteredList = this.products.filter(
            (product) =>
              (product.sales || 0) >= this.mostSellingForm.value.min &&
              (product.sales || 0) <= this.mostSellingForm.value.max
          );
        } else if (this.mostSellingForm.value.min) {
          var filteredList = this.products.filter(
            (product) => (product.sales || 0) >= this.mostSellingForm.value.min
          );
        } else if (this.mostSellingForm.value.max) {
          var filteredList = this.products.filter(
            (product) => (product.sales || 0) <= this.mostSellingForm.value.max
          );
        } else {
          var filteredList = this.products;
        }
        let currSelectedCategory = this.selectedCategory;
        if (currSelectedCategory && this.selectedCategory) {
          this.selectedCategory.products = filteredList;
          console.log('this.selectedCategory', this.selectedCategory.products);
          currSelectedCategory.loading = true;
        }
        console.log('filteredList', filteredList);
        this.menuManagementService
          .setSettingsMenu(
            this.mostSellingForm.value,
            'mostSelling',
            filteredList.map((p) => p.id),
            this.selectedMenu
          )
          .then(async (data: any) => {
            await this.getRecommendedCategories();
            this.alertify.presentToast('Settings Updated Successfully');
          })
          .catch((err) => {
            this.alertify.presentToast('Settings Update Failed');
          })
          .finally(() => {
            if (currSelectedCategory) {
              currSelectedCategory.loading = false;
            }
          });
      } else if (id == 'newDishes') {
        console.log('this.newDishesForm.value', this.newDishesForm.value);
        // var filteredList = this.products.filter(product => product.createdDate.toDate().getTime() >= this.newDishesForm.value.min.getTime() && product.createdDate.toDate().getTime() <= this.newDishesForm.value.max.getTime());
        if (this.newDishesForm.value.min && this.newDishesForm.value.max) {
          var filteredList = this.products.filter(
            (product) =>
              product.createdDate.toDate().getTime() >=
                this.newDishesForm.value.min.getTime() &&
              product.createdDate.toDate().getTime() <=
                this.newDishesForm.value.max.getTime()
          );
        } else if (this.newDishesForm.value.min) {
          var filteredList = this.products.filter(
            (product) =>
              product.createdDate.toDate().getTime() >=
              this.newDishesForm.value.min.getTime()
          );
        } else if (this.newDishesForm.value.max) {
          var filteredList = this.products.filter(
            (product) =>
              product.createdDate.toDate().getTime() <=
              this.newDishesForm.value.max.getTime()
          );
        } else {
          var filteredList = this.products;
        }
        let currSelectedCategory = this.selectedCategory;
        if (currSelectedCategory && this.selectedCategory) {
          this.selectedCategory.products = filteredList;
          console.log('this.selectedCategory', this.selectedCategory.products);
          currSelectedCategory.loading = true;
        }
        this.menuManagementService
          .setSettingsMenu(
            this.newDishesForm.value,
            'newDishes',
            filteredList.map((p) => p.id),
            this.selectedMenu
          )
          .then(async (data: any) => {
            await this.getRecommendedCategories();
            this.alertify.presentToast('Settings Updated Successfully');
          })
          .catch((err) => {
            this.alertify.presentToast('Settings Update Failed');
          })
          .finally(() => {
            if (currSelectedCategory) {
              currSelectedCategory.loading = false;
            }
          });
      }
    } else {
      this.alertify.presentToast('Please Select Menu');
    }
  }

  addRecipe(menuId: string) {
    let dialog = this.dialog.open(AddDishComponent, { data: { mode: 'add' } });
    firstValueFrom(dialog.closed)
      .then(async (data: any) => {
        if (data) {
          const categoryDialog = this.dialog.open(SelectCategoryComponent, {
            data: {
              mainCategories: this.mainCategories,
              viewCategories: this.viewCategories,
            },
          });
          let category: any = await firstValueFrom(categoryDialog.closed);
          if (category.mainCategory.products) {
            delete category.mainCategory.products;
          }
          console.log('category data', category);
          let selectedViewCategories = category.viewCategories.filter(
            (c) => c.selected
          );
          // this.mainCategories
          this.dataProvider.loading = true;
          let product: Product = {
            category: category.mainCategory,
            createdDate: Timestamp.now(),
            images: [],
            name: data.name,
            price: data.price,
            quantity: 1,
            selected: false,
            type: data.type,
            tags: [],
            variants: [],
            visible: true,
            taxes: data.taxes || [],
          };
          let productRes = await this.productService.addRecipe(product, menuId);
          let rootCategoryRes =
            await this.menuManagementService.updateRootCategory(
              category.mainCategory.id,
              [productRes.id]
            );
          let viewCategoryRes = await Promise.all(
            selectedViewCategories.map((c) => {
              return this.menuManagementService.updateViewCategory(c.id, [
                productRes.id,
              ]);
            })
          );
          console.log(
            'productRes',
            productRes.id,
            'viewCategoryRes',
            viewCategoryRes
          );
          this.alertify.presentToast('Recipe Added Successfully');
        }
      })
      .catch((err) => {
        console.log('Recipe add error', err);
        this.alertify.presentToast('Recipe Added Failed');
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }

  setTaxes(product: Product) {
    const dialog = this.dialog.open(SetTaxComponent, { data: product });
    firstValueFrom(dialog.closed).then((data: any) => {
      console.log('data', data);
      if (data) {
        let filteredTax = data.taxes
          .filter((tax) => tax.checked)
          .map((tax) => {
            delete tax.checked;
            return { ...tax, nature: data.type };
          });
        this.dataProvider.loading = true;
        product.taxes = filteredTax;
        this.productService
          .updateRecipe(product, this.selectedMenuId)
          .then((data: any) => {
            this.alertify.presentToast('Taxes Updated Successfully');
          })
          .catch((err) => {
            this.alertify.presentToast('Taxes Update Failed');
          })
          .finally(() => {
            this.dataProvider.loading = false;
          });
      }
    });
  }

  selectRecipe() {
    const dialog = this.dialog.open(SelectRecipeComponent, {
      data: this.products,
    });
    dialog.closed.subscribe((data: any) => {
      if (data) {
        if (this.selectedCategory) {
          const ids: string[] = data
            .filter((d: Product) => d.selected)
            .map((product: Product) => product.id);
          this.menuManagementService
            .updateViewCategory(this.selectedCategory.id, ids)
            .then((data: any) => {
              this.alertify.presentToast('Category Updated Successfully');
            })
            .catch((err) => {
              this.alertify.presentToast('Category Update Failed');
            });
          this.selectedCategory.products.push(
            ...data.filter((product: Product) => product.selected)
          );
        }
      }
    });
  }

  async editRecipe(product: Product, menuId: string) {
    try {
      let dialog = this.dialog.open(AddDishComponent, {
        data: { mode: 'edit', product },
      });
      let data = await firstValueFrom(dialog.closed);
      if (typeof data == 'object') {
        await this.productService.updateRecipe(
          { ...product, ...data, updated: true },
          menuId
        );
        product = { ...product, ...data, updated: true };
        this.alertify.presentToast('Recipe Updated Successfully');
      }
    } catch (error) {
      this.alertify.presentToast('Recipe Updated Failed');
    } finally {
      this.dataProvider.loading = false;
    }
  }

  async deleteRecipe(product: Product, menuId: string) {
    this.currentType;
    if (this.currentType == 'all') {
      this.dataProvider
        .confirm('Are you sure you want to delete this recipe?', [1])
        .then((data) => {
          if (data) {
            this.dataProvider.loading = true;
            this.productService
              .deleteProduct(product.id, menuId)
              .then((data: any) => {
                this.alertify.presentToast('Recipe Deleted Successfully');
                // remove from products
                this.products = this.products.filter(
                  (p: Product) => p.id != product.id
                );
                this.selectedCategory.products =
                  this.selectedCategory.products.filter(
                    (p: Product) => p.id != product.id
                  );
              })
              .catch((err) => {
                this.alertify.presentToast('Recipe Delete Failed');
              })
              .finally(() => {
                this.dataProvider.loading = false;
              });
          } else {
            this.alertify.presentToast('Recipe Delete Cancelled');
          }
        });
    } else if (['root', 'view'].includes(this.currentType)) {
      this.selectedCategory.products = this.selectedCategory.products.filter(
        (p: Product) => p.id != product.id
      );
      if (this.selectedCategory.productOrders) {
        this.selectedCategory.productOrders =
          this.selectedCategory.productOrders.filter((p) => p != product.id);
      } else {
        this.selectedCategory.productOrders =
          this.selectedCategory.products.map((p: Product) => p.id);
      }
      console.log(
        'Deleted',
        this.selectedCategory.products.find((p) => p.id == product.id),
        product
      );
      this.selectedCategory.updated = true;
    } else {
      this.alertify.presentToast('Cannot delete from this category');
    }
  }

  addUploadedRecipe() {
    // edit category using AddNewCategoryComponent
    const dialog = this.dialog.open(AddNewCategoryComponent, {
      data: {
        mode: 'edit',
        products: this.selectedCategory.products,
        category: this.selectedCategory,
      },
    });
    dialog.closed.subscribe((data: any) => {
      console.log('data', data);
      if (data) {
        this.selectedCategory.products = data.products;
        this.selectedCategory.productOrders = data.productOrders;
        this.selectedCategory.name = data.name;
        this.selectedCategory.updated = true;
        this.selectedCategory.enabled = true;
        console.log('this.selectedCategory', this.selectedCategory);
      }
    });
  }

  reorderProduct(event: any) {
    moveItemInArray(
      this.selectedCategory.products,
      event.previousIndex,
      event.currentIndex
    );
    this.selectedCategory.productOrders = this.selectedCategory.products.map(
      (product: Product) => {
        return product.id;
      }
    );
    this.selectedCategory.updated = true;
  }

  updatePrinter(selectedCategory: Category) {
    console.log('selectedCategory', selectedCategory);
    if (this.selectedMenu) {
      this.dataProvider.loading = true;
      this.menuManagementService
        .setPrinter(this.selectedMenu, selectedCategory)
        .then((data: any) => {
          this.alertify.presentToast('Printer Updated Successfully');
          // console.log("selectedCategory",selectedCategory);
        })
        .catch((err) => {
          this.alertify.presentToast('Some error occurred', 'error');
        })
        .finally(() => {
          this.dataProvider.loading = false;
        });
    } else {
      this.alertify.presentToast('Please Select Menu');
    }
  }

  async updateChanged() {
    this.dataProvider.menus.forEach((menu: ModeConfig) => {
      console.log('menu', menu.selectedMenu);
    });
    this.selectedMenu = this.dataProvider.allMenus.find((menu: Menu) => {
      console.log(menu.id, this.selectedMenuId, menu.id == this.selectedMenuId);
      return menu.id == this.selectedMenuId;
    });
    console.log('selectedMenu', this.selectedMenu);
    if (this.selectedMenu) {
      let updatableProducts = this.products.filter(
        (product: Product) => product.updated
      );
      console.log('updatableProducts', updatableProducts);
      let updatablerecommendedCategories = this.recommendedCategories.filter(
        (category: Category) => category.updated
      );
      let updatableviewCategories = this.viewCategories.filter(
        (category: Category) => category.updated
      );
      let updatablemainCategories = this.mainCategories.filter(
        (category: Category) => category.updated
      );
      let updateRequestProducts = updatableProducts.map((product: Product) =>
        this.menuManagementService.updateProductMenu(
          { ...product, updated: false },
          this.selectedMenu!
        )
      );
      let updateRequestrecommendedCategories =
        updatablerecommendedCategories.map((category: Category) =>
          this.menuManagementService.updateRecommendedCategoryMenu(
            {
              ...category,
              products: category.products.map((p) => p.id),
              updated: false,
            },
            this.selectedMenu!
          )
        );
      let updateRequestviewCategories = updatableviewCategories.map(
        (category: Category) =>
          this.menuManagementService.updateViewCategoryMenu(
            {
              ...category,
              products: category.products.map((p) => p.id),
              disabled: category.products
                .filter((d) => !d.visible)
                .map((d) => d.id),
              updated: false,
            },
            this.selectedMenu!
          )
      );
      let updateRequestmainCategories = updatablemainCategories.map(
        (category: Category) =>
          this.menuManagementService.updateMainCategoryMenu(
            {
              ...category,
              products: category.products.map((p) => p.id),
              disabled: category.products
                .filter((d) => !d.visible)
                .map((d) => d.id),
              updated: false,
            },
            this.selectedMenu!
          )
      );
      // stats
      console.log('total products update', updatableProducts.length);
      console.log(
        'total recommended category update',
        updatablerecommendedCategories.length
      );
      console.log('total view category update', updatableviewCategories.length);
      console.log('total main category update', updatablemainCategories.length);
      return await Promise.all(
        [
          updateRequestProducts,
          updateRequestmainCategories,
          updateRequestrecommendedCategories,
          updateRequestviewCategories,
        ].flat()
      );
    } else {
      return Promise.reject('Please Select Menu');
    }
  }

  save() {
    this.dataProvider.loading = true;
    this.updateChanged()
      .then(async (data: any) => {
        await this.getAllData();
        this.alertify.presentToast('Menu Updated Successfully');
      })
      .catch((err) => {
        this.alertify.presentToast('Menu Update Failed');
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }

  getExcelFormat() {}

  openProductCosting(product: Product) {
    this.dialog.open(ProductCostingComponent, { data: product });
  }
}

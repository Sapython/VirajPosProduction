import { Component, Input } from '@angular/core';
import { BillConstructor } from '../../../../../../../../types/bill.structure';
import { KotConstructor } from '../../../../../../../../types/kot.structure';
import { Subscription, ReplaySubject } from 'rxjs';
import { ReportService } from '../../report.service';
import { Product } from '../../../../../../../../types/product.structure';

@Component({
  selector: 'app-waiter-wise-items',
  templateUrl: './waiter-wise-items.component.html',
  styleUrls: ['./waiter-wise-items.component.scss'],
})
export class WaiterWiseItemsComponent {
  reportChangedSubscription: Subscription = Subscription.EMPTY;
  waiterWiseSales: ReplaySubject<WaiterWiseSales> = new ReplaySubject<WaiterWiseSales>();
  loading: boolean = true;
  joinArray(bill: KotConstructor[]) {
    // join to form a string of ids with comma
    return bill.map((res) => res.id).join(', ');
  }

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.reportChangedSubscription = this.reportService.dataChanged.subscribe(
      () => {
        this.loading = true;
        this.reportService
          .getBills(
            this.reportService.dateRangeFormGroup.value.startDate,
            this.reportService.dateRangeFormGroup.value.endDate
          )
          .then((bills) => {
            console.log('Bills ', bills);
            let products:{
              product:Product,
              users:{
                user:string,
                sales:number,
              }[]
            }[] = [];
            let users:string[] = [];
            bills.forEach((bill) => {
              bill.kots.forEach((kot) => {
                if (kot.user){
                  if (users.findIndex((res)=>res == kot.user.username) == -1) {
                    users.push(kot.user.username);
                  } 
                  kot.products.forEach((product) => {
                    let findIndex = products.findIndex(
                      (res) => res.product.id == product.id
                    );
                    if (findIndex == -1) {
                      if(product.itemType == 'product'){
                        products.push({
                          product:product,
                          users:[{
                            user:kot.user.username,
                            sales:product.quantity,
                          }]
                        });
                      }
                    } else {
                      if(product.itemType == 'product'){
                        let findUserIndex = products[findIndex].users.findIndex((res)=>res.user == kot.user.username);
                        if (findUserIndex == -1) {
                          products[findIndex].users.push({
                            user:kot.user.username,
                            sales:product.quantity,
                          });
                        } else {
                          products[findIndex].users[findUserIndex].sales += product.quantity;
                        }
                      }
                    }
                  })
                }
              });
            });
            // we have to create a array of users
            console.log('users wise sales', products);
            this.waiterWiseSales.next({
              users:users,
              productSales:products
            });
            // now 
            this.loading = false;
          });
      }
    );
  }

  ngOnDestroy(): void {
    this.reportChangedSubscription.unsubscribe();
  }
}

interface ProductStaffSales extends Product {
  user: string;
}

interface WaiterWiseSales {users:string[],productSales:{
  product:Product,
  users:{
    user:string,
    sales:number,
  }[]
}[]}[]
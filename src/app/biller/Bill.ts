import { Timestamp } from '@angular/fire/firestore';
import { Device } from './Device';
import { Table } from './Table';
import { User } from './User';
import {
  BillConstructor,
  CustomerInfo,
  Billing,
  Product,
  Tax,
  KotConstructor,
} from './constructors';
import { debounceTime, Subject } from 'rxjs';
import { DataProvider } from '../provider/data-provider.service';
import { DatabaseService, Menu } from '../services/database.service';
import { Kot } from './Kot';
import { splittedBill } from './actions/split-bill/split-bill.component';
import { Discount } from './settings/settings.component';
import { PrintingService } from '../services/printing.service';
const taxes:Tax[] = [
  {
    id: 'tax1',
    name: 'SGST',
    type: 'percentage',
    value: 2.5,
    amount:0
  },
  {
    id: 'tax1',
    name: 'CGST',
    type: 'percentage',
    value: 2.5,
    amount:0
  },
]
export class Bill implements BillConstructor {
  id: string;
  tokens: string[] = [];
  billNo?: string;
  orderNo: string|null = null;
  createdDate: Timestamp;
  stage: 'active' | 'finalized' | 'settled' | 'cancelled';
  customerInfo: CustomerInfo;
  reactivateKotReasons: string[] = []
  device: Device;
  optionalTax:boolean = false;
  mode: 'dineIn' | 'takeaway' | 'online';
  menu:Menu;
  kots: Kot[] = [];
  cancelledProducts:{kot:string,product:Product}[] = [];
  table: Table;
  billing: Billing;
  instruction: string;
  editKotMode: null | {
    previousKot: Product[];
    newKot: Product[];
    kot: Kot;
    kotIndex: number;
  } = null;
  user: User;
  nonChargeableDetail?: {
    reason: string;
    time: Timestamp;
    user: User;
    phone: string;
    name: string;
  };
  billingMode: 'cash' | 'card' | 'upi' | 'nonChargeable' = 'cash';
  settlement?: {
    customerName: string;
    customerContact: string;
    paymentMethod: string;
    cardEnding?: string;
    upiAddress?: string;
    time: Timestamp;
    user: User;
  } = undefined;
  cancelledReason?: {
    reason: string;
    time: Timestamp;
    phone: string;
    user: User;
  };
  billSubscriptionCallerStarted: boolean = false;
  updated: Subject<boolean | void> = new Subject<boolean | void>();
  currentKot: Kot | null = this.kots.find((kot) => kot.stage === 'active') || null;
  get kotWithoutFunctions(): any[]{
    return this.kots.map((kot) => kot.toObject());
  }
  constructor(
    id: string,
    table: Table,
    mode: 'dineIn' | 'takeaway' | 'online',
    billerUser: User,
    menu:Menu,
    private dataProvider: DataProvider,
    private databaseService: DatabaseService,
    private printingService:PrintingService,
    billNo?: string
  ) {
    this.optionalTax = this.dataProvider.optionalTax;
    taxes[0].amount = Number(this.dataProvider.currentSettings.sgst)
    taxes[1].amount = Number(this.dataProvider.currentSettings.cgst)
    this.updated.subscribe(()=>{
      this.dataProvider.queueUpdate.next()
    })
    this.updated.pipe(debounceTime(10000)).subscribe(async (data) => {
      taxes[0].amount = Number(this.dataProvider.currentSettings.sgst)
      taxes[1].amount = Number(this.dataProvider.currentSettings.cgst)
      if (!data) {
        let data = this.toObject();
        // console.log('updating bill', data);
        await this.databaseService.updateBill(data);
        // console.log('Bill updated', data);
        this.table.updated.next()
      }
      if(!this.billSubscriptionCallerStarted){
        this.firebaseUpdate();
      }
    });
    this.firebaseUpdate()
    this.toObject = this.toObject.bind(this);
    this.id = id;
    this.instruction = "";
    this.createdDate = Timestamp.now();
    this.stage = 'active';
    this.mode = mode;
    this.customerInfo = {};
    this.menu = menu;
    this.table = table;
    this.user = billerUser;
    this.billNo = billNo;
    this.billing = {
      subTotal: 0,
      discount: [],
      taxes: [],
      totalTax:0,
      grandTotal: 0,
    };
    this.updated.next();
  }

  get allProducts(){
    // return all products from all kots and merge with their quantity
    let products:Product[] = []
    this.kots.forEach((kot) => {
      kot.products.forEach((product) => {
        let index = products.findIndex((item) => item.id === product.id);
        if(index !== -1){
          products[index].quantity += product.quantity;
        } else {
          products.push(product);
        }
      })
    })
    return products;
  }

  get allFinalProducts(){
    let products:Product[] = []
    this.kots.forEach((kot) => {
      if (kot.stage == 'finalized'){
        kot.products.forEach((product) => {
          let index = products.findIndex((item) => item.id === product.id);
          if(index !== -1){
            products[index].quantity += product.quantity;
          } else {
            products.push(product);
          }
        })
      }
    })
    return products;
  }

  firebaseUpdate(){
    if (this.id){
      this.databaseService.getBillSubscription(this.id).subscribe((bill) => {
        this.billSubscriptionCallerStarted = true;
        console.log('bill changed', bill);
        if(bill){
          this.stage = bill['stage'];
          this.billNo = bill['billNo'];
          this.orderNo = bill['orderNo'];
          this.createdDate = bill['createdDate'];
          this.customerInfo = bill['customerInfo'];
          this.device = bill['device'];
          this.mode = bill['mode'];
          this.menu = bill['menu'];
          // this.table = bill['table'];
          this.billing = bill['billing'];
          this.instruction = bill['instruction'];
          this.user = bill['user'];
          this.nonChargeableDetail = bill['nonChargeableDetail'];
          this.billingMode = bill['billingMode'];
          this.settlement = bill['settlement'];
          this.cancelledReason = bill['cancelledReason'];
          // update kots and products
          // first find a kot that matches the id then check for products that match the id and update the quantity and stage
          this.kots.forEach((kot) => {
            let index = bill['kots'].findIndex((item:KotConstructor) => item.id === kot.id);
            if(index !== -1){
              kot.stage = bill['kots'][index]['stage'];
              kot.products.forEach((product) => {
                let productIndex = bill['kots'][index]['products'].findIndex((item:Product) => item.id === product.id);
                if(productIndex !== -1){
                  product.quantity = bill['kots'][index]['products'][productIndex]['quantity'];
                }
              })
              kot.createdDate = bill['kots'][index]['createdDate'];
              kot.editMode = bill['kots'][index]['editMode'];
            } else {
              // remove kot
              this.kots = this.kots.filter((item) => item.id !== kot.id);
            }
          })
          // add new kots
          bill['kots'].forEach((kot:KotConstructor) => {
            let index = this.kots.findIndex((item) => item.id === kot.id);
            if(index === -1){
              this.kots.push(new Kot(kot.id, kot.products[0], kot));
            }
          })
        }
      })
    }
  }

  addKot(kot: Kot) {
    this.kots.push(kot);
    this.tokens.push(this.dataProvider.kotToken.toString());
    this.dataProvider.kotToken++;
    this.billing.subTotal = this.kots.reduce((acc, cur) => {
      return (
        acc +
        cur.products.reduce((acc, cur) => {
          return acc + cur.price * cur.quantity;
        }, 0)
      );
    }, 0);
    this.billing.grandTotal = this.billing.subTotal;
    this.updated.next();
  }

  clearAllKots() {
    this.kots = [];
    this.billing.subTotal = 0;
    this.billing.grandTotal = 0;
    this.updated.next();
  }

  async addProduct(product: Product) {
    if (this.stage == 'finalized' && this.mode == 'takeaway'){
      let reactiveReason = await this.dataProvider.prompt('Please enter reason for adding product')
      if (reactiveReason){
        this.reactivateKotReasons.push(reactiveReason);
        this.stage = 'active';
      } else {
        return;
      }
    }
    if(this.stage !== 'active'){
      alert('This bill is already finalized.');
      return;
    }
    this.dataProvider.manageKot = false;
    this.dataProvider.kotViewVisible = false;
    this.dataProvider.allProducts = false;
    if (this.editKotMode!=null){
      // this.editKotMode.newKot.push(product);
      this.editKotMode.newKot.find((item) => item.id === product.id)
          ? this.editKotMode.newKot.find((item) => item.id === product.id)!
              .quantity++
          : this.editKotMode.newKot.push(product);
    } else {
      const kotIndex = this.kots.findIndex((kot) => kot.stage === 'active');
      if (kotIndex === -1) {
        if (!this.orderNo){
          this.orderNo = this.dataProvider.orderTokenNo.toString();
          this.dataProvider.orderTokenNo++;
          this.databaseService.addOrderToken();
        }
        let kot = new Kot(this.dataProvider.kotToken.toString(),product)
        this.kots.push(kot)
        this.dataProvider.kotToken++;
        this.databaseService.addKitchenToken();
      } else {
        // if the item exists in the kot, increase the quantity by 1 else add the item to the kot
        this.kots[kotIndex].products.find((item) => item.id === product.id)
          ? this.kots[kotIndex].products.find((item) => item.id === product.id)!
              .quantity++
          : this.kots[kotIndex].products.push(product);
      }
    }
    this.updated.next();
    this.calculateBill();
  }

  editKot(kot: Kot) {
    if (this.currentKot?.stage === 'active') {
      if (
        confirm(
          'You are already editing a kot. Do you want to discard the changes and edit this kot?'
        )
      ) {
        this.editKotMode = {
          newKot: kot.products.slice(),
          previousKot: kot.products,
          kot: kot,
          kotIndex: this.kots.findIndex((localKot) => localKot.id==kot.id) || 0,
        };
        console.log('edit kot mode 1', this.editKotMode);
        this.dataProvider.manageKot = false;
        this.dataProvider.manageKotChanged.next(false);
        this.updated.next();
      } else {
        return;
      }
    } else {
      let clonedArray:Product[] = [];
      kot.products.forEach((product) => {
        clonedArray.push({ ...product });
      });
      this.editKotMode = {
        newKot: clonedArray,
        previousKot: kot.products,
        kot: kot,
        kotIndex: this.kots.findIndex((localKot) => localKot.id==kot.id) || 0,
      };
      // finalize the kot
      console.log('edit kot mode', this.editKotMode);
      this.dataProvider.manageKot = false;
      this.dataProvider.manageKotChanged.next(false);
      this.updated.next();
    }
  }

  setAsNonChargeable(name: string, contact: string, reason: string) {
    this.billingMode = 'nonChargeable';
    this.nonChargeableDetail = {
      reason,
      time: Timestamp.now(),
      user: this.user,
      phone: contact,
      name,
    };
    this.calculateBill();
    this.updated.next();
  }

  setAsNormal() {
    this.billingMode = 'cash';
    this.nonChargeableDetail = undefined;
    this.calculateBill();
    this.updated.next();
  }

  totalProducts() {
    let total = 0;
    this.kots.forEach((kot) => {
      if (kot.stage === 'active') {
        total += kot.products.length;
      }
    });
    return total;
  }

  calculateBill(noUpdate: boolean = false) {
    if (this.billingMode === 'nonChargeable') {
      this.billing.subTotal = 0;
      this.billing.grandTotal = 0;
      this.updated.next(noUpdate);
      return;
    }
    let totalApplicableTaxRate = Number(this.dataProvider.currentBusiness.cgst) + Number(this.dataProvider.currentBusiness.sgst);
    let allProducts: Product[] = [];
    this.kots.forEach((kot) => {
      if (kot.stage === 'finalized' || kot.stage === 'active') {
        // add product or increase quantity
        kot.products.forEach((product) => {
          let item = allProducts.find((item) => item.id === product.id);
          if (item) {
            item.quantity += product.quantity;
          } else {
            allProducts.push({ ...product, quantity: product.quantity });
          }
        })
      }
    })
    // decrease the rate of products if optional tax is enabled
    if (this.dataProvider.optionalTax){
      allProducts.forEach((product) => {
        let oldPrice = JSON.parse(JSON.stringify(product.price));
        product.taxedPrice = product.price - (((Math.round((product.price + Number.EPSILON) * 100) / 100)/100) * totalApplicableTaxRate);
        // set taxedPrice to all matching products
        this.kots.forEach((kot) => {
          kot.products.forEach((kotProduct) => {
            if (kotProduct.id === product.id){
              kotProduct.taxedPrice = product.taxedPrice;
            }
          })
        });
        console.log('product price', product.taxedPrice,oldPrice);
      })
    }
    // calculate sub total
    if (this.dataProvider.optionalTax){
      this.billing.subTotal = allProducts.reduce((acc, cur) => {
        if (cur.lineDiscount){
          if (cur.lineDiscount.type == 'amount'){
            return acc + (((cur.taxedPrice || 0) * cur.quantity) - cur.lineDiscount.value);
          } else {
            return acc + (((cur.taxedPrice || 0) * cur.quantity) - ((cur.taxedPrice || 0) * cur.quantity * cur.lineDiscount.value / 100));
          }
        } else {
          return acc + ((cur.taxedPrice || 0) * cur.quantity);
        }
      },0)
    } else {
      this.billing.subTotal = allProducts.reduce((acc, cur) => {
        return acc + (cur.price * cur.quantity);
      },0)
    }
    let unTaxedSubTotal = allProducts.reduce((acc, cur) => {
      if (cur.lineDiscount){
        if (cur.lineDiscount.type == 'amount'){
          cur.lineDiscount.totalAppliedDiscount = cur.lineDiscount.value;
          return acc + ((cur.price * cur.quantity) - cur.lineDiscount.value);
        } else {
          let discountValue = (cur.price * cur.quantity * cur.lineDiscount.value / 100)
          cur.lineDiscount.totalAppliedDiscount = discountValue;
          return acc + ((cur.price * cur.quantity) - discountValue);
        }
      } else {
        return acc + (cur.price * cur.quantity);
      }
    },0)
    console.log('sub total', this.billing.subTotal);
    // calculate totalApplicable discount
    let totalApplicableDiscount = 0;
    // calculate discounts
    // remove all discounts not allowed by current user
    this.billing.discount = this.billing.discount.filter((discount) => discount.accessLevels.includes(this.user.access))
    // remove all discounts not allowed by miniumum amount
    this.billing.discount = this.billing.discount.filter((discount) => {
      if(!discount.minimumAmount){
        return true;
      }
      if(discount.minimumAmount <= this.billing.subTotal){
        return true;
      } else {
        return false;
      }
    })
    // remove all discounts not allowed by minimum products
    this.billing.discount = this.billing.discount.filter((discount) => {
      if (!discount.minimumProducts){
        return true
      }
      if (discount.minimumProducts <= this.totalProducts()){
        return true
      } else {
        return false
      }
    })
    // calculate discounts
    let discounts:Discount[] = this.billing.discount.map((discount) => {
      if (discount.type === 'percentage'){
        let val = (discount.value / 100) * this.billing.subTotal
        if (discount.maximumDiscount && val > discount.maximumDiscount) {
          val = discount.maximumDiscount;
        }
        return {
          ...discount,
          totalAppliedDiscount: val,
        };
      } else {
        let val = discount.value
        if (discount.maximumDiscount && val > discount.maximumDiscount) {
          val = discount.maximumDiscount;
        }
        return {
          ...discount,
          totalAppliedDiscount: discount.value,
        };
      }
    })
    this.billing.discount = discounts;
    // reduce the discounts
    totalApplicableDiscount = discounts.reduce((acc, cur) => {
      return acc + cur.totalAppliedDiscount;
    }, 0);
    console.log('total applicable discount', totalApplicableDiscount);
    // decrease new subtotal with discount
    if (totalApplicableDiscount){
      var discountedSubtotal = this.billing.subTotal - totalApplicableDiscount;
    } else {
      var discountedSubtotal = this.billing.subTotal;
    }
    console.log('discounted subtotal', discountedSubtotal);
    // generate taxes
    if (this.dataProvider.optionalTax){
      taxes.forEach((tax) => {
        tax.amount = (tax.value / 100) * unTaxedSubTotal;
      })
    } else {
      taxes.forEach((tax) => {
        tax.amount = (tax.value / 100) * discountedSubtotal;
      })
    }
    this.billing.taxes = taxes;
    let totalApplicableTax = taxes.reduce((acc, cur) => {
      return acc + cur.amount;
    }, 0);
    console.log('total applicable tax', totalApplicableTax);
    // calculate grand total
    this.billing.grandTotal = Math.ceil(discountedSubtotal + totalApplicableTax);
    this.billing.grandTotal = Math.round((this.billing.grandTotal + Number.EPSILON) * 100) / 100
    console.log('grand total', this.billing.grandTotal);
    this.updated.next(noUpdate);

    // // log items of active kot with their quantity
    // // let kotItems: { id: string; quantity: number }[] = [];
    // // this.kots.forEach((kot) => {
    // //   if (kot.stage === 'active') {
    // //     kot.products.forEach((product) => {
    // //       let item = kotItems.find((item) => item.id === product.id);
    // //       if (item) {
    // //         item.quantity += product.quantity;
    // //       } else {
    // //         kotItems.push({ ...product, quantity: product.quantity });
    // //       }
    // //     });
    // //   }
    // // });
    // // console.log('kot items', kotItems);

    // this.billing.subTotal = this.kots.reduce((acc, cur) => {
    //   return (
    //     acc +
    //     cur.products.reduce((acc, cur) => {
    //       if(cur.lineDiscount){
    //         if(cur.lineDiscount.type === 'percentage'){
    //           return acc + ((cur.price * cur.quantity) - (((cur.price * cur.quantity)/100) * (cur.lineDiscount.value)));
    //         } else if (cur.lineDiscount.type === 'amount') {
    //           return acc + (cur.price * cur.quantity) - cur.lineDiscount.value;
    //         }
    //       }
    //       return acc + (cur.price * cur.quantity);
    //     }, 0)
    //   );
    // }, 0);
    // let partialSub = this.billing.subTotal - totalDiscount;
    // // calculate taxes from taxes 
    // taxes.map((tax) => {
    //   tax.amount = (tax.value / 100) * partialSub;
    // })
    // let totalTax = taxes.reduce((acc, cur) => {
    //   return acc + (cur.value / 100) * partialSub;
    // }, 0);
    // this.billing.taxes = taxes;
    // this.billing.totalTax = totalTax;
    // this.billing.grandTotal = partialSub + totalTax;
    // this.updated.next(noUpdate);
  }

  removeProduct(product: Product, kotIndex: number) {
    const index = this.kots[kotIndex].products.findIndex(
      (item) => item.id === product.id
    );
    this.kots[kotIndex].products.splice(index, 1);
    this.calculateBill();
  }

  finalizeAndPrintKot() {
    if (this.editKotMode != null) {
      console.log("Old kot", this.editKotMode.previousKot, "New kot", this.editKotMode.newKot);
      let kotIndex = this.kots.findIndex((kot) => this.editKotMode && kot.id === this.editKotMode.kot.id)
      console.log("Kot index", kotIndex);
      if(kotIndex != -1){
        this.kots[kotIndex].products = this.editKotMode.newKot;
        this.kots[kotIndex].stage = 'finalized';
        console.log('Active kot', this.kots[kotIndex]);
        this.printingService.printEditedKot(this.kots[kotIndex],this.editKotMode.previousKot,this.table.name,this.orderNo || '')
      }
      this.editKotMode = null;
      this.dataProvider.kotViewVisible = true;
    } else {
      let activeKot = this.kots.find(
        (value) => value.stage === 'active' || value.stage == 'edit'
      );
      console.log("info =>",activeKot);
      
      if (activeKot) {
        activeKot.stage = 'finalized';
        console.log('Active kot', activeKot);
        this.databaseService.addKitchenToken();
        activeKot.createdDate = Timestamp.now();
        this.updated.next();
        if (this.kots.length > 1){
          if (this.nonChargeableDetail) {
            // running nonchargeable kot
            this.printKot(activeKot,'runningNonChargeable'); 
          } else {
            // running chargeable kot
            console.log("running chargeable");
            this.printKot(activeKot,'runningChargeable');
          }
        } else {
          if (this.nonChargeableDetail) {
            // first nonchargeable kot
            this.printKot(activeKot,'firstNonChargeable');
          } else {
            // first chargeable kot
            this.printKot(activeKot,'firstChargeable');
          }
        }
        console.log("Must have printed");
        this.dataProvider.kotViewVisible = true;
      } else {
        alert('No active kot found');
      }
    }
    if(this.dataProvider.showTableOnBillAction){
      this.dataProvider.openTableView.next(true);
    }
  }

  lineCancelled(item:Product,event:any,kot:Kot){
    console.log("line cancelled",item,event);
    if (event.type=='unmade'){
      let newProductList = kot.products.filter((product) => product.id !== item.id);
      let tempKotEditer = {
        kot:kot,
        kotIndex:this.kots.findIndex((kot) => kot.id === kot.id),
        newKot:newProductList,
        previousKot:kot.products
      }
      this.printingService.printEditedKot(kot,tempKotEditer.previousKot,this.table.name,this.orderNo || '')
    }
    this.cancelledProducts.push({product:item,kot:kot.id});
    // remove product from kot
    kot.products = kot.products.filter((product) => product.id !== item.id);
    this.calculateBill();
  }

  addDiscount(discount: Discount) {
    this.billing.discount = [discount];
    console.log("this.billing.discount",this.billing.discount,discount);
    this.billing.grandTotal = this.billing.subTotal;
    this.billing.discount.forEach((discount) => {
      if (discount.type === 'percentage') {
        this.billing.grandTotal -=
          (this.billing.subTotal * discount.value) / 100;
      } else {
        this.billing.grandTotal -= discount.value;
      }
    });
    if(this.dataProvider.showTableOnBillAction){
      this.dataProvider.openTableView.next(true);
    }
    this.updated.next();
  }

  addTax(tax: Tax) {
    this.billing.taxes.push(tax);
    this.billing.grandTotal = this.billing.subTotal;
    this.billing.taxes.forEach((tax) => {
      if (tax.type === 'percentage') {
        this.billing.grandTotal += (this.billing.subTotal * tax.value) / 100;
      } else {
        this.billing.grandTotal += tax.value;
      }
    });
    this.updated.next();
  }

  finalize() {
    // check if any kot is active
    if (this.kots.find((kot) => kot.stage === 'active')) {
      if (confirm('There are active KOTs. Do you want to finalize them?')) {
        this.finalizeAndPrintKot();
      }
    }
    // alert("Mode: "+this.mode)
    if (this.mode=='takeaway'){
      console.log('customer info',this.customerInfo);
      if (!(this.customerInfo.name && this.customerInfo.phone && this.customerInfo.address)){
        alert('Please fill customer details');
        return;
      }
    } else if (this.mode =='online'){
      console.log('customer info',this.customerInfo);
      if (!(this.customerInfo.name && this.customerInfo.phone && this.customerInfo.address && this.customerInfo.deliveryName && this.customerInfo.deliveryPhone)){
        alert('Please fill customer details');
        return;
      }
    }
    // this.stage = 'finalized';
    // let data = this.toObject();
    // this.databaseService.updateBill(data);
    this.printBill()

    // this.updated.next();
    // if(this.dataProvider.showTableOnBillAction){
    //   this.dataProvider.openTableView.next(true);
    // }
  }
  setInstruction(){
    this.instruction = prompt('Enter instruction') || ''
    this.updated.next()
  }

  printBill(){
    // let kotObjects:any[] = []
    // this.kots.forEach((kot)=>{
    //   kotObjects.push(kot.toObject())
    // })
    // // merge all products of kots into one array and add quani
    // let allProducts:any[] = []
    // kotObjects.forEach((kot)=>{
    //   kot.products.forEach((product:any)=>{
    //     let index = allProducts.findIndex((res)=>res.id === product.id)
    //     if (index === -1){
    //       allProducts.push(product)
    //     } else {
    //       allProducts[index].quantity += product.quantity
    //     }
    //   })
    // })
    // let totalQuantity = allProducts.reduce((acc,cur)=>{
    //   return acc + cur.quantity
    // },0)
    // let settings:any =JSON.parse(localStorage.getItem('printerSettings') || '');
    // if (!settings['port']){
    //   alert('Please set printer settings first')
    //   return
    // }
    // let discounts = this.billing.discount.map((res)=>{
    //   return {
    //     title:res.name,
    //     discountValue:res.value,
    //     discountType:res.type,
    //     appliedDiscountValue:res.totalAppliedDiscount,
    //   }
    // })
    this.printingService.printBill(this);
    // const data = {
    //   "printer":localStorage.getItem('billPrinter'),
    //   "currentProject":settings,
    //   "isNonChargeable":this.nonChargeableDetail?true:false,
    //   "complimentaryName":this.nonChargeableDetail?.name || '',
    //   "customerInfoForm":this.customerInfo,
    //   "kotsToken":this.kots.map((res)=>res.id).join(','),
    //   "currentTable":this.table.tableNo,
    //   "allProducts":allProducts,
    //   "selectDiscounts":discounts,
    //   "specialInstructions":this.instruction || false,
    //   "totalQuantity":totalQuantity,
    //   "tableNo":this.table.tableNo,
    //   "totalTaxAmount":this.billing.totalTax,
    //   "taxableValue":this.billing.subTotal,
    //   "date": (new Date()).toLocaleDateString('en-GB'),
    //   "time": (new Date()).toLocaleTimeString('en-GB'),
    //   "cgst":(this.billing.taxes[0].amount).toFixed(2),
    //   "sgst":(this.billing.taxes[1].amount).toFixed(2),
    //   "grandTotal":(this.billing.grandTotal).toFixed(2),
    //   "paymentMethod":this.billingMode,
    //   "id":this.id,
    //   "billNo":this.nonChargeableDetail ? "NC-" + this.id : this.id,
    // }
    // console.log("Data",data);
    // fetch('http://192.168.29.125:'+settings['port']+'/printBill',{
    //     method:'POST',
    //     body: JSON.stringify(data),
    //     headers: {
    //       'Content-Type': 'application/json'
    //     }
    //   }).then((res) => {
    //     console.log("Contente",res)
    //   }).catch((err) => {
    //     console.log("Error",err)
    //     alert("Error occurred while printing bill")
    //   })
    
  }

  deleteKot(kot: Kot) {
    kot.stage = 'cancelled';
    this.updated.next();
    this.printingService.deleteKot(this.table.tableNo.toString(),this.orderNo || '',kot.products,kot.id);
  }

  printKot(kot:Kot,mode:'firstChargeable'|'cancelledKot'|'editedKot'|'runningNonChargeable'|'runningChargeable'|'firstNonChargeable'|'reprintKot'|'online'){
    // let products = kot.products.map((product)=>{
    //   return {
    //     name:product.name,
    //     quantity:product.quantity,
    //     instruction:product.instruction,
    //   }
    // })
    this.printingService.printKot(this.table.tableNo.toString(),this.orderNo || '',kot.products,kot.id,mode)
    console.log("Send to service");
    
    // let data ={
    //   'id':kot.id,
    //   'businessDetails': this.dataProvider.currentBusiness,
    //   "table": this.table.tableNo,
    //   'billNo': this.id,
    //   "orderNo":this.orderNo,
    //   "date":(new Date()).toLocaleDateString('en-GB'),
    //   "time":(new Date()).toLocaleTimeString('en-GB'),
    //   "mode":"firstChargeable",
    //   "products":[
    //       {
    //           "id":"1",
    //           "name":"Item 4",
    //           "instruction":"",
    //           "quantity":2,
    //       },
    //   ]
    // }
    // console.log(data)
    //   fetch('http://192.168.29.125:'+settings['port']+'/printKot',{
    //     method:'POST',
    //     body: JSON.stringify(data),
    //     headers: {
    //       'Content-Type': 'application/json'
    //     }
    //   }).then((res) => {
    //     console.log("Contente",res)
    //   }).catch((err) => {
    //     console.log("Error",err)
    //   })
  }

  settle(
    customerName: string,
    customerContact: string,
    paymentMethod: string,
    cardEnding?: string,
    upiAddress?: string
  ) {
    this.calculateBill();
    // update every product and increase their sales counter by their quantity
    let products:Product[]=[];
    let allProducts = this.kots.reduce((acc, cur) => {
      return acc.concat(cur.products);
    }, products);
    allProducts.forEach((product) => {
      if (!product.sales){
        product.sales = 0
      }
      product.sales += product.quantity;
    });
    if (!this.billNo){
      if (this.nonChargeableDetail){
        this.billNo = "NC-" + this.dataProvider.ncBillToken.toString();
        this.dataProvider.ncBillToken++;
        this.databaseService.addNcBillToken();
      } else {
        if (this.mode=='dineIn'){
          this.billNo = this.dataProvider.billToken.toString(),
          this.dataProvider.billToken++;
          this.databaseService.addBillToken();
        } else if (this.mode == 'takeaway') {
          this.billNo = this.dataProvider.takeawayToken.toString(),
          this.dataProvider.takeawayToken++;
          this.databaseService.addTakeawayToken();
        } else if (this.mode == 'online') {
          this.billNo = this.dataProvider.onlineTokenNo.toString(),
          this.dataProvider.onlineTokenNo++;
          this.databaseService.addOnlineToken();
        } else {
          this.billNo = this.dataProvider.billToken.toString(),
          this.dataProvider.billToken++;
          this.databaseService.addBillToken();
        }
      }
    }
    // update in databse
    this.databaseService.updateProducts(allProducts);
    // this.stage = 'settled';
    this.settlement = {
      customerName: customerName,
      customerContact: customerContact,
      paymentMethod: paymentMethod,
      cardEnding: cardEnding || '',
      upiAddress: upiAddress || '',
      time: Timestamp.now(),
      user: this.user,
    };
    if (this.dataProvider.printBillAfterSettle){
      this.printingService.printBill(this)
    }
    if(this.nonChargeableDetail){
      this.databaseService.addSales(this.billing.grandTotal,'nonChargeableSales')
    } else if(this.mode=='dineIn'){
      this.databaseService.addSales(this.billing.grandTotal,'dineInSales')
    } else if (this.mode == 'takeaway'){
      this.databaseService.addSales(this.billing.grandTotal,'takeawaySales')
    } else if (this.mode == 'online'){
      this.databaseService.addSales(this.billing.grandTotal,'onlineSales')
    }
    this.dataProvider.currentTable?.clearTable()
    this.dataProvider.currentBill = undefined;
    this.dataProvider.currentTable = undefined;
    this.dataProvider.totalSales += this.billing.grandTotal;
    this.updated.next();
    if(this.dataProvider.showTableOnBillAction){
      this.dataProvider.openTableView.next(true);
    }
    return this.billNo;
  }

  cancel(reason: string, phone: string) {
    this.stage = 'cancelled';
    this.cancelledReason = {
      reason: reason,
      phone: phone,
      time: Timestamp.now(),
      user: this.user,
    };
    // remove any active kot
    this.kots = this.kots.filter((kot) => kot.stage !== 'active');
    this.dataProvider.currentBill = undefined;
    this.dataProvider.currentTable!.status = 'available';
    this.dataProvider.currentTable!.bill = null;
    this.dataProvider.currentTable = undefined;
    // this.dataProvider.totalSales += this.billing.grandTotal;
    if(this.dataProvider.showTableOnBillAction){
      this.dataProvider.openTableView.next(true);
    }
    this.updated.next();
  }

  setCustomerInfo(customerInfo: CustomerInfo) {
    this.customerInfo = customerInfo;
    this.updated.next();
  }

  setTable(table: Table) {
    this.table = table;
    this.updated.next();
  }

  merge(bill: Bill) {
    bill.kots.forEach((kot) => {
      this.addKot(kot);
    });
    bill.clearAllKots();
    // clear the table
    bill.table.bill = null;
    bill.table.status = 'available';
    this.updated.next();
  }

  getKotsObject() {
    // return this.kots.map((kot) => {
    //   return kot.toObject();
    // });
  }

  toObject() {
    // return {
    //   'id': this.id,
    // }
    return {
      id: this.id,
      tokens: this.tokens,
      createdDate: this.createdDate,
      table: this.table.id,
      billNo: this.billNo || null,
      orderNo: this.orderNo || null,
      mode: this.mode,
      optionalTax: this.optionalTax,
      kots: this.kotWithoutFunctions,
      billing: this.billing,
      stage: this.stage,
      user: this.user,
      settlement: this.settlement || null,
      cancelledReason: this.cancelledReason || null,
      billingMode: this.billingMode,
      nonChargeableDetail: this.nonChargeableDetail || null,
      customerInfo: this.customerInfo,
    };
  }

  static fromObject(object: BillConstructor,table:Table,dataprovider:DataProvider,databaseService:DatabaseService,printService:PrintingService): Bill {
    // this.id = object.id;
    // this.tokens = object.tokens;
    // this.createdDate = object.createdDate;
    // this.mode = object.mode;
    // this.device = object.device;
    // // this.kots = object.kots;
    // // create kots classes from objects and add them to the bill
    // object.kots.forEach((kot) => {
    //   console.log("Creating kot",kot);
      
    //   this.addKot(new Kot(kot.id,kot.products[0],kot));
    // });
    // this.billing = object.billing;
    // this.stage = object.stage;
    // this.user = object.user;
    // this.settlement = object.settlement;
    // this.cancelledReason = object.cancelledReason;
    // this.billingMode = object.billingMode;
    // this.nonChargeableDetail = object.nonChargeableDetail;
    // this.customerInfo = object.customerInfo;
    if(dataprovider.currentMenu?.selectedMenu){
      let instance = new Bill(object.id,
        table,
        object.mode,
        object.user,
        dataprovider.currentMenu?.selectedMenu,
        dataprovider,
        databaseService,
        printService
      );
      instance.tokens = object.tokens;
      instance.createdDate = object.createdDate;
      instance.billing = object.billing;
      instance.stage = object.stage;
      instance.orderNo = object.orderNo;
      instance.settlement = object.settlement;
      instance.cancelledReason = object.cancelledReason;
      instance.billingMode = object.billingMode;
      instance.nonChargeableDetail = object.nonChargeableDetail;
      instance.customerInfo = object.customerInfo;
      instance.optionalTax = object.optionalTax || false;
      // create kots classes from objects and add them to the bill
      object.kots.forEach((kot) => {
        console.log("Creating kot",kot);
        instance.addKot(new Kot(kot.id,kot.products[0],kot));
      });
      // instance.currentKot = instance.kots.find((kot) => {
      //   return kot.stage === 'active';
      // }) || null;
      instance.calculateBill(true);
      return instance;
    } else{
      throw new Error("No menu selected")
    }
  }


  splitBill(bills:splittedBill[]) {
    
  }
}

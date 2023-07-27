import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Subject, debounceTime, filter, firstValueFrom } from 'rxjs';
import Fuse from 'fuse.js';
import { flipInYOnEnterAnimation, flipOutYOnLeaveAnimation, slideInDownOnEnterAnimation, slideOutUpOnLeaveAnimation } from 'angular-animations';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ReprintReasonComponent } from './reprint-reason/reprint-reason.component';
import { Timestamp } from '@angular/fire/firestore';
import { PrinterService } from '../../../../core/services/printing/printer/printer.service';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';
import { HistoryService } from '../../../../core/services/database/history/history.service';
import { BillService } from '../../../../core/services/database/bill/bill.service';
import { BillConstructor, PrintableBill } from '../../../../types/bill.structure';
import { KotConstructor, PrintableKot } from '../../../../types/kot.structure';
import { getPrintableBillConstructor } from '../../../../core/constructors/bill/methods/getHelpers.bill';
import { calculateBill } from '../../actions/split-bill/split-bill.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';



@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  animations:[
    slideInDownOnEnterAnimation(),
    slideOutUpOnLeaveAnimation(),
    flipInYOnEnterAnimation(),
    flipOutYOnLeaveAnimation()
  ]
})
export class HistoryComponent {
  totalSales:number = 0;
  startKot:string = '';
  endKot:string = '';
  groupByTable:boolean = false;
  groupByDate:boolean = false;
  loading:boolean = false;
  minimumAmount:number = 0;
  totalKots:number = 0;
  totalBills:number = 0;
  startingKotNumber:number|string = 0;
  endingKotNumber:number|string = 0;
  // mode vars
  currentMode:'all'|'dineIn'|'takeaway'|'online' = 'all';

  // Reports
  bills:ExtendedBillConstructor[] = []
  filteredBills:ExtendedBillConstructor[] = []
  fuseSearchInstance = new Fuse(this.bills, {keys:['billNo','orderNo']})
  numberSearchSubject:Subject<string> = new Subject<string>();
  dateRangeFormGroup:FormGroup = new FormGroup({
    startDate:new FormControl('',[Validators.required]),
    endDate:new FormControl('',[Validators.required]),
  });
  constructor(private historyService: HistoryService,private billService:BillService,private printingService:PrinterService,private dialog:Dialog,private dataProvider:DataProvider,public dialogRef:DialogRef) {
    this.numberSearchSubject.pipe(debounceTime(600)).subscribe((searchTerm) => {
      if(searchTerm.length > 0){
        this.filteredBills = this.fuseSearchInstance.search(searchTerm).map((result) => {
          return result.item;
        })
      //  console.log("filteredBills",this.filteredBills);
      } else {
        this.filteredBills = [];
      }
    });
    this.dateRangeFormGroup.valueChanges.subscribe((value) => {
      console.log("Picker range changed",value);
      if (this.dateRangeFormGroup.valid){
        this.getReport()
      }
    })
  }

  endDateChanged(value:any){
    console.log("value",value);
  }

  ngOnInit(): void {
    // patch value of dateRangeFormGroup with current date as startDate and endDate
    this.dateRangeFormGroup.patchValue({
      startDate:new Date(),
      endDate:new Date(),
    })
  }

  regenerateStats(){
    this.totalSales = 0;
    this.startKot = '';
    this.endKot = '';
    this.totalKots = 0;
    this.totalBills = 0;
    this.startingKotNumber = 0;
    this.endingKotNumber = 0;
    let filteredBills = this.bills.filter((bill)=>{
      return this.currentMode == 'all' || bill.mode == this.currentMode;
    });
    filteredBills.forEach((bill) => {
      // recalculate stats totalSales, startKot, endKot, totalKots, totalBills, startingKotNumber, endingKotNumber
      this.totalSales += bill.billing.grandTotal;
      this.totalKots += bill.kots.length;
      this.totalBills++;
      if(this.startKot == ''){
        this.startKot = bill.orderNo;
      }
      this.endKot = bill.orderNo;
      if(this.startingKotNumber == 0){
        this.startingKotNumber = bill.orderNo;
      }
      this.endingKotNumber = bill.orderNo;
    })
  }

  getReport(){
    this.billService.getBillsByDay(this.dateRangeFormGroup.value.startDate,this.dateRangeFormGroup.value.endDate).then((bills) => {
    //  console.log("bills",bills.docs);
      this.bills = bills.docs.map((doc) => {
        let allProducts = doc.data().kots.reduce((acc,kot) => {
          acc.push(...kot.products);
          return acc;
        },[] as any[]);
        console.log("BILL: ",doc.data());
        
        let printableBillData = getPrintableBillConstructor(doc.data() as BillConstructor,allProducts,this.dataProvider)
        return {...doc.data(),id:doc.id,kotVisible:false,flipped:false,kotOrBillVisible:false,printableBillData} as ExtendedBillConstructor;
      });
      this.totalKots = this.bills.reduce((acc,bill) => {
        return acc + bill.kots.length;
      },0);
      this.totalBills = this.bills.length;
      this.startingKotNumber = this.bills.length > 0 ? this.bills[0].orderNo : 0;
      this.endingKotNumber = this.bills.length > 0 ? this.bills[this.bills.length-1].orderNo : 0;
      this.totalSales = this.bills.reduce((acc,bill) => {
        return acc + bill.billing.grandTotal;
      },0);
      this.startKot = this.bills.length > 0 ? this.bills[0].orderNo : '0';
      this.endKot = this.bills.length > 0 ? this.bills[this.bills.length-1].orderNo : '0';
      this.fuseSearchInstance.setCollection(this.bills);
      this.loading = false;
    });
  }

  getGroupsByTable(bills:BillConstructor[]){
    let groups = bills.reduce((acc,bill) => {
      let index = acc.findIndex((group) => group.table == bill.table);
      if(index == -1){
        acc.push({table:bill.table,bills:[bill]});
      } else {
        acc[index].bills.push(bill);
      }
      return acc;
    },[] as {table:{id:string,name:string},bills:BillConstructor[]}[])
    return groups;
  }

  async reprintBill(bill:BillConstructor){
    const dialog = this.dialog.open(ReprintReasonComponent)
    let res = await firstValueFrom(dialog.closed)
    if(res && typeof res == 'string'){
      let userRes = this.dataProvider.currentUser.business.find((business) => business.businessId == this.dataProvider.currentBusiness.businessId)!;
      bill.billReprints.push({
        reprintReason:res,
        time:Timestamp.now(),
        user:{
          access:userRes.access.accessLevel,
          username:userRes.name,
        }
      });
      // let products = bill.kots.reduce((acc,kot) => {
      //   kot.products.forEach((product) => {
      //     let index = acc.findIndex((accProduct) => accProduct.name == product.name);
      //     if(index == -1){
      //       acc.push({...product,quantity:1});
      //     } else {
      //       acc[index].quantity++;
      //     }
      //   })
      //   return acc;
      // },[] as any[])
      // let printableBillData = getPrintableBillConstructor(bill,products,this.dataProvider)
      calculateBill(bill,this.dataProvider);
      this.printingService.reprintBill(bill.printableBillData);
    } else {
      alert("Reprint Cancelled")
      return;
    }
  }

  async reprintKot(kot:KotConstructor,bill:BillConstructor){
    const dialog = this.dialog.open(ReprintReasonComponent)
    let res = await firstValueFrom(dialog.closed)
    if(res && typeof res == 'string'){
      let products = [];
      kot.products.forEach((product) => {
        if (product.itemType == 'product'){
          products.push(product);
        } else if (product.itemType == 'combo'){
          product.productSelection.forEach((item) => {
            item.products.forEach((product) => {
              products.push(product);
            })
          })
        }
      })
      // remove duplicates by adding quantity
      products = products.reduce((acc, current) => {
        const x = acc.find((item) => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          x.quantity += current.quantity;
          return acc;
        }
      }, []);
      let printableKot:PrintableKot = {
        billingMode:bill.mode,
        // date in dd/mm/yyyy format
        date: kot.createdDate.toDate().toLocaleDateString('en-GB'),
        // time in 12 hour format
        time: kot.createdDate.toDate().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }),
        mode:'reprintKot',
        orderNo:bill.orderNo,
        products:products.map((product)=>{
          return {
            id:product.id,
            category:product.category,
            instruction:product.instruction,
            name: product.name,
            quantity:product.quantity,
            edited:product.cancelled,
            specificPrinter:product.specificPrinter
          }
        }),
        table:bill.table as unknown as string,
        token:kot.id,
      }
      this.printingService.printKot(printableKot)
      // this.printingService.reprintKot(kot,bill.table.name,bill);
    } else {
      alert("Reprint Cancelled")
      return;
    }
  }

  generateConsolidatedReport(){
    let filteredBills = this.bills.filter((bill) => bill.billing.grandTotal >=this.minimumAmount && bill.stage=='settled');
    // let consolidated = filteredBills.reduce((acc,bill) => {
    //   bill.modifiedAllProducts.forEach((product) => {
    //     let index = acc.findIndex((accProduct) => accProduct.name == product.name);
    //     if(index == -1){
    //       acc.push({...product,quantity:1});
    //     } else {
    //       acc[index].quantity++;
    //     }
    //   })
    //   return acc;
    // },[] as Product[])
    // let consolidated 
  }

  async downloadBillInvoice(bill:PrintableBill){
    // Default export is a4 paper, portrait, using millimeters for units
    const doc = new jsPDF('p', 'mm', [300, 80]);
    let body =[];
    let currentPageCursor = 0;
    let heading = [[
      {
        content:bill.businessDetails.name,
        styles:{halign:'center',fontSize:14,fontStyle:'bold'}
      },
    ],
    [
      {
        content:bill.businessDetails.address,
        styles:{halign:'center'}
      },
    ],
    [
      {
        content:bill.businessDetails.phone,
        styles:{halign:'center'}
      },
    ],
    [
      {
        content:bill.businessDetails.fssai ? 'FSSAI: '+bill.businessDetails.fssai : '',
        styles:{halign:'left'}
      },
      {
        content:bill.businessDetails.gstin ? 'GST: '+bill.businessDetails.gstin : '',
        styles:{halign:'right'}
      },
    ]].filter((row) => {
      return row[0].content;
    });
    body.push(...heading);
    autoTable(doc,{
      startY:currentPageCursor,
      margin: { top: 0,left:0,right:0,bottom:0 },
      body:[
        ...body
      ],
      theme:'plain',
      didDrawCell: (data) => {
        currentPageCursor = data.cursor.y;
      }
    });
    // heading section
    currentPageCursor+=10
    doc.line(0, currentPageCursor, 300, currentPageCursor+1); //TODO: pending line
    currentPageCursor+=3
    body = [];
    heading = [
    [
      {
        content:'Customer Details',
        styles:{halign:'left',fontSize:11,fontStyle:'bold'}
      },
    ],
    [
      {
        content:bill.customerDetail.name,
        styles:{halign:'left'}
      },
    ],
    [
      {
        content:bill.customerDetail.phone,
        styles:{halign:'left'}
      },
    ],
    [
      {
        content:bill.customerDetail.address,
        styles:{halign:'left'}
      },
    ],
    [
      {
        content:bill.customerDetail.gstin,
        styles:{halign:'left'}
      },
    ]].filter((row) => {
      return row[0].content;
    });
    body.push(...heading);
    if(bill.customerDetail.name || bill.customerDetail.phone || bill.customerDetail.address || bill.customerDetail.gstin){
      autoTable(doc,{
        startY:currentPageCursor,
        margin: { top: 0,left:0,right:0,bottom:0 },
        body:[
          ...body
        ],
        theme:'plain',
        didDrawCell: (data) => {
          if(data.section == 'body'){
            currentPageCursor = data.cursor.y;
          }
        }
      });
      // customer section
      currentPageCursor+=10
      doc.line(0, currentPageCursor, 300, currentPageCursor);
    }
    body = [];
    heading = [
    [
      {
        content:'Date: '+bill.date,
        styles:{halign:'left'}
      },
      {
        content:'Time: '+bill.time,
        styles:{halign:'left'}
      },
    ],
    [
      {
        content:'Token: '+bill.orderNo,
        styles:{halign:'left'}
      },
      {
        content:"Bill: "+(bill.billNoSuffix ? bill.billNoSuffix : '') + (bill.billNo || ''),
        styles:{halign:'left'}
      },
    ],
    [
      {
        content:"Cashier: "+bill.cashierName,
        styles:{halign:'left'}
      },
      {
        content:"Mode: "+bill.mode,
        styles:{halign:'left'}
      },
    ]].filter((row) => {
      return row[0].content;
    });
    body.push(...heading);
    autoTable(doc,{
      startY:currentPageCursor,
      margin: { top: 0,left:0,right:0,bottom:0 },
      body:[
        ...body
      ],
      theme:'plain',
      didDrawCell: (data) => {
        currentPageCursor = data.cursor.y;
      }
    });
    // bill info section
    currentPageCursor+=10
    doc.line(0, currentPageCursor, 300, currentPageCursor+1);  //TODO: pending line
    currentPageCursor+=3
    body = [];
    let products = [];
    console.log("bill.products",bill.products);
    bill.products.forEach((product) => {
      products.push(
        [
          {
            content:product.name,
            styles:{halign:'left'}
          },
          {
            content:product.quantity,
            styles:{halign:'center'}
          },
          {
            content:'Rs. '+product.untaxedValue,
            styles:{halign:'center'}
          },
          {
            content:'Rs. '+product.total,
            styles:{halign:'right'}
          },
        ],
      )
    });
    heading = [
    [
      {
        content:'Product',
        styles:{halign:'left',fontSize:10,fontStyle:'bold'}
      },
      {
        content:'Qty',
        styles:{halign:'center',fontSize:10,fontStyle:'bold'}
      },
      {
        content:'Price',
        styles:{halign:'center',fontSize:10,fontStyle:'bold'}
      },
      {
        content:'Amount',
        styles:{halign:'right',fontSize:10,fontStyle:'bold'}
      },
    ],
    ...products
    ].filter((row) => {
      return row[0].content;
    });
    body.push(...heading);
    autoTable(doc,{
      startY:currentPageCursor,
      margin: { top: 0,left:0,right:0,bottom:0 },
      body:[
        ...body
      ],
      theme:'plain',
      didDrawCell: (data) => {
        currentPageCursor = data.cursor.y;
      }
    });
    // bill products section
    currentPageCursor+=10
    doc.line(0, currentPageCursor, 300, currentPageCursor+1);
    currentPageCursor+=3
    body = [];
    heading = [
    [
      {
        content:'Total Qty: '+bill.totalQuantity,
        styles:{halign:'left',fontSize:10}
      },
      {
        content:'Sub Total: '+bill.subTotal,
        styles:{halign:'right',fontSize:11,fontStyle:'bold'}
      },
    ],
    ].filter((row) => {
      return row[0].content;
    });
    body.push(...heading);
    autoTable(doc,{
      startY:currentPageCursor,
      margin: { top: 0,left:0,right:0,bottom:0 },
      body:[
        ...body
      ],
      theme:'plain',
      didDrawCell: (data) => {
        currentPageCursor = data.cursor.y;
      }
    });
    // bill total quantity section
    currentPageCursor+=10
    doc.line(0, currentPageCursor, 300, currentPageCursor+1);  //TODO: pending line
    currentPageCursor+=3
    body = [];
    let discounts = [];
    bill.discounts.forEach((discount) => {
      discounts.push(
        [
          {
            content:discount.name + (discount.type == 'flat' ? 'Rs.' : '%'),
            styles:{halign:'left',fontSize:10}
          },
          {
            content:discount.rate,
            styles:{halign:'center',fontSize:10}
          },
          {
            content:'Rs. '+discount.value,
            styles:{halign:'right',fontSize:10}
          },
        ],
      )
    });
    heading = [
    [
      {
        content:'Discount',
        styles:{halign:'left',fontSize:11,fontStyle:'bold'}
      },
      {
        content:'Rate',
        styles:{halign:'center',fontSize:11,fontStyle:'bold'}
      },
      {
        content:'Amount',
        styles:{halign:'right',fontSize:11,fontStyle:'bold'}
      },
    ],
    ...discounts
    ].filter((row) => {
      return row[0].content;
    });
    body.push(...heading);
    if (bill.discounts.length > 0){
      autoTable(doc,{
        startY:currentPageCursor,
        margin: { top: 0,left:0,right:0,bottom:0 },
        body:[
          ...body
        ],
        theme:'plain',
        didDrawCell: (data) => {
          if(data.section == 'body'){
            currentPageCursor = data.cursor.y;
          }
        }
      });
      // bill disocunts
      // bill total quantity section
      currentPageCursor+=10
      doc.line(0, currentPageCursor, 300, currentPageCursor+1);  //TODO: pending line
      currentPageCursor+=3
    }
    body = [];
    let taxes = [];
    bill.taxes.forEach((tax) => {
      taxes.push(
        [
          {
            content:tax.name,
            styles:{halign:'left'}
          },
          {
            content:tax.rate + '%',
            styles:{halign:'center'}
          },
          {
            content:'Rs. '+tax.value,
            styles:{halign:'right'}
          },
        ],
      )
    });
    heading = [
    [
      {
        content:'Tax',
        styles:{halign:'left',fontSize:11,fontStyle:'bold'}
      },
      {
        content:'Rate',
        styles:{halign:'center',fontSize:11,fontStyle:'bold'}
      },
      {
        content:'Amount',
        styles:{halign:'right',fontSize:11,fontStyle:'bold'}
      },
    ],
    ...taxes
    ].filter((row) => {
      return row[0].content;
    });
    body.push(...heading);
    autoTable(doc,{
      startY:currentPageCursor,
      margin: { top: 0,left:0,right:0,bottom:0 },
      body:[
        ...body
      ],
      theme:'plain',
      didDrawCell: (data) => {
        currentPageCursor = data.cursor.y;
      }
    });
    // bill taxes section
    currentPageCursor+=10
    doc.line(0, currentPageCursor, 300, currentPageCursor+1);  //TODO: pending line
    currentPageCursor+=3
    body = [];
    heading = [[{
      content:'Grand Total: '+'Rs.'+bill.grandTotal,
      styles:{halign:'right',fontSize:13,fontStyle:'bold'}
    }]]
    body.push(...heading);
    autoTable(doc,{
      startY:currentPageCursor,
      margin: { top: 0,left:0,right:0,bottom:0 },
      body:[
        ...body
      ],
      theme:'plain',
      didDrawCell: (data) => {
        currentPageCursor = data.cursor.y;
      }
    });

    doc.save("a4.pdf");
  }

  async downloadKotInvoice(mainKot:KotConstructor,billConstructor:BillConstructor){
    // convert kot to printable kot
    let allProducts = [];
    mainKot.products.forEach((product) => {
      if (product.itemType == 'product'){
        allProducts.push(product);
      } else if (product.itemType == 'combo'){
        product.productSelection.forEach((item) => {
          item.products.forEach((product) => {
            allProducts.push(product);
          })
        })
      }
    });
    // remove duplicates by adding quantity
    allProducts = allProducts.reduce((acc, current) => {
      const x = acc.find((item) => item.id === current.id);
      if (!x) {
        return acc.concat([current]);
      } else {
        x.quantity += current.quantity;
        return acc;
      }
    }, []);
    let kot = {
      date:mainKot.createdDate.toDate().toLocaleDateString(),
      time:mainKot.createdDate.toDate().toLocaleTimeString(),
      mode:mainKot.mode || 'firstChargeable',
      orderNo:billConstructor.orderNo,
      table:billConstructor.table as unknown as string,
      token:mainKot.id,
      billingMode:billConstructor.mode,
      products:allProducts.map((product)=>{
        return {
          id:product.id,
          name:product.name,
          instruction:product.instruction || '',
          quantity:product.quantity,
          edited:product.cancelled,
          category:product.category,
          specificPrinter:product.specificPrinter
        }
      }),
    }
    const doc = new jsPDF('p', 'mm', [200, 80]);
    let body =[];
    let currentPageCursor = 0;
    var head;
    // 'firstChargeable'|'cancelledKot'|'editedKot'|'runningNonChargeable'|'runningChargeable'|'firstNonChargeable'|'reprintKot'|'online'
    if (kot.mode == 'firstChargeable'){
      head= {
        content:'First Chargeable',
        styles:{halign:'center',fontSize:14,fontStyle:'bold'}
      }
    } else if (kot.mode == 'cancelledKot'){
      head= {
        content:'Cancelled',
        styles:{halign:'center',fontSize:14,fontStyle:'bold'}
      }
    } else if (kot.mode == 'editedKot'){
      head= {
        content:'Edited',
        styles:{halign:'center',fontSize:14,fontStyle:'bold'}
      }
    } else if (kot.mode == 'runningNonChargeable'){
      head= {
        content:'Running Non Chargeable',
        styles:{halign:'center',fontSize:14,fontStyle:'bold'}
      }
    } else if (kot.mode == 'runningChargeable'){
      head= {
        content:'Running Chargeable',
        styles:{halign:'center',fontSize:14,fontStyle:'bold'}
      }
    } else if (kot.mode == 'firstNonChargeable'){
      head= {
        content:'First Non Chargeable',
        styles:{halign:'center',fontSize:14,fontStyle:'bold'}
      }
    } else if (kot.mode == 'reprintKot'){
      head= {
        content:'Reprint',
        styles:{halign:'center',fontSize:14,fontStyle:'bold'}
      }
    } else if (kot.mode == 'online'){
      head= {
        content:'Online',
        styles:{halign:'center',fontSize:14,fontStyle:'bold'}
      }
    }
    let heading = [[
      head
    ],
    ].filter((row) => {
      return row[0].content;
    });
    body.push(...heading);
    autoTable(doc,{
      startY:currentPageCursor,
      margin: { top: 0,left:0,right:0,bottom:0 },
      body:[
        ...body
      ],
      theme:'plain',
      didDrawCell: (data) => {
        currentPageCursor = data.cursor.y;
      }
    });
    // heading section
    currentPageCursor+=10
    doc.line(0, currentPageCursor, 200, currentPageCursor+1); //TODO: pending line
    currentPageCursor+=3
    body = [];
    heading = [
    [
      {
        content:'Date: '+kot.date,
        styles:{halign:'left'}
      },
      {
        content:'Token: '+kot.orderNo,
        styles:{halign:'right'}
      },
    ],
    [
      {
        content:'Kot No: '+ kot.token,
        styles:{halign:'left'}
      },
      {
        content:(this.getModeTitle(kot.billingMode))+' No: ' + kot.table,
        styles:{halign:'right'}
      },
    ]
    ];
    body.push(...heading);
    autoTable(doc,{
      startY:currentPageCursor,
      margin: { top: 0,left:0,right:0,bottom:0 },
      body:[
        ...body
      ],
      theme:'plain',
      didDrawCell: (data) => {
        currentPageCursor = data.cursor.y;
      }
    });
    // kot info section
    currentPageCursor+=10
    doc.line(0, currentPageCursor, 200, currentPageCursor+1);  //TODO: pending line
    currentPageCursor+=3
    body = [];
    let kotProducts = [];
    kot.products.forEach((product) => {
      kotProducts.push(
        [
          {
            content:(product.edited ? 'X--' : '' ) + product.name+(product.edited ? 'X--' : '' ),
            styles:{halign:'left'}
          },
          {
            content:product.instruction,
          },
          {
            content:product.quantity,
            styles:{halign:'right'}
          },
        ]
      )
    });
    heading = [
    [
      {
        content:'Product',
        styles:{halign:'left',fontSize:10,fontStyle:'bold'}
      },
      {
        content:'Ins',
        styles:{halign:'center',fontSize:10,fontStyle:'bold'}
      },
      {
        content:'Qty',
        styles:{halign:'right',fontSize:10,fontStyle:'bold'}
      },
    ],
    ...kotProducts
    ].filter((row) => {
      return row[0].content;
    });
    body.push(...heading);
    autoTable(doc,{
      startY:currentPageCursor,
      margin: { top: 0,left:0,right:0,bottom:0 },
      body:[
        ...body
      ],
      theme:'plain',
      didDrawCell: (data) => {
        currentPageCursor = data.cursor.y;
      }
    });
    doc.save("a4.pdf");
  }

  getModeTitle(mode: 'dineIn'|'takeaway'|'online'):string {
    if (mode=='dineIn'){
      return 'Table';
    } else if (mode =='takeaway'){
      return 'Token';
    } else if (mode =='online'){
      return 'Order';
    } else {
      return 'Table';
    }
  }

  exportToPdf(){
    // do it by selected mode
    let filteredBills = this.bills.filter((bill) => this.currentMode == 'all' || bill.mode==this.currentMode);
    // create a jspdf doc with autotable 
    // heading should be Bill No, Order No, Table, Time, Total, Mode
    // body should be the filtered bills
    // export to excel

    let doc = new jsPDF();
    autoTable(doc,{
      head:[
        [
          "Total KOT",
          "Total Bills",
          "Starting KOT",
          "End KOT",
          "Total Sales"
        ]
      ],
      body:[
        [
          this.totalKots,
          this.totalBills,
          this.startingKotNumber,
          this.endingKotNumber,
          this.totalSales,
        ]
      ]
    })
    autoTable(doc,{
      head:[
        [
          'Time',
          'Mode',
          'Table',
          'Bill No',
          'Order No',
          'Total',
        ]
      ],
      body:[
        ...filteredBills.map((bill:any) => {
          return [
            bill.createdDate.toDate().toLocaleString(),
            bill.mode,
            bill.table,
            bill.billNo,
            bill.orderNo,
            bill.billing.grandTotal,
          ]
        })
      ],
    });
    doc.save("Bills Report.pdf");
  }

  exportToExcel(){
    // generate a csv file exactly same as exportToPdf function
    let filteredBills = this.bills.filter((bill) => this.currentMode == 'all' || bill.mode==this.currentMode);
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Total KOT,Total Bills,Starting KOT,End KOT,Total Sales\n";
    csvContent += this.totalKots+","+this.totalBills+","+this.startingKotNumber+","+this.endingKotNumber+","+this.totalSales+"\n";
    csvContent += "Time,Mode,Table,Bill No,Order No,Total\n";
    filteredBills.forEach((bill:any) => {
      csvContent += bill.createdDate.toDate().toLocaleString().replace(',',' ')+","+bill.mode+","+bill.table+","+bill.billNo+","+bill.orderNo+","+bill.billing.grandTotal+"\n";
    })
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Bills Report.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
  }
}
export interface ExtendedBillConstructor extends BillConstructor{
  kotVisible:boolean;
  flipped:boolean;
  kotOrBillVisible:'kot'|'bill'|false;
}
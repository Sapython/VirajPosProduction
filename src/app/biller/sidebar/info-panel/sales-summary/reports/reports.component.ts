import { Component, OnInit } from '@angular/core';
import { BillConstructor, KotConstructor, Product, TableConstructor, Tax } from '../../../../../biller/constructors';
import { DatabaseService } from '../../../../../services/database.service';
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataProvider } from '../../../../../provider/data-provider.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  constructor(private databaseService: DatabaseService,private dataProvider:DataProvider) {}
  selectedDate:Date = new Date();

  // Reports
  daySummary = {
    totalBills:0,
    totalAmount:0,
    totalDiscount:0,
    totalTax:0,
    totalKots:0,
    totalProducts:0,
    totalDiscountedBills:0,
    totalDiscountedAmount:0,
    totalNcBills:0,
    totalNcAmount:0,
    totalTakeawayBills:0,
    totalTakeawayAmount:0,
    totalOnlineBills:0,
    totalOnlineAmount:0,
  }
  consolidatedSummary = {
    bills:[],
    totalSubtotal:0,
    totalGrandTotal:0,
    totalTaxes:[],
  }
  maxAmount:number = 0;
  tokenWiseBills:BillConstructor[] = []
  bills:BillConstructor[] = []
  kots:kotReport[] = []
  products:productReport[] = []
  discountedBills:BillConstructor[] = []
  ncBills:BillConstructor[] = []
  takeawayBills:BillConstructor[] = []
  onlineBills:BillConstructor[] = []
  tables:TableConstructor[] = []
  loading:boolean = false;
  reportMode:'billWise'|'kotWise'|'itemWise'|'discounted'|'ncBills'|'takeawayBills'|'onlineBills' | 'daySummary' | 'consolidated' | 'takeawayTokenWise' | 'onlineTokenWise' | 'tableWise' | false = false;
  range = new FormGroup({
    start: new FormControl<Date | null>(new Date(),[Validators.required]),
    end: new FormControl<Date | null>(new Date()),
  });
  ngOnInit(): void {
  }

  getReport(){
    if(this.range.valid){
      if (this.reportMode == 'billWise'){
        this.loading = true;
        this.databaseService.getBillsByDay(this.range.value.start,this.range.value.end).then((bills) => {
          console.log("bills",bills.docs);
          this.bills = bills.docs.map((doc) => {
            return {...doc.data(),id:doc.id} as BillConstructor;
          })
          this.loading = false;
        });
      } else if (this.reportMode == 'kotWise'){
        this.loading = true;
        this.databaseService.getBillsByDay(this.range.value.start,this.range.value.end).then((bills) => {
          let localBills = bills.docs.map((doc) => {
            return {...doc.data(),id:doc.id} as BillConstructor;
          })
          console.log("bills",localBills);
          let kotReport = localBills.map((bill)=>{
            return bill.kots.map((kot)=>{
              return {...kot,billNo:bill.billNo!,tokenNo:bill.orderNo,grandTotal: kot.products.reduce((a, b) => a + (b['price'] || 0), 0)}
            })
          })
          this.kots = kotReport.flat()
          console.log("kotReport",kotReport,);
          this.loading = false;
        });
      } else if (this.reportMode == 'itemWise'){
        this.loading = true;
        this.databaseService.getBillsByDay(this.range.value.start,this.range.value.end).then((bills) => {
          let localBills = bills.docs.map((doc) => {
            return {...doc.data(),id:doc.id} as BillConstructor;
          })
          console.log("bills",localBills);
          let kotReport = localBills.map((bill)=>{
            return bill.kots.map((kot)=>{
              return kot.products.map((product)=>{
                return {...product,billNo:bill.billNo!,kotNo:kot.id,grandTotal: kot.products.reduce((a, b) => a + (b['price'] || 0), 0)}
              })
            })
          })
          let productReport = kotReport.flat().flat()
          console.log("productReport",productReport);
          this.products = productReport.reduce((a, b) => {
            let index = a.findIndex((res)=>res.id == b.id)
            if (index == -1){
              return [...a,{...b,bills:b.billNo,kots:b.kotNo,quantity:1,amount:b.price}]
            } else {
              return [...a.slice(0,index),{...a[index],bills:a[index].bills+','+b.billNo,kots:a[index].kots+','+b.kotNo,quantity:a[index].quantity+1,amount:a[index].amount+b.price},...a.slice(index+1)]
            }
          },[] as productReport[])
          console.log("productReport",this.products);
          this.loading = false;
        });
      } else if (this.reportMode == 'discounted'){
        this.loading = true;
        this.databaseService.getBillsByDay(this.range.value.start,this.range.value.end).then((bills) => {
          this.discountedBills = bills.docs.map((doc) => {
            return {...doc.data(),id:doc.id} as BillConstructor;
          }).filter((res)=>res.billing.discount.length > 0)
          this.loading = false;
        });
      } else if (this.reportMode == 'ncBills'){
        this.loading = true;
        this.databaseService.getBillsByDay(this.range.value.start,this.range.value.end).then((bills) => {
          this.ncBills = bills.docs.map((doc) => {
            return {...doc.data(),id:doc.id} as BillConstructor;
          }).filter((res)=>res.nonChargeableDetail)
          this.loading = false;
        });
      } else if (this.reportMode =='takeawayBills'){
        this.loading = true;
        this.databaseService.getBillsByDay(this.range.value.start,this.range.value.end).then((bills) => {
          this.takeawayBills = bills.docs.map((doc) => {
            return {...doc.data(),id:doc.id} as BillConstructor;
          }).filter((res)=>res.mode=='takeaway')
          this.loading = false;
        });
      } else if (this.reportMode =='onlineBills'){
        this.loading = true;
        this.databaseService.getBillsByDay(this.range.value.start,this.range.value.end).then((bills) => {
          this.onlineBills = bills.docs.map((doc) => {
            return {...doc.data(),id:doc.id} as BillConstructor;
          }).filter((res)=>res.mode=='online')
          this.loading = false;
        });
      } else if (this.reportMode == 'daySummary'){
        this.loading = true;
        this.databaseService.getBillsByDay(this.range.value.start,this.range.value.end).then((bills) => {
          let localBills = bills.docs.map((doc) => {
            return {...doc.data(),id:doc.id} as BillConstructor;
          })
          this.daySummary = {
            totalBills:localBills.length,
            totalAmount:localBills.reduce((acc,res)=>acc + res.billing.grandTotal,0),
            totalDiscount:localBills.reduce((acc,res)=>acc + res.billing.discount.reduce((a, b) => a + (b.totalAppliedDiscount || 0), 0),0),
            totalTax:localBills.reduce((acc,res)=>acc + res.billing.totalTax,0),
            totalKots:localBills.map((res)=>res.kots.length).reduce((a, b) => a + b, 0),
            totalProducts:localBills.map((res)=>res.kots.map((res)=>res.products.length).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0),
            totalDiscountedBills:localBills.filter((res)=>res.billing.discount.length > 0).length,
            totalDiscountedAmount:localBills.filter((res)=>res.billing.discount.length > 0).reduce((acc,res)=>acc + res.billing.grandTotal,0),
            totalNcBills:localBills.filter((res)=>res.nonChargeableDetail).length,
            totalNcAmount:localBills.filter((res)=>res.nonChargeableDetail).reduce((acc,res)=>acc + res.billing.grandTotal,0),
            totalTakeawayBills:localBills.filter((res)=>res.mode=='takeaway').length,
            totalTakeawayAmount:localBills.filter((res)=>res.mode=='takeaway').reduce((acc,res)=>acc + res.billing.grandTotal,0),
            totalOnlineBills:localBills.filter((res)=>res.mode=='online').length,
            totalOnlineAmount:localBills.filter((res)=>res.mode=='online').reduce((acc,res)=>acc + res.billing.grandTotal,0),
          }
          this.loading = false;
        });
  
      } else if (this.reportMode == 'consolidated'){
        this.loading = true;
        this.databaseService.getBillsByDay(this.range.value.start,this.range.value.end).then((bills) => {
          let localBills = bills.docs.map((doc) => {
            return {...doc.data(),id:doc.id} as BillConstructor;
          })
          console.log("bills local",localBills);
          let filteredLocalBills = localBills.filter((res)=>res.settlement && res.billing.grandTotal < this.maxAmount && res.billing.grandTotal > 0)
          console.log("bills",filteredLocalBills);
          let taxes:Tax[] = []
          filteredLocalBills.forEach((bill)=>{
            bill.billing.taxes.forEach((tax)=>{
              let index = taxes.findIndex((res)=>res.id == tax.id)
              if (index == -1){
                taxes.push(JSON.parse(JSON.stringify(tax)))
              } else {
                console.log("Adding tax",taxes[index].amount,tax.amount,taxes[index].amount + tax.amount);
                taxes[index].amount = taxes[index].amount + tax.amount
              }
            })
          })
          this.consolidatedSummary = {
            bills:filteredLocalBills,
            totalSubtotal:filteredLocalBills.reduce((acc,res)=>acc + res.billing.subTotal,0),
            totalGrandTotal:filteredLocalBills.reduce((acc,res)=>acc + res.billing.grandTotal,0),
            totalTaxes:taxes,
          }
          this.loading = false;
        });
      } else if (this.reportMode == 'takeawayTokenWise'){
        this.loading = true;
        this.databaseService.getBillsByDay(this.range.value.start,this.range.value.end).then((bills) => {
          let localBills = bills.docs.map((doc) => {
            return {...doc.data(),id:doc.id} as BillConstructor;
          })
          console.log("bills local",localBills);
          let filteredLocalBills = localBills.filter((res)=>res.settlement && res.mode == 'takeaway')
          console.log("bills",filteredLocalBills);
          let taxes:Tax[] = []
          filteredLocalBills.forEach((bill)=>{
            bill.billing.taxes.forEach((tax)=>{
              let index = taxes.findIndex((res)=>res.id == tax.id)
              if (index == -1){
                taxes.push(JSON.parse(JSON.stringify(tax)))
              } else {
                console.log("Adding tax",taxes[index].amount,tax.amount,taxes[index].amount + tax.amount);
                taxes[index].amount = taxes[index].amount + tax.amount
              }
            })
          })
          this.tokenWiseBills = filteredLocalBills;
          this.loading = false;
        });
      } else {
        this.reportMode = false
      }
    } else {
      alert("Please select a valid date range")
    }
  }

  downloadExcel() {
    let separator = ','
    // Select rows from table_id
    var rows = document.querySelectorAll('table#report-table tr');
    // Construct csv
    let baseData = ['Date:',(new Date()).toLocaleString(),'User Id:',this.dataProvider.currentUser.username,'User Name:',this.dataProvider.currentBusiness.email]
    var csv = [baseData.join(separator)];
    for (var i = 0; i < rows.length; i++) {
        var row = [], cols:any = rows[i].querySelectorAll('td, th');
        for (var j = 0; j < cols.length; j++) {
            // Clean innertext to remove multiple spaces and jumpline (break csv)
            var data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ')
            // Escape double-quote with double-double-quote (see https://stackoverflow.com/questions/17808511/properly-escape-a-double-quote-in-csv)
            data = data.replace(/"/g, '""');
            // Push escaped string
            row.push('"' + data + '"');
        }
        csv.push(row.join(separator));
    }
    var csv_string = csv.join('\n');
    // Download it
    var filename = 'export_report-table_' + new Date().toLocaleString() + '.csv';
    var link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadPdf(){
    const doc = new jsPDF()
    let title = ""
    if(this.reportMode == 'daySummary'){
      title = "Day Summary"
    } else if(this.reportMode == 'billWise'){
      title = "Bill Wise"
    } else if(this.reportMode == 'kotWise'){
      title = "Kot Wise"
    } else if(this.reportMode == 'itemWise'){
      title = "Item Wise"
    } else if(this.reportMode == 'discounted'){
      title = "Dicounted Bills"
    } else if(this.reportMode == 'ncBills'){
      title = "Non Chargebale Bills"
    } else if(this.reportMode == 'takeawayBills'){
      title = "Takeaway Bills"
    } else if(this.reportMode == 'onlineBills'){
      title = "Online Bills"
    } else if (this.reportMode == 'consolidated'){
      title = "Consolidated Report"
    } else if (this.reportMode == 'takeawayTokenWise'){
      title = "Takeaway Token Wise"
    }
    let logo = new Image()
    logo.src = 'assets/viraj.png'
    doc.addImage(logo, 'JPEG', 10, 10, 30.5, 17.5)
    doc.setFontSize(25);
    doc.text('Viraj', 40, 23)
    doc.line(10, 30, 200, 30)
    doc.setFontSize(18);
    // doc.text(title +' Report', 10, 40)
    autoTable(doc, {
      body: [
        [{ content: title +' Report' , styles: { halign: 'left',fontSize:17 } },{ content: this.selectedDate.toLocaleString(), styles: { halign: 'right',fontSize:17 } }],
      ],
      theme:'plain',
      startY: 40,
    })
    doc.setFontSize(13);
    let y;
    if (this.reportMode == 'consolidated'){
      autoTable(doc, { html: '#consolidatedTable', startY: 55, didDrawPage: function (data) {
        y = data.cursor.y
      }})
    }
    autoTable(doc, { html: '#report-table', startY: y+10 })
    doc.save(this.reportMode+((new Date()).toLocaleString())+'.pdf')
  }

  joinArray(bill:KotConstructor[]){
    // join to form a string of ids with comma
    return bill.map((res)=>res.id).join(',')
  }

  export(){
    const doc = new jsPDF()
    autoTable(doc, { html: '#my-table' })

  }
}
interface kotReport extends KotConstructor {billNo:string,grandTotal:number,tokenNo:string}
interface productReport extends Product {bills:string,kots:string,quantity:number,amount:number}
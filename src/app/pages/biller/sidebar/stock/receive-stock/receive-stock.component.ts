import { Dialog } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ConfirmDialogComponent } from '../../../../../shared/helpers/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-receive-stock',
  templateUrl: './receive-stock.component.html',
  styleUrls: ['./receive-stock.component.scss']
})
export class ReceiveStockComponent {
  items:{
    name:string,
    price:number,
    openingBalance:number,
    closingBalance:number,
    issued:number,
    unit:string,
  }[] = [
    {
      name:'Rice',
      price: 100,
      openingBalance: 100,
      closingBalance: 100,
      issued: 0,
      unit: 'kg'
    },
    {
      name:'Wheat',
      price: 100,
      openingBalance: 100,
      closingBalance: 100,
      issued: 0,
      unit: 'kg'
    },
    {
      name:'Gram',
      price: 100,
      openingBalance: 100,
      closingBalance: 100,
      issued: 0,
      unit: 'kg'
    },
  ]
  requests:Request[] = [
    {
      id:'1234567',
      title:'Rice',
      party:'Rice Mill',
      amount: 100,
      description:'Rice for the month of June',
      approved: false
    },
    {
      id:'123456',
      title:'Rice',
      party:'Rice Mill',
      amount: 100,
      description:'Rice for the month of June',
      approved: false
    },
    {
      id:'123457',
      title:'Rice',
      party:'Rice Mill',
      amount: 100,
      description:'Rice for the month of June',
      approved: false
    },
  ];
  activeTab:number = 0;
  mode:'pending'|'approved'|'list' = 'list'
  currentRequest:Request|null = null;
  recevingForm:FormGroup = new FormGroup({
    title:new FormControl(),
    party:new FormControl(),
    amount:new FormControl(),
    description:new FormControl(),
  })

  constructor(private dialog:Dialog) { }
  get totalUnapproved(){
    return this.requests.filter((item)=>!item.approved).length;
  }

  get totalApproved(){
    return this.requests.filter((item)=>item.approved).length;
  }

  openPending(request:Request){
    this.mode = 'pending';
    this.recevingForm.reset();
    this.currentRequest = request;
    this.recevingForm.patchValue(request)
  }

  openApproved(request:Request){
    this.mode = 'approved';
    this.currentRequest = request;
    this.recevingForm.reset();
    this.recevingForm.patchValue(request)
  }

  submit(){
    if (this.mode=='pending'){
      const dialog = this.dialog.open(ConfirmDialogComponent,{data:{
        title:'Confirm',
        message:'Are you sure you want to approve this request?',
        buttons:['No','Yes']
      }})
      dialog.closed.subscribe((result)=>{
        if (result){
          this.requests = this.requests.map((item)=>{
          //  console.log("item.id",item.id,"this.recevingForm.value.id",this.recevingForm.value.ids);
            if (item.id==this.currentRequest?.id){
              return {...item,approved:true}
            }
            return item;
          })
          this.mode = 'list';
        } else {
          this.mode = 'list';
        }
      })
    }
  }
}

export interface Request {id:string,title:string,party:string,amount:number,description:string,approved:boolean}
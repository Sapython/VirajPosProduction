import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, getDocs } from '@firebase/firestore';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { TableConstructor } from '../biller/constructors';
import { Table } from "../biller/Table";
import { DataProvider } from '../provider/data-provider.service';
import { DatabaseService } from './database.service';
import { PrintingService } from './printing.service';

@Injectable({
  providedIn: 'root'
})
export class GetDataService {

  constructor(private dataProvider:DataProvider,private firestore:Firestore,private dbService:NgxIndexedDBService,private databaseService:DatabaseService,private printingService:PrintingService) {
    // dbService.getAll('tables').subscribe((res:any)=>{
    //   if (res.length > 0){
    //     this.dataProvider.tables = res;
    //   }
    //   console.log("res.tables ",res);
    // },(err)=>{
    //   console.log("Error ",err);
    // })
    // this.getTables();
    // this.getTokens();
    // this.getOnlineTokens();
  }

  async getTables(){
    getDocs(collection(this.firestore,'business/'+this.dataProvider.businessId+'/tables')).then(async (res)=>{
      if (res.docs.length > 0){
        let tables = res.docs.map(async (doc)=>{
          let table =  {...doc.data(),id:doc.id} as TableConstructor
          // let tableClass = new Table(table.id,Number(table.tableNo),table.name,table.maxOccupancy,table.type,this.dataProvider,this.databaseService)
          // tableClass.fromObject(table);
          return await Table.fromObject(table,this.dataProvider,this.databaseService,this.printingService);
        })
        console.log("tables ",tables);
        // add data to indexedDB
        let formedTable = await Promise.all(tables);
        formedTable.forEach((table)=>{
          this.dbService.getAll('tables').subscribe((res)=>{
            if (res.length >0 ){
              this.dbService.update('tables',table.toObject()).subscribe((res)=>{
                console.log("adding table res ",res);
              },(err)=>{
                console.log("adding table Error ",err);
              })
            } else {
              this.dbService.add('tables',table.toObject()).subscribe((res)=>{
                console.log("adding table res ",res);
              },(err)=>{
                console.log("adding table Error ",err);
              })
            }
          })
        })
        // sort tables by tableNo
        formedTable.sort((a,b)=>{
          return a.tableNo - b.tableNo;
        })
        this.dataProvider.tables = formedTable;
      } else {
        if (this.dataProvider.tables.length == 0 && res.docs.length == 0){
          this.dataProvider.tables = [];
        }
      }
    }).catch((err)=>{
      console.log("Table fetch Error ",err);
    })
  }

  async getTokens(){
    getDocs(collection(this.firestore,'business/'+this.dataProvider.businessId+'/tokens')).then(async (res)=>{
      let tables = res.docs.map(async (doc)=>{
        let table =  {...doc.data(),id:doc.id} as TableConstructor
        // let tableClass = new Table(table.id,Number(table.tableNo),table.name,table.maxOccupancy,'token',this.dataProvider,this.databaseService)
        // tableClass.fromObject(table);
        return await Table.fromObject(table,this.dataProvider,this.databaseService,this.printingService);
      })
      let formedTable = await Promise.all(tables);
      formedTable.sort((a,b)=>{
        return a.tableNo - b.tableNo;
      })
      this.dataProvider.tokens = formedTable;
    })
  }

  async getOnlineTokens(){
    getDocs(collection(this.firestore,'business/'+this.dataProvider.businessId+'/onlineTokens')).then(async (res)=>{
      let tables = res.docs.map(async (doc)=>{
        let table =  {...doc.data(),id:doc.id} as TableConstructor
        let tableClass = await Table.fromObject(table,this.dataProvider,this.databaseService,this.printingService)
        console.log("ONLINE TABLE",tableClass);
        return tableClass;
      })
      let formedTable = await Promise.all(tables);
      formedTable.sort((a,b)=>{
        return a.tableNo - b.tableNo;
      })
      this.dataProvider.onlineTokens = formedTable;
    })
  }
}

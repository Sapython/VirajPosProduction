import { Injectable } from '@angular/core';
import { TableConstructor } from '../../../../types/table.structure';
import {
  setDoc,
  doc,
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  docData,
  Firestore,
} from '@angular/fire/firestore';
import { DataProvider } from '../../provider/data-provider.service';
import { Table } from '../../../constructors/table/Table';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  constructor(
    private firestore: Firestore,
    private dataProvider: DataProvider
  ) {}
  addTables(tables: TableConstructor[], businessId: string) {
    return Promise.all(
      tables.map((table) => {
        return setDoc(
          doc(this.firestore, 'business/' + businessId + '/tables', table.id),
          table
        );
      })
    );
  }
  addTable(table: TableConstructor) {
    return addDoc(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/tables'
      ),
      table
    );
  }
  updateTable(table: any) {
    return setDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/tables',
        table.id
      ),
      table,
      { merge: true }
    );
  }
  deleteTable(id: string) {
    return deleteDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/tables',
        id
      )
    );
  }
  getTables() {
    return getDocs(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/tables'
      )
    );
  }

  getTable(tableId: string, type: 'tables' | 'tokens' | 'onlineTokens') {
    return docData(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/' + type,
        tableId
      )
    );
  }

  setOrder(table:Table[],groupName:string){
    return setDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings',
      ),
      {
        tableOrders:{
          [groupName]:table.map((table)=>table.id)
        }
      },
      {
        merge:true
      }
    )
  }

  setGroupOrder(table:{tables:Table[],id:string}[]){
    return setDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings',
      ),
      {
        groupOrders: table.map((group)=>group.id)
      },
      {
        merge:true
      }
    )
  }

  reOrderTable(){
    let groupedTables = []
      this.dataProvider.tables.forEach((r) => {
        let tableGroup = groupedTables.find(
          (group) => group.name == r.name.split(' ')[0]
        );
        if (tableGroup) {
          tableGroup.tables.push(r);
        } else {
          groupedTables.push({
            name: r.name.split(' ')[0],
            tables: [r],
          });
        }
      });
      this.dataProvider.groupedTables.forEach((group) => {
        // sort tables by order or by name
        group.tables.sort((a, b) => {
          if (a.order!=undefined && b.order!=undefined){
            return a.order - b.order;
          } else {
            return a.name.localeCompare(b.name);
          }
        });
      })
      this.dataProvider.groupedTables = groupedTables;
  }
}

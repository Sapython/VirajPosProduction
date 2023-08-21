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
  Timestamp,
  getDoc,
} from '@angular/fire/firestore';
import { DataProvider } from '../../provider/data-provider.service';
import { Table } from '../../../constructors/table/Table';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  constructor(
    private firestore: Firestore,
    private dataProvider: DataProvider,
  ) {}
  addTables(tables: TableConstructor[], businessId: string) {
    return Promise.all(
      tables.map((table) => {
        return setDoc(
          doc(this.firestore, 'business/' + businessId + '/tables', table.id),
          table,
        );
      }),
    );
  }
  addTable(table: TableConstructor) {
    return addDoc(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/tables',
      ),
      table,
    );
  }
  updateTable(table: any) {
    return setDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/tables',
        table.id,
      ),
      table,
      { merge: true },
    );
  }
  deleteTable(id: string) {
    return deleteDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/tables',
        id,
      ),
    );
  }
  getTables() {
    return getDocs(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/tables',
      ),
    );
  }

  getTablePromise(tableId: string, type: 'tables' | 'tokens' | 'onlineTokens'){
    return getDoc(doc(
      this.firestore,
      'business/' + this.dataProvider.businessId + '/' + type,
      tableId,
      )
    );
  }

  getTable(tableId: string, type: 'tables' | 'tokens' | 'onlineTokens') {
    return docData(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/' + type,
        tableId,
      ),
    );
  }

  setOrder(table: Table[], groupName: string) {
    return setDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings',
      ),
      {
        tableOrders: {
          [groupName]: table.map((table) => table.id),
        },
      },
      {
        merge: true,
      },
    );
  }

  setGroupOrder(table: { tables: Table[]; id: string }[]) {
    return setDoc(
      doc(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/settings/settings',
      ),
      {
        groupOrders: table.map((group) => group.id),
      },
      {
        merge: true,
      },
    );
  }

  reOrderTable() {
    let groupedTables = [];
    this.dataProvider.tables.forEach((r) => {
      let tableGroup = groupedTables.find((group) => group.name == r.group);
      if (tableGroup) {
        tableGroup.tables.push(r);
      } else {
        groupedTables.push({
          name: r.group,
          tables: [r],
        });
      }
    });
    groupedTables.forEach((group) => {
      // sort tables by order or by name
      group.tables.sort((a, b) => {
        if (a.order != undefined && b.order != undefined) {
          return a.order - b.order;
        } else {
          return a.name.localeCompare(b.name);
        }
      });
    });
    // there exists a table settings groupOrders with the order of groups like ["od","indoor"]
    if (this.dataProvider.currentSettings?.groupOrders) {
      // reorder the groupedTables using the array using that group orders
      console.log("Grouped orders",this.dataProvider.groupedTables,this.dataProvider.currentSettings?.groupOrders);
      groupedTables.sort((a, b) => {
        return (
          this.dataProvider.currentSettings?.groupOrders.indexOf(a.name) -
          this.dataProvider.currentSettings?.groupOrders.indexOf(b.name)
        );
      });
    }
    this.dataProvider.groupedTables = groupedTables;
  }

  editSection(prevGroupname: string, newGroupName: string) {
    return Promise.all(
      this.dataProvider.tables
        .filter((table) => table.group == prevGroupname)
        .map(async (table) => {
          table.group = newGroupName;
          // remove group name from table name
          return await this.updateTable({
            ...table.toObject(),
          });
        }),
    );
  }

  deleteSection(groupName: string) {
    return Promise.all(
      this.dataProvider.tables
        .filter((table) => table.group == groupName)
        .map(async (table) => {
          return await this.deleteTable(table.id);
        }),
    );
  }

  addTableActivity(activity: TableActivity) {
    return addDoc(
      collection(
        this.firestore,
        'business/' + this.dataProvider.businessId + '/tableActivity',
      ),
      activity,
    );
  }
}

export interface TableActivity {
  time: Timestamp | any;
  from: any;
  to: any;
  items?: any[];
  type: 'move' | 'merge' | 'exchange';
}

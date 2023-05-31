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
}

import { BrowserModule } from '@angular/platform-browser';
import {
  APP_INITIALIZER,
  ErrorHandler,
  NgModule,
  isDevMode,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import {
  BrowserAnimationsModule,
  provideNoopAnimations,
} from '@angular/platform-browser/animations';
import { FirebaseApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { APP_CONFIG } from '../environments/environment';
import { DBConfig, NgxIndexedDBModule } from 'ngx-indexed-db';
import {
  provideAnalytics,
  getAnalytics,
  ScreenTrackingService,
  UserTrackingService,
} from '@angular/fire/analytics';
import {
  provideAuth,
  getAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  connectAuthEmulator,
} from '@angular/fire/auth';
import {
  provideFirestore,
  getFirestore,
  enableMultiTabIndexedDbPersistence,
  enableIndexedDbPersistence,
  connectFirestoreEmulator,
  initializeFirestore,
} from '@angular/fire/firestore';
import { providePerformance, getPerformance } from '@angular/fire/performance';
import {
  provideStorage,
  getStorage,
  connectStorageEmulator,
} from '@angular/fire/storage';
import { DialogModule } from '@angular/cdk/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BaseComponentsModule } from './shared/base-components/base-components.module';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { AlertsAndNotificationsService } from './core/services/alerts-and-notification/alerts-and-notifications.service';

import * as Sentry from '@sentry/angular-ivy';
import { Router } from '@angular/router';
import {
  connectFunctionsEmulator,
  getFunctions,
  provideFunctions,
} from '@angular/fire/functions';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { MatIconModule } from '@angular/material/icon';
import { CheckingPasswordComponent } from './shared/checking-password/checking-password.component';
import { RequiresPrivilegeComponent } from './shared/requires-privilege/requires-privilege.component';
import { BillerModule } from './pages/biller/biller.module';
import { LoadingModule } from './pages/auth/loading/loading.module';
import { AuthService } from './core/services/auth/auth.service';
import { CustomerService } from './core/services/customer/customer.service';
import { MenuManagementService } from './core/services/database/menuManagement/menu-management.service';
import { AnalyticsService } from './core/services/database/analytics/analytics.service';
import { BillService } from './core/services/database/bill/bill.service';
import { CategoryService } from './core/services/database/category/category.service';
import { FileStorageService } from './core/services/database/fileStorage/file-storage.service';
import { HistoryService } from './core/services/database/history/history.service';
import { ProductsService } from './core/services/database/products/products.service';
import { ReportsService } from './core/services/database/reports/reports.service';
import { SearchService } from './core/services/database/search/search.service';
import { SettingsService } from './core/services/database/settings/settings.service';
import { SystemService } from './core/services/database/system/system.service';
import { TableService } from './core/services/database/table/table.service';
import { ElectronService } from './core/services/electron/electron.service';
import { PrinterService } from './core/services/printing/printer/printer.service';

var FirebaseAppInstance:FirebaseApp|undefined;

// AoT requires an exported function for factories
export const dbConfig: DBConfig = {
  name: 'Viraj',
  version: 23,
  objectStoresMeta: [
    {
      store: 'business',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'userId', keypath: 'userId', options: { unique: false } },
        { name: 'email', keypath: 'email', options: { unique: false } },
        {
          name: 'businessId',
          keypath: 'businessId',
          options: { unique: false },
        },
        { name: 'access', keypath: 'access', options: { unique: false } },
      ],
    },
    {
      store: 'device',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'deviceId', keypath: 'deviceId', options: { unique: true } },
      ],
    },
    {
      store: 'menu',
      storeConfig: { keyPath: 'menuId', autoIncrement: false },
      storeSchema: [
        { name: 'menuId', keypath: 'menuId', options: { unique: false } },
        { name: 'menu', keypath: 'menu', options: { unique: false } },
        { name: 'products', keypath: 'products', options: { unique: false } },
        {name: 'rootCategories',keypath: 'rootCategories',options: { unique: false }},
        {name: 'viewCategories',keypath: 'viewCategories',options: { unique: false }},
        {name: 'recommendedCategories',keypath: 'recommendedCategories',options: { unique: false }},
        {name:'printerSettings',keypath:'printerSettings',options:{unique:false}},
        {name:'defaultPrinters',keypath:'defaultPrinters',options:{unique:false}}
      ],
    },
    {
      store: 'config',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'id', keypath: 'id', options: { unique: true } },
        { name: 'config', keypath: 'config', options: { unique: false } },
        {
          name: 'customerDbVersion',
          keypath: 'customerDbVersion',
          options: { unique: true },
        },
      ],
    },
    {
      store: 'customers',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'id', keypath: 'customerId', options: { unique: true } },
        { name: 'name', keypath: 'customer', options: { unique: false } },
        { name: 'phone', keypath: 'phone', options: { unique: false } },
        { name: 'address', keypath: 'address', options: { unique: false } },
        { name: 'gst', keypath: 'gst', options: { unique: false } },
        {
          name: 'loyaltyPoints',
          keypath: 'loyaltyPoints',
          options: { unique: false },
        },
        { name: 'lastOrder', keypath: 'lastOrder', options: { unique: false } },
        {
          name: 'lastOrderDate',
          keypath: 'lastOrderDate',
          options: { unique: false },
        },
        {
          name: 'lastOrderDish',
          keypath: 'lastOrderDish',
          options: { unique: false },
        },
        {
          name: 'orderFrequency',
          keypath: 'orderFrequency',
          options: { unique: false },
        },
        {
          name: 'averageOrderPrice',
          keypath: 'averageOrderPrice',
          options: { unique: false },
        },
        { name: 'lastMonth', keypath: 'lastMonth', options: { unique: false } },
      ],
    },
  ],
};

@NgModule({
  declarations: [
    AppComponent,
    ResetPasswordComponent,
    CheckingPasswordComponent,
    RequiresPrivilegeComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    MatSnackBarModule,
    BaseComponentsModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatNativeDateModule,
    DialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    LoadingModule,
    BillerModule,
    BrowserAnimationsModule,
    provideFirebaseApp(() => {
      FirebaseAppInstance = initializeApp(APP_CONFIG.firebase);
      return FirebaseAppInstance;
    }),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => {
      let auth = getAuth();
      // connectAuthEmulator(auth, 'http://127.0.0.1:9099');
      // auth.setPersistence(browserLocalPersistence);
      return auth;
    }),
    provideFirestore(() => {
      // let fsApp = getFirestore();
      let fs = initializeFirestore(FirebaseAppInstance,{ignoreUndefinedProperties:true});
      // connectFirestoreEmulator(fs, '127.0.0.1', 8080);
      return fs;
    }),
    providePerformance(() => getPerformance()),
    provideStorage(() => {
      let storageRef = getStorage();
      // connectStorageEmulator(storageRef, 'localhost', 9199);
      return storageRef;
    }),
    provideFunctions(() => {
      let functions = getFunctions();
      // connectFunctionsEmulator(functions, 'localhost', 5001);
      return functions;
    }),
    providePerformance(() => {
      return getPerformance();
    }),
  ],
  providers: [
    PrinterService,
    ScreenTrackingService,
    UserTrackingService,
    AlertsAndNotificationsService,
    ElectronService,
    AuthService,
    CustomerService,
    MenuManagementService,
    AnalyticsService,
    BillService,
    CategoryService,
    FileStorageService,
    HistoryService,
    MenuManagementService,
    ProductsService,
    ReportsService,
    SearchService,
    SettingsService,
    SystemService,
    TableService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

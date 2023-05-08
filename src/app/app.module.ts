import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { HomeModule } from './home/home.module';
import { DetailModule } from './detail/detail.module';

import { AppComponent } from './app.component';
import { DialogModule } from '@angular/cdk/dialog';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideFunctions, getFunctions } from '@angular/fire/functions';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { providePerformance, getPerformance } from '@angular/fire/performance';
import {
  provideRemoteConfig,
  getRemoteConfig,
} from '@angular/fire/remote-config';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DBConfig, NgxIndexedDBModule } from 'ngx-indexed-db';
import { BaseComponentsModule } from './base-components/base-components.module';
import { DataProvider } from './provider/data-provider.service';
import { AlertsAndNotificationsService } from './services/alerts-and-notification/alerts-and-notifications.service';
import { AuthService } from './services/auth.service';
import { DatabaseService } from './services/database.service';
import { GetDataService } from './services/get-data.service';
import {
  provideAnalytics,
  getAnalytics,
  ScreenTrackingService,
  UserTrackingService,
} from '@angular/fire/analytics';
import { APP_CONFIG } from '../environments/environment';
// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>  new TranslateHttpLoader(http, './assets/i18n/', '.json');

const dbConfig: DBConfig = {
  name: 'Viraj',
  version: 2,
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
      store:'device',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'deviceId', keypath: 'deviceId', options: { unique: true } },
      ]
    },
    {
      // for TableConstructor
      store: 'tables',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'id', keypath: 'id', options: { unique: false } },
        { name: 'tableNo', keypath: 'tableNo', options: { unique: false } },
        { name: 'bill', keypath: 'bill', options: { unique: false } },
        { name: 'maxOccupancy', keypath: 'maxOccupancy', options: { unique: false } },
        { name: 'name', keypath: 'name', options: { unique: false } },
        { name: 'occupiedStart', keypath: 'occupiedStart', options: { unique: false } },
        { name: 'billPrice', keypath: 'billPrice', options: { unique: false } },
        { name: 'status', keypath: 'status', options: { unique: false } },
        { name: 'type', keypath: 'type', options: { unique: false } },
      ]
    },
    {
      store: 'categories',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'id', keypath: 'id', options: { unique: true } },
        { name: 'name', keypath: 'name', options: { unique: false } },
        { name: 'products', keypath: 'products', options: { unique: false } },
        { name: 'averagePrice', keypath: 'averagePrice', options: { unique: false } },
      ]
    },
    {
      store: 'recommendedCategories',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'id', keypath: 'id', options: { unique: true } },
        { name: 'name', keypath: 'name', options: { unique: false } },
        { name: 'products', keypath: 'products', options: { unique: false } },
        { name: 'averagePrice', keypath: 'averagePrice', options: { unique: false } },
      ]
    },
  ],
};
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    AppRoutingModule,
    AppRoutingModule,
    SharedModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSliderModule,
    MatButtonModule,
    provideFirebaseApp(() => initializeApp(APP_CONFIG.firebase)),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideMessaging(() => getMessaging()),
    providePerformance(() => getPerformance()),
    provideRemoteConfig(() => getRemoteConfig()),
    provideStorage(() => getStorage()),
    NgxIndexedDBModule.forRoot(dbConfig),
    MatSnackBarModule,
    BaseComponentsModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatNativeDateModule,
    DialogModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    DataProvider,
    AuthService,
    ScreenTrackingService,
    UserTrackingService,
    DatabaseService,
    AlertsAndNotificationsService,
    GetDataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

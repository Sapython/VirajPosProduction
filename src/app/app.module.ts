import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, ErrorHandler, NgModule, isDevMode } from '@angular/core';
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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { APP_CONFIG } from '../environments/environment';
import { DBConfig, NgxIndexedDBModule } from 'ngx-indexed-db';
import {
  provideAnalytics,
  getAnalytics,
  ScreenTrackingService,
  UserTrackingService,
} from '@angular/fire/analytics';
import { provideAuth, getAuth, indexedDBLocalPersistence, browserLocalPersistence, connectAuthEmulator } from '@angular/fire/auth';
import { provideFirestore, getFirestore, enableMultiTabIndexedDbPersistence, enableIndexedDbPersistence, connectFirestoreEmulator } from '@angular/fire/firestore';
import { providePerformance, getPerformance } from '@angular/fire/performance';
import { provideStorage, getStorage, connectStorageEmulator } from '@angular/fire/storage';
import { DialogModule } from '@angular/cdk/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BaseComponentsModule } from './base-components/base-components.module';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { DataProvider } from './provider/data-provider.service';
import { AuthService } from './services/auth.service';
import { AlertsAndNotificationsService } from './services/alerts-and-notification/alerts-and-notifications.service';
import { GetDataService } from './services/get-data.service';
import { OnboardingService } from './onboarding.service';
import { PrintingService } from './services/printing.service';

import * as Sentry from "@sentry/angular-ivy";
import { Router } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';

// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, './assets/i18n/', '.json');
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
      store: 'device',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'deviceId', keypath: 'deviceId', options: { unique: true } },
      ],
    },
    {
      // for TableConstructor
      store: 'tables',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'id', keypath: 'id', options: { unique: false } },
        { name: 'tableNo', keypath: 'tableNo', options: { unique: false } },
        { name: 'bill', keypath: 'bill', options: { unique: false } },
        {
          name: 'maxOccupancy',
          keypath: 'maxOccupancy',
          options: { unique: false },
        },
        { name: 'name', keypath: 'name', options: { unique: false } },
        {
          name: 'occupiedStart',
          keypath: 'occupiedStart',
          options: { unique: false },
        },
        { name: 'billPrice', keypath: 'billPrice', options: { unique: false } },
        { name: 'status', keypath: 'status', options: { unique: false } },
        { name: 'type', keypath: 'type', options: { unique: false } },
      ],
    },
    {
      store: 'categories',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'id', keypath: 'id', options: { unique: true } },
        { name: 'name', keypath: 'name', options: { unique: false } },
        { name: 'products', keypath: 'products', options: { unique: false } },
        {
          name: 'averagePrice',
          keypath: 'averagePrice',
          options: { unique: false },
        },
      ],
    },
    {
      store: 'recommendedCategories',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'id', keypath: 'id', options: { unique: true } },
        { name: 'name', keypath: 'name', options: { unique: false } },
        { name: 'products', keypath: 'products', options: { unique: false } },
        {
          name: 'averagePrice',
          keypath: 'averagePrice',
          options: { unique: false },
        },
      ],
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
    // SharedModule,
    // HomeModule,
    DetailModule,
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
    NgxIndexedDBModule.forRoot(dbConfig),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    BrowserAnimationsModule,
    provideFirebaseApp(() => initializeApp(APP_CONFIG.firebase)),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => {
      let auth = getAuth();
      // connectAuthEmulator(auth, 'http://127.0.0.1:9099');
      // auth.setPersistence(browserLocalPersistence);
      return auth;
    }),
    provideFirestore(() => {
      let fs = getFirestore();
      // connectFirestoreEmulator(fs, '127.0.0.1', 8080);
      return fs
    }),
    providePerformance(() => getPerformance()),
    provideStorage(() => {
      let storageRef = getStorage();
      // connectStorageEmulator(storageRef, 'localhost', 9199);
      return storageRef;
    }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideFunctions(() => {
      let functions = getFunctions();
      // useEmulator('localhost', 5001);
      connectFunctionsEmulator(functions, 'localhost', 5001);
      return functions;
    })
  ],
  providers: [
    ScreenTrackingService,
    UserTrackingService,
    DataProvider,
    AuthService,
    AlertsAndNotificationsService,
    GetDataService,
    OnboardingService,
    PrintingService,
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: true,
      }),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

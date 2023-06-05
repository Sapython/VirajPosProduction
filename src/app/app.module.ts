import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, ErrorHandler, NgModule, isDevMode } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule, provideNoopAnimations } from '@angular/platform-browser/animations';
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
import { BaseComponentsModule } from './shared/base-components/base-components.module';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';

import { AlertsAndNotificationsService } from './core/services/alerts-and-notification/alerts-and-notifications.service';

import * as Sentry from "@sentry/angular-ivy";
import { Router } from '@angular/router';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { MatIconModule } from '@angular/material/icon';
import { CheckingPasswordComponent } from './shared/checking-password/checking-password.component';
import { RequiresPrivilegeComponent } from './shared/requires-privilege/requires-privilege.component';
import { BillerModule } from './pages/biller/biller.module';
import { LoadingModule } from './pages/auth/loading/loading.module';

// AoT requires an exported function for factories
export const dbConfig: DBConfig = {
  name: 'Viraj',
  version: 10,
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
      store:'menu',
      storeConfig:{keyPath:'menuId',autoIncrement:false},
      storeSchema:[
        {name:'menuId',keypath:'menuId',options:{unique:false}},
        {name:'menu',keypath:'menu',options:{unique:false}},
        {name:'products',keypath:'products',options:{unique:false}},
        {name:'rootCategories',keypath:'rootCategories',options:{unique:false}},
        {name:'viewCategories',keypath:'viewCategories',options:{unique:false}},
        {name:'recommendedCategories',keypath:'recommendedCategories',options:{unique:false}},
      ]
    },
    {
      store:'config',
      storeConfig:{keyPath:'id',autoIncrement:true},
      storeSchema:[
        {name:'id',keypath:'id',options:{unique:true}},
        {name:'config',keypath:'config',options:{unique:false}},
      ]
    }
  ],
};

@NgModule({
  declarations: [AppComponent, ResetPasswordComponent, CheckingPasswordComponent, RequiresPrivilegeComponent],
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
    ScreenTrackingService,
    UserTrackingService,
    AlertsAndNotificationsService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

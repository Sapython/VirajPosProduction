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
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSliderModule,
    MatButtonModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
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
    DialogModule
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

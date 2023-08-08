# Modules

## Modules in workspace

| Module | Declarations | Imports | Exports | Bootstrap | Providers | Entry points |
| ---| --- | --- | --- | --- | --- | --- |
| ActionsModule | 6 | 16 | 1 | 0 | 0 | 0 |
| ActiveKotModule | 12 | 10 | 3 | 0 | 0 | 0 |
| AppRoutingModule | 0 | 1 | 1 | 0 | 0 | 0 |
| AppModule | 4 | 29 | 0 | 1 | 3 | 0 |
| BaseComponentsModule | 5 | 7 | 4 | 0 | 0 | 0 |
| BillerRoutingModule | 0 | 1 | 1 | 0 | 0 | 0 |
| BillerModule | 21 | 27 | 0 | 0 | 0 | 0 |
| EmergencyModule | 7 | 4 | 1 | 0 | 0 | 0 |
| HelpersModule | 1 | 3 | 0 | 0 | 0 | 0 |
| LoadingRoutingModule | 0 | 1 | 1 | 0 | 0 | 0 |
| LoadingModule | 1 | 15 | 0 | 0 | 0 | 0 |
| PopoverModule | 2 | 2 | 2 | 0 | 2 | 0 |
| ProductsPanelModule | 2 | 7 | 2 | 0 | 0 | 0 |
| RecommendedModule | 1 | 2 | 1 | 0 | 0 | 0 |
| SearchPanelModule | 1 | 7 | 1 | 0 | 0 | 0 |
| SidebarModule | 32 | 27 | 4 | 0 | 0 | 0 |
| SystemModule | 4 | 12 | 1 | 0 | 0 | 0 |
| TableModule | 1 | 9 | 0 | 0 | 0 | 0 |

## ActionsModule

Filename: /Users/sapython/Documents/GitHub/VrajeraPosProduction/src/app/pages/biller/actions/actions.module.ts

| Section | Classes, service, modules |
| ---- |:-----------|
| Declarations | ActionsComponent,<br>AddDiscountComponent,<br>CancelComponent,<br>NonChargeableComponent,<br>SettleComponent,<br>SplitBillComponent |
| Imports | ActiveKotModule,<br>BaseComponentsModule,<br>CommonModule,<br>DialogModule,<br>FormsModule,<br>MatButtonModule,<br>MatButtonToggleModule,<br>MatCheckboxModule,<br>MatDialogModule,<br>MatFormFieldModule,<br>MatIconModule,<br>MatInputModule,<br>MatSelectModule,<br>MatSlideToggleModule,<br>MatTooltipModule,<br>ReactiveFormsModule |
| Exports | ActionsComponent |
| Bootstrap |  |
| Providers |  |
| Entry components |  |

## ActiveKotModule

Filename: /Users/sapython/Documents/GitHub/VrajeraPosProduction/src/app/pages/biller/active-kot/active-kot.module.ts

| Section | Classes, service, modules |
| ---- |:-----------|
| Declarations | ActiveKotComponent,<br>BillPreviewComponent,<br>CancelKOtComponent,<br>EditKotComponent,<br>KotItemComponent,<br>LineCancelComponent,<br>LineDiscountComponent,<br>ManageKotComponent,<br>MergedProductsPipe,<br>NormalKotComponent,<br>QuickKotViewComponent,<br>ReasonComponent |
| Imports | BaseComponentsModule,<br>CommonModule,<br>FormsModule,<br>MatButtonModule,<br>MatButtonToggleModule,<br>MatFormFieldModule,<br>MatIconModule,<br>MatInputModule,<br>MatMenuModule,<br>ReactiveFormsModule |
| Exports | ActiveKotComponent,<br>BillPreviewComponent,<br>KotItemComponent |
| Bootstrap |  |
| Providers |  |
| Entry components |  |

## AppRoutingModule

Filename: /Users/sapython/Documents/GitHub/VrajeraPosProduction/src/app/app-routing.module.ts

| Section | Classes, service, modules |
| ---- |:-----------|
| Declarations |  |
| Imports | RouterModule.forRoot(routes {}) |
| Exports | RouterModule |
| Bootstrap |  |
| Providers |  |
| Entry components |  |

## AppModule

Filename: /Users/sapython/Documents/GitHub/VrajeraPosProduction/src/app/app.module.ts

| Section | Classes, service, modules |
| ---- |:-----------|
| Declarations | AppComponent,<br>CheckingPasswordComponent,<br>RequiresPrivilegeComponent,<br>ResetPasswordComponent |
| Imports | AppRoutingModule,<br>BaseComponentsModule,<br>BillerModule,<br>BrowserAnimationsModule,<br>BrowserModule,<br>DialogModule,<br>FormsModule,<br>HttpClientModule,<br>LoadingModule,<br>MatButtonModule,<br>MatButtonToggleModule,<br>MatFormFieldModule,<br>MatIconModule,<br>MatInputModule,<br>MatNativeDateModule,<br>MatProgressSpinnerModule,<br>MatSelectModule,<br>MatSliderModule,<br>MatSnackBarModule,<br>NgxIndexedDBModule.forRoot(dbConfig),<br>provideAnalytics(() => getAnalytics()),<br>provideAuth(() => {let auth = getAuth();return auth;}),<br>provideFirebaseApp(() => initializeApp(APP_CONFIG.firebase)),<br>provideFirestore(() => {let fs = getFirestore();return fs}),<br>provideFunctions(() => {let functions = getFunctions();connectFunctionsEmulator(functions 'localhost' 5001);return functions;}),<br>providePerformance(() => getPerformance()),<br>providePerformance(() => {return getPerformance();}),<br>provideStorage(() => {let storageRef = getStorage();return storageRef;}),<br>ReactiveFormsModule |
| Exports |  |
| Bootstrap | AppComponent |
| Providers | AlertsAndNotificationsService,<br>ScreenTrackingService,<br>UserTrackingService |
| Entry components |  |

## BaseComponentsModule

Filename: /Users/sapython/Documents/GitHub/VrajeraPosProduction/src/app/shared/base-components/base-components.module.ts

| Section | Classes, service, modules |
| ---- |:-----------|
| Declarations | ButtonComponent,<br>DialogComponent,<br>IconButtonComponent,<br>PromptComponent,<br>RoundOffPipe |
| Imports | CommonModule,<br>FormsModule,<br>MatButtonModule,<br>MatFormFieldModule,<br>MatInputModule,<br>MatRippleModule,<br>ReactiveFormsModule |
| Exports | ButtonComponent,<br>IconButtonComponent,<br>PromptComponent,<br>RoundOffPipe |
| Bootstrap |  |
| Providers |  |
| Entry components |  |

## BillerRoutingModule

Filename: /Users/sapython/Documents/GitHub/VrajeraPosProduction/src/app/pages/biller/biller-routing.module.ts

| Section | Classes, service, modules |
| ---- |:-----------|
| Declarations |  |
| Imports | RouterModule.forChild(routes) |
| Exports | RouterModule |
| Bootstrap |  |
| Providers |  |
| Entry components |  |

## BillerModule

Filename: /Users/sapython/Documents/GitHub/VrajeraPosProduction/src/app/pages/biller/biller.module.ts

| Section | Classes, service, modules |
| ---- |:-----------|
| Declarations | AboutComponent,<br>AccountComponent,<br>AddComponent,<br>AddDiscountComponent,<br>AddMethodComponent,<br>AddTaxComponent,<br>BillerComponent,<br>CheckPasswordComponent,<br>ConfigComponent,<br>CustomerPanelComponent,<br>DiscountComponent,<br>LockedComponent,<br>LoyaltyComponent,<br>OffersComponent,<br>PaymentComponent,<br>PrinterComponent,<br>ReactivateKotComponent,<br>SelectMenuComponent,<br>SettingsComponent,<br>TaxesComponent,<br>ViewComponent |
| Imports | ActionsModule,<br>ActiveKotModule,<br>BaseComponentsModule,<br>BillerRoutingModule,<br>CommonModule,<br>EmergencyModule,<br>FormsModule,<br>MatAutocompleteModule,<br>MatButtonModule,<br>MatCheckboxModule,<br>MatDialogModule,<br>MatFormFieldModule,<br>MatIconModule,<br>MatInputModule,<br>MatOptionModule,<br>MatProgressSpinnerModule,<br>MatSelectModule,<br>MatSlideToggleModule,<br>MatTabsModule,<br>MatTooltipModule,<br>ProductsPanelModule,<br>ReactiveFormsModule,<br>RecommendedModule,<br>SearchPanelModule,<br>SidebarModule,<br>SystemModule,<br>TableModule |
| Exports |  |
| Bootstrap |  |
| Providers |  |
| Entry components |  |

## EmergencyModule

Filename: /Users/sapython/Documents/GitHub/VrajeraPosProduction/src/app/pages/biller/emergency/emergency.module.ts

| Section | Classes, service, modules |
| ---- |:-----------|
| Declarations | BillComponent,<br>DisperseComponent,<br>EmergencyComponent,<br>KotComponent,<br>OrderComponent,<br>ReceiveComponent,<br>TableComponent |
| Imports | BaseComponentsModule,<br>CommonModule,<br>MatButtonModule,<br>MatIconModule |
| Exports | EmergencyComponent |
| Bootstrap |  |
| Providers |  |
| Entry components |  |

## HelpersModule

Filename: /Users/sapython/Documents/GitHub/VrajeraPosProduction/src/app/shared/helpers/helpers.module.ts

| Section | Classes, service, modules |
| ---- |:-----------|
| Declarations | ConfirmDialogComponent |
| Imports | CommonModule,<br>DialogModule,<br>MatButtonModule |
| Exports |  |
| Bootstrap |  |
| Providers |  |
| Entry components |  |

## LoadingRoutingModule

Filename: /Users/sapython/Documents/GitHub/VrajeraPosProduction/src/app/pages/auth/loading/loading-routing.module.ts

| Section | Classes, service, modules |
| ---- |:-----------|
| Declarations |  |
| Imports | RouterModule.forChild(routes) |
| Exports | RouterModule |
| Bootstrap |  |
| Providers |  |
| Entry components |  |

## LoadingModule

Filename: /Users/sapython/Documents/GitHub/VrajeraPosProduction/src/app/pages/auth/loading/loading.module.ts

| Section | Classes, service, modules |
| ---- |:-----------|
| Declarations | LoadingComponent |
| Imports | BaseComponentsModule,<br>CommonModule,<br>FormsModule,<br>LoadingRoutingModule,<br>MatButtonModule,<br>MatCheckboxModule,<br>MatFormFieldModule,<br>MatIconModule,<br>MatInputModule,<br>MatProgressSpinnerModule,<br>MatSelectModule,<br>MatSlideToggleModule,<br>MatStepperModule,<br>ReactiveFormsModule,<br>SidebarModule |
| Exports |  |
| Bootstrap |  |
| Providers |  |
| Entry components |  |

## PopoverModule

Filename: /Users/sapython/Documents/GitHub/VrajeraPosProduction/src/app/shared/popover/popover.module.ts

| Section | Classes, service, modules |
| ---- |:-----------|
| Declarations | PopoverContainerComponent,<br>PopoverDirective |
| Imports | CommonModule,<br>OverlayModule |
| Exports | PopoverContainerComponent,<br>PopoverDirective |
| Bootstrap |  |
| Providers | Overlay,<br>PopoverService |
| Entry components |  |

## ProductsPanelModule

Filename: /Users/sapython/Documents/GitHub/VrajeraPosProduction/src/app/pages/biller/products-panel/products-panel.module.ts

| Section | Classes, service, modules |
| ---- |:-----------|
| Declarations | ProductCardComponent,<br>ProductsPanelComponent |
| Imports | CommonModule,<br>MatButtonModule,<br>MatCardModule,<br>MatFormFieldModule,<br>MatIconModule,<br>MatInputModule,<br>MatRippleModule |
| Exports | ProductCardComponent,<br>ProductsPanelComponent |
| Bootstrap |  |
| Providers |  |
| Entry components |  |

## RecommendedModule

Filename: /Users/sapython/Documents/GitHub/VrajeraPosProduction/src/app/pages/biller/recommended/recommended.module.ts

| Section | Classes, service, modules |
| ---- |:-----------|
| Declarations | RecommendedComponent |
| Imports | CommonModule,<br>ProductsPanelModule |
| Exports | RecommendedComponent |
| Bootstrap |  |
| Providers |  |
| Entry components |  |

## SearchPanelModule

Filename: /Users/sapython/Documents/GitHub/VrajeraPosProduction/src/app/pages/biller/search-panel/search-panel.module.ts

| Section | Classes, service, modules |
| ---- |:-----------|
| Declarations | SearchPanelComponent |
| Imports | BaseComponentsModule,<br>CommonModule,<br>FormsModule,<br>MatButtonModule,<br>MatButtonToggleModule,<br>MatIconModule,<br>TableModule |
| Exports | SearchPanelComponent |
| Bootstrap |  |
| Providers |  |
| Entry components |  |

## SidebarModule

Filename: /Users/sapython/Documents/GitHub/VrajeraPosProduction/src/app/pages/biller/sidebar/sidebar.module.ts

| Section | Classes, service, modules |
| ---- |:-----------|
| Declarations | AddDishComponent,<br>AddMenuComponent,<br>AddNewCategoryComponent,<br>BrandingComponent,<br>CashCounterComponent,<br>CategoryCardComponent,<br>CloseInComponent,<br>DispenseComponent,<br>DispenseSmallComponent,<br>DispersionComponent,<br>EditMenuComponent,<br>EnabledPipe,<br>InfoPanelComponent,<br>InventoryListComponent,<br>MenuComponent,<br>MenuItemComponent,<br>OptionComponent,<br>OrderSummaryComponent,<br>ProductCostingComponent,<br>ReceiveStockComponent,<br>ReceivingComponent,<br>ReceivingSmallComponent,<br>ReportsComponent,<br>SalesSummaryComponent,<br>SelectCategoryComponent,<br>SelectRecipeComponent,<br>SetTaxComponent,<br>SidebarComponent,<br>StockComponent,<br>StockListComponent,<br>StockValuationComponent,<br>UpgradeComponent |
| Imports | BaseComponentsModule,<br>CommonModule,<br>DialogModule,<br>DragDropModule,<br>FormsModule,<br>HelpersModule,<br>MatButtonModule,<br>MatButtonToggleModule,<br>MatCheckboxModule,<br>MatDatepickerModule,<br>MatFormFieldModule,<br>MatIconModule,<br>MatInputModule,<br>MatMenuModule,<br>MatPaginatorModule,<br>MatProgressSpinnerModule,<br>MatRadioModule,<br>MatRippleModule,<br>MatSelectModule,<br>MatSliderModule,<br>MatSlideToggleModule,<br>MatStepperModule,<br>MatTabsModule,<br>MatTooltipModule,<br>OverlayModule,<br>PopoverModule,<br>ReactiveFormsModule |
| Exports | AddDishComponent,<br>AddNewCategoryComponent,<br>SelectRecipeComponent,<br>SidebarComponent |
| Bootstrap |  |
| Providers |  |
| Entry components |  |

## SystemModule

Filename: /Users/sapython/Documents/GitHub/VrajeraPosProduction/src/app/pages/biller/system/system.module.ts

| Section | Classes, service, modules |
| ---- |:-----------|
| Declarations | ChatComponent,<br>HistoryComponent,<br>ReprintReasonComponent,<br>SystemComponent |
| Imports | BaseComponentsModule,<br>CommonModule,<br>DialogModule,<br>FormsModule,<br>MatButtonModule,<br>MatDatepickerModule,<br>MatExpansionModule,<br>MatFormFieldModule,<br>MatIconModule,<br>MatInputModule,<br>MatProgressSpinnerModule,<br>ReactiveFormsModule |
| Exports | SystemComponent |
| Bootstrap |  |
| Providers |  |
| Entry components |  |

## TableModule

Filename: /Users/sapython/Documents/GitHub/VrajeraPosProduction/src/app/pages/biller/table/table.module.ts

| Section | Classes, service, modules |
| ---- |:-----------|
| Declarations | TableComponent |
| Imports | BaseComponentsModule,<br>CommonModule,<br>DialogModule,<br>FormsModule,<br>MatButtonToggleModule,<br>MatCheckboxModule,<br>MatIconModule,<br>MatRippleModule,<br>MatTabsModule |
| Exports |  |
| Bootstrap |  |
| Providers |  |
| Entry components |  |


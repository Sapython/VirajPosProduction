import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertsAndNotificationsService } from '../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { Dialog } from '@angular/cdk/dialog';
import { AddDishComponent } from '../../biller/sidebar/edit-menu/add-dish/add-dish.component';
import { SelectRecipeComponent } from '../../biller/sidebar/edit-menu/select-recipe/select-recipe.component';
import { AddNewCategoryComponent } from '../../biller/sidebar/edit-menu/add-new-category/add-new-category.component';
import { Subject, Subscription, debounceTime, firstValueFrom } from 'rxjs';
import {
  UserCredential,
  signInWithCustomToken,
  user,
} from '@angular/fire/auth';
import { Timestamp, serverTimestamp } from '@angular/fire/firestore';
import { DialogComponent } from '../../../shared/base-components/dialog/dialog.component';
import {
  zoomInOnEnterAnimation,
  zoomOutOnLeaveAnimation,
} from 'angular-animations';
import { httpsCallableFromURL } from 'firebase/functions';
import { Functions } from '@angular/fire/functions';
import { Product } from '../../../types/product.structure';
import { DataProvider } from '../../../core/services/provider/data-provider.service';
import { OnboardingService } from '../../../core/services/onboarding/onboarding.service';
import { MenuManagementService } from '../../../core/services/database/menuManagement/menu-management.service';
import { UserManagementService } from '../../../core/services/auth/user/user-management.service';
import { SignupService } from '../../../core/services/auth/signup/signup.service';
import { LoginService } from '../../../core/services/auth/login/login.service';
import { FileStorageService } from '../../../core/services/database/fileStorage/file-storage.service';
import { BusinessRecord, UserBusiness } from '../../../types/user.structure';
import { TableConstructor } from '../../../types/table.structure';
import { SettingsService } from '../../../core/services/database/settings/settings.service';
import { TableService } from '../../../core/services/database/table/table.service';
import { read, utils, writeFile } from 'xlsx';
var debug = false;

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  animations: [zoomInOnEnterAnimation(), zoomOutOnLeaveAnimation()],
})
export class LoadingComponent implements OnInit, OnDestroy {
  products: ExcelProduct[] = [];
  loginForm: FormGroup = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
  });

  resetPasswordFormVerification: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', [Validators.required]),
  });

  resetPasswordForm: FormGroup = new FormGroup({
    otp: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  checkUsernameFunction = httpsCallableFromURL(this.functions, 'https://usernameavailable-3mazqb66kq-el.a.run.app');
  signUpWithUserAndPassword = httpsCallableFromURL(
    this.functions,
    'https://signupwithuserandpassword-3mazqb66kq-el.a.run.app',
  );
  signInWithUserAndPassword = httpsCallableFromURL(
    this.functions,
    'https://signinwithuserandpassword-3mazqb66kq-el.a.run.app',
  );
  type: string[] = ['veg', 'non-veg'];
  tags: { color: string; name: string; contrast: string }[] = [
    {
      color: 'tomato',
      contrast: 'white',
      name: 'Half',
    },
    {
      color: 'green',
      contrast: 'white',
      name: 'Full',
    },
  ];

  mode: 'signup' | 'login' = 'login';
  checkingUsername: boolean = false;
  userNameAvailable: 'invalid' | 'available' | 'unavailable' | 'checking' =
    'checking';
  checkUsername: Subject<string> = new Subject<string>();
  // auth functions above

  onboardingBusinessForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    state: new FormControl('', [Validators.required]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern('[0-9]{10}'),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.pattern('[a-zA-Z0-9]*'),
    ]),
    fssai: new FormControl(''),
    gst: new FormControl(''),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  addNewMenuForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });
  onboardingStarted: boolean = false;

  accounts: {
    username: string;
    access: 'manager' | 'waiter' | 'accountant' | 'admin';
  }[] = [];

  menuImage: File | undefined;
  customDishes: any[] = [];
  selectedProducts: Product[] = [];
  rootCategories: { name: string; products: any[] }[] = [];
  imageUrl: string = '';
  statesAndCities: {state:string,districts:string[]}[] = [];
  loginStage: Subject<string> = new Subject<string>();
  resetPasswordRequestAuthId: string = '';
  logoFile: File | undefined;
  logoString: string = '';
  checkUsernameSubscription: Subscription = Subscription.EMPTY;
  checkUsernameDebouncedSubscription: Subscription = Subscription.EMPTY;
  constructor(
    public dataProvider: DataProvider,
    private alertify: AlertsAndNotificationsService,
    public onboardingService: OnboardingService,
    private dialog: Dialog,
    private functions: Functions,
    private menuManagementService: MenuManagementService,
    private userManagementService: UserManagementService,
    private signUpService: SignupService,
    private loginService: LoginService,
    private fileStorageService: FileStorageService,
    private settingsService: SettingsService,
    private tableService: TableService,
  ) {
    this.checkUsernameSubscription = this.checkUsername.subscribe((value) => {
      this.checkingUsername = true;
    });
    this.checkUsernameDebouncedSubscription = this.checkUsername.pipe(debounceTime(1000)).subscribe((value) => {
      this.checkingUsername = true;
      this.checkUsernameFunction({ username: value })
        .then((result) => {
          //  console.log(result.data);
          this.checkingUsername = false;
          this.userNameAvailable = result.data['stage'];
        })
        .catch((error) => {
          //  console.log(error);
          this.checkingUsername = false;
          this.userNameAvailable = 'invalid';
        });
    });
  }

  ngOnInit(){
    fetch('assets/states-and-districts.json').then(async (res) => {
      let states = await res.json()
      // console.log('res',states.states);
      this.statesAndCities = states.states;
    }).catch((error) => {
      // console.log('error', error);
    })
  }

  ngOnDestroy(): void {
    this.checkUsernameSubscription.unsubscribe();
    this.checkUsernameDebouncedSubscription.unsubscribe();
  }

  customLogin() {}

  customSignup() {}

  openDishes() {
    // open dishes dialog
    this.dataProvider.loading = true;
    this.menuManagementService
      .getRootProducts()
      .then((products) => {
        const dialog = this.dialog.open(SelectRecipeComponent, {
          data: products.docs.map((p) => {
            return { ...p.data(), id: p.id };
          }),
        });
        dialog.componentInstance!.editMode = true;
        let a = dialog.closed.subscribe((value: any) => {
          //  console.log('value', value);
          if (value) {
            this.selectedProducts = value.filter((p: Product) => {
              return p.selected;
            });
            //  console.log('selectedProducts', this.selectedProducts);
          }
          a.unsubscribe();
        });
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }

  log() {
    //  console.log(this.securityForm);
  }

  chooseFile(event: any) {
    // check for file size should not be more than 1mb and should only be image
    if (event.target.files[0].size > 1000000) {
      this.alertify.presentToast('File Size should be less than 1mb');
      return;
    }
    if (event.target.files[0].type.split('/')[0] != 'image') {
      this.alertify.presentToast('File should be an image');
      return;
    }
    this.logoFile = event.target.files[0];
    if (this.logoFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoString = e.target.result;
      };
      reader.readAsDataURL(this.logoFile);
    }
  }

  saveBusinessDetails() {
    this.dataProvider.activeModes = [true, true, true];
  }

  logout() {
    const confirmDialog = this.dialog.open(DialogComponent, {
      data: { title: 'Logout', message: 'Are you sure you want to logout?' },
    });
    firstValueFrom(confirmDialog.closed).then((result) => {
      //  console.log(result);
      if (result) {
        this.userManagementService.logout();
      }
    });
  }

  async checkPassword(element:any){
    this.onboardingStarted = true;
    // this.onboardingService.stage = 'virajGettingReady';
    // this.databaseService.setSettings()
    // generate alphanumeric id
    let username = this.onboardingBusinessForm.value.username;
    let password = this.onboardingBusinessForm.value.password;
    this.loginStage.next('Checking Account');
    let id =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    this.dataProvider.loading = true;
    if (this.logoFile) {
      var logo = await this.fileStorageService.upload(
        'business/' + id,
        this.logoFile,
      );
    }
    this.userManagementService
      .userExists(username)
      .then((doc) => {
        if (doc.exists()) {
          this.loginStage.next('Account Exists');
          if (debug) console.log('signing in', username, password);
          this.loginService
            .signInWithUserAndPassword(username, password,true)
            .then((data) => {
              this.loginStage.next('Logged In');
              this.onboardingStarted = false;
              element.next()
              this.dataProvider.loading = false;
            })
            .catch((error) => {
              // console.log('error', error);
              this.loginStage.next('Error Logging In');
              this.alertify.presentToast(error, 'error');
              this.onboardingService.stage = 'onboardingStep2'
              this.onboardingStarted = false;
              this.dataProvider.loading = false;
            });
        } else {
          element.next()
          this.onboardingStarted = false;
          this.dataProvider.loading = false;
        }
      })
      .catch((error) => {
        // console.log('error', error);
        this.loginStage.next('Error Fetching Account');
        this.alertify.presentToast(error.message, 'error');
        // this.onboardingService.stage = 'onboardingStep3'
        this.onboardingStarted = false;
        this.dataProvider.loading = false;
      });
  }

  async login() {
    // if (this.mode == 'signup') {
    //   this.signup();
    //   return;
    // }
    try {
      this.dataProvider.loading = true;
      let result = await this.signInWithUserAndPassword({
        username: this.loginForm.value.username,
        password: this.loginForm.value.password,
      });
      //  console.log(result.data);
      await this.loginService.signInWithCustomToken(result.data['token']);
      this.alertify.presentToast(
        'Logged In with ' + this.loginForm.value.username,
      );
    } catch (error) {
      this.alertify.presentToast(error.message);
    } finally {
      this.dataProvider.loading = false;
    }
    // .then((data)=>{
    // //  console.log(data);
    //   this.alertify.presentToast("Logged In with "+this.loginForm.value.username)
    // }).catch((error)=>{
    // //  console.log(error);
    //   this.alertify.presentToast(error)
    // })
    // .then((result)=>{
    // }).catch((error)=>{
    // //  console.log(error);
    //   this.alertify.presentToast(error)
    // }).finally(()=>{
    //   this.dataProvider.loading = false;
    // })
    // this.authService
    //   .loginWithEmailPassword(
    //     this.loginForm.value.username,
    //     this.loginForm.value.password
    //   )
    //   .then((data) => {
    //   //  console.log(data.user);
    //     this.alertify.presentToast("Logged In with "+this.loginForm.value.email)
    //   }).catch((error)=>{
    //     if(error.message){
    //       this.alertify.presentToast(error.message)
    //     } else {
    //       this.alertify.presentToast("Some Error Occured")
    //     }
    //   });
  }

  setImage(event: any) {
    // validate image and make sure it's less than 1 mb
    let file: File = event.target.files[0];
    if (file.type != 'image/png' && file.type != 'image/jpeg') {
      alert('Image type is not supported, please choose a png or jpeg image');
      return;
    }
    if (file.size > 1000000) {
      alert('Image size is too large, please choose a smaller image');
      return;
    }
    this.menuImage = file;
    // convert image to base64
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imageUrl = reader.result as string;
    };
  }

  addDish() {
    const dialog = this.dialog.open(AddDishComponent);
    let a = dialog.closed.subscribe((value) => {
      //  console.log('value', value);
      a.unsubscribe();
    });
    // open dishes dialog
  }

  addNewMenu() {
    this.dataProvider.loading = true;
    // filter rootCategories prdoucts to only include selected products
    this.rootCategories.forEach((category) => {
      category.products = category.products.filter(
        (product) => product.selected,
      );
    });
    this.menuManagementService
      .addNewMenu(this.addNewMenuForm.value, this.rootCategories)
      .then(() => {
        this.alertify.presentToast('Menu added successfully');
      })
      .catch((err) => {
        //  console.log('err', err);
        this.alertify.presentToast(
          'Error adding menu, please try again later',
          'error',
        );
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }

  openCategoryDialog() {
    let filteredProducts: Product[] = [];
    this.rootCategories.forEach((category) => {
      filteredProducts.push(...category.products);
    });
    // fincal products that are not in the filtered products
    let finalProducts: Product[] = [];
    this.selectedProducts.forEach((product) => {
      if (!filteredProducts.find((p) => p.id == product.id)) {
        finalProducts.push(product);
      }
    });
    //  console.log('filteredProducts', filteredProducts);
    const dialog = this.dialog.open(AddNewCategoryComponent, {
      data: {
        noSave: true,
        products: finalProducts,
        rootProducts: finalProducts,
      },
    });
    firstValueFrom(dialog.closed).then((value: any) => {
      //  console.log('value', value);
      if (value) {
        this.rootCategories.push(value);
      }
    });
  }

  async completeOnboarding() {
    this.onboardingStarted = true;
    // this.onboardingService.stage = 'virajGettingReady';
    // this.databaseService.setSettings()
    // generate alphanumeric id
    let username = this.onboardingBusinessForm.value.username;
    let password = this.onboardingBusinessForm.value.password;
    this.loginStage.next('Checking Account');
    let id =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    if (this.logoFile) {
      var logo = await this.fileStorageService.upload(
        'business/' + id,
        this.logoFile,
      );
    }
    this.userManagementService
      .userExists(username)
      .then((doc) => {
        if (doc.exists()) {
          this.loginStage.next('Account Exists');
          // if (debug) console.log('signing in', username, password);
          this.loginService
            .signInWithUserAndPassword(username, password)
            .then((data) => {
              this.loginStage.next('Logged In');
              this.onboard(data, id, logo);
            })
            .catch((error) => {
              // console.log('error', error);
              this.loginStage.next('Error Logging In');
              this.alertify.presentToast(error, 'error');
              this.onboardingService.stage = 'onboardingStep2'
              this.onboardingStarted = false;
            });
        } else {
          let data: BusinessRecord = {
            address: this.onboardingBusinessForm.value.address,
            city:this.onboardingBusinessForm.value.city,
            state:this.onboardingBusinessForm.value.state.state,
            businessId: id,
            hotelName: this.onboardingBusinessForm.value.name,
            hotelLogo: logo || '',
            // billerPin:this.securityForm.value.billerPin,
            devices: [],
            modes: this.dataProvider.activeModes,
            username: this.onboardingBusinessForm.value.username,
            email: this.onboardingBusinessForm.value.email,
            fssai: this.onboardingBusinessForm.value.fssai,
            gst: this.onboardingBusinessForm.value.gst,
            image: '',
            billerPrinter: '',
            cgst: 2.5,
            sgst: 2.5,
            phone: this.onboardingBusinessForm.value.phone,
            users: [
              {
                role: 'admin',
                accessType: 'role',
                username: this.onboardingBusinessForm.value.username,
                lastUpdated: Timestamp.fromDate(new Date()),
                updatedBy: 'system',
              },
            ],
          };
          this.loginStage.next('Creating Account');
          if (debug) console.log('Signing Up', username, password);
          this.signUpService
            .signUpWithUserAndPassword(username, password, {
              business: {
                access: {
                  accessType: 'role',
                  role: 'admin',
                  lastUpdated: Timestamp.fromDate(new Date()),
                  updatedBy: 'system',
                },
                address: this.onboardingBusinessForm.value.address,
                city:this.onboardingBusinessForm.value.city,
                state:this.onboardingBusinessForm.value.state.state,
                businessId: id,
                joiningDate: Timestamp.fromDate(new Date()),
                name: this.onboardingBusinessForm.value.name,
              },
              email: data.email,
              phone: data.phone,
            })
            .then((data) => {
              this.loginStage.next('Account Created');
              if (debug) console.log('FINAL DATA', data);
              if (!data['providerId']) {
                this.onboard(data as UserCredential, id, logo);
              }
            })
            .catch((error) => {
              // console.log('error', error);
              this.loginStage.next('Error Creating Account');
              this.alertify.presentToast(error.message, 'error');
              // this.onboardingService.stage = 'onboardingStep3'
              this.onboardingStarted = false;
            });
        }
      })
      .catch((error) => {
        // console.log('error', error);
        this.loginStage.next('Error Fetching Account');
        this.alertify.presentToast(error.message, 'error');
        // this.onboardingService.stage = 'onboardingStep3'
        this.onboardingStarted = false;
      });
  }

  get twoModeDeactived(): boolean {
    // return true when any two modes are false from all modes
    return this.dataProvider.activeModes.filter((mode) => !mode).length >= 2;
  }

  async onboard(user: UserCredential, id: string, logoImage?: string) {
    // TODO: create id
    // TODO: set settings
    // TODO: create current account
    // TODO: register accounts
    // TODO: create menu
    try {
      if (debug) console.log('Started onboarding');
      let userBusiness: UserBusiness = {
        access: {
          role: 'admin',
          accessType:'role',
          lastUpdated: Timestamp.fromDate(new Date()),
          updatedBy: 'system',
        },
        address: this.onboardingBusinessForm.value.address,
        city:this.onboardingBusinessForm.value.city,
        state:this.onboardingBusinessForm.value.state.state,
        businessId: id,
        joiningDate: Timestamp.fromDate(new Date()),
        name: this.onboardingBusinessForm.value.name,
      };
      if (debug) console.log('userBusiness', userBusiness, user);
      this.loginStage.next('Adding user account');
      let userBusinessRes = await this.signUpService.addBusinessAccount(
        user,
        userBusiness,
      );
      if (debug) console.log('userBusinessRes', userBusinessRes);
      let data: BusinessRecord = {
        address: this.onboardingBusinessForm.value.address,
        city:this.onboardingBusinessForm.value.city,
        state:this.onboardingBusinessForm.value.state.state,
        businessId: id,
        hotelName: this.onboardingBusinessForm.value.name,
        hotelLogo: logoImage || '',
        modes: this.dataProvider.activeModes,
        devices: [],
        username: this.onboardingBusinessForm.value.username,
        email: this.onboardingBusinessForm.value.email,
        fssai: this.onboardingBusinessForm.value.fssai || '',
        gst: this.onboardingBusinessForm.value.gst || '',
        image: '',
        billerPrinter: '',
        cgst: 2.5,
        sgst: 2.5,
        phone: this.onboardingBusinessForm.value.phone,
        users: [
          {
            role: 'admin',
            accessType: 'role',
            username: this.onboardingBusinessForm.value.username,
            lastUpdated: Timestamp.fromDate(new Date()),
            updatedBy: 'system',
          },
        ],
      };
      if (debug) console.log('data', data);
      this.loginStage.next('Adding business account');
      let addBusinessRes = this.settingsService.addBusiness(data, id);
      let businessRes = await Promise.all([userBusinessRes, addBusinessRes]);
      if (debug) console.log('businessRes', businessRes);
      this.rootCategories.forEach((category) => {
        category.products = category.products.filter(
          (product) => product.selected,
        );
      });
      this.loginStage.next('Adding menu');
      if (debug)
        console.log(
          'this.addNewMenuForm.value, this.rootCategories,id',
          this.addNewMenuForm.value,
          this.rootCategories,
          id,
        );
      let menuRes = await this.menuManagementService.addNewMenu(
        this.addNewMenuForm.value,
        this.rootCategories,
        id,
      );
      // generate and add 10 tables
      this.loginStage.next('Adding tables');
      let tables: TableConstructor[] = [];
      for (let i = 0; i < 10; i++) {
        tables.push({
          name: `Table ${i + 1}`,
          group: 'Table',
          status: 'available',
          id: `${i + 1}`,
          order: i,
          bill: null,
          billPrice: 0,
          maxOccupancy: '4',
          minutes: 0,
          occupiedStart: Timestamp.now(),
          tableNo: i + 1,
          timeSpent: '',
          type: 'table',
        });
      }
      let tablesRes = await this.tableService.addTables(tables, id);
      if (debug) console.log('menuRes', menuRes);
      let paymentsRef = await this.settingsService.addDefaultPaymentMethods(id);
      let settingsRef = await this.menuManagementService.updateRootSettings(
        {
          billTokenNo: 1,
          kitchenTokenNo: 1,
          onlineTokenNo: 1,
          orderTokenNo: 1,
          ncBillTokenNo: 1,
          takeawayTokenNo: 1,
          nonChargeableSales: 0,
          takeawaySales: 0,
          dineInSales: 0,
          onlineSales: 0,
          tableTimeOutTime: 45,
          billNoSuffix: '',
          printBillAfterFinalize: true,
          customBillNote: '',
          optionalTax: false,
          modes: this.dataProvider.activeModes,
          dineInMenu: this.dataProvider.activeModes[0]
            ? {
                description: this.addNewMenuForm.value.description,
                id: menuRes.menuRes.id,
                name: this.addNewMenuForm.value.name,
              }
            : null,
          onlineMenu: this.dataProvider.activeModes[1]
            ? {
                description: this.addNewMenuForm.value.description,
                id: menuRes.menuRes.id,
                name: this.addNewMenuForm.value.name,
              }
            : null,
          takeawayMenu: this.dataProvider.activeModes[2]
            ? {
                description: this.addNewMenuForm.value.description,
                id: menuRes.menuRes.id,
                name: this.addNewMenuForm.value.name,
              }
            : null,
        },
        id,
      );
      if (debug) console.log('settingsRef', settingsRef);
      this.loginStage.next('Adding other accounts');
      let accountRef = await Promise.all(
        this.accounts.map((account) => {
          return this.settingsService.addAccount(
            {
              role: account.access,
              accessType: 'role',
              username: account.username,
              lastUpdated: Timestamp.fromDate(new Date()),
              updatedBy: 'system',
            },
            id,
          );
        }),
      );
      if (debug) console.log('accountRef', accountRef);
      // onboard completed
      this.loginStage.next('Onboarding completed');
      const dialog = this.dialog.open(DialogComponent, {
        data: {
          title: 'Your onboarding is complete.',
          description:
            'You can now login to your account and start using the application.',
          buttonText: 'Login',
        },
      });
      firstValueFrom(dialog.closed).then(() => {
        let url = window.location.href.split('/');
        url.pop();
        url.push('index.html');
        window.location.href = url.join('/');
      });
    } catch (error) {
      console.log('error', error);
      this.loginStage.next('Error Occured');
      this.onboardingService.stage = 'errorOccured';
      this.onboardingStarted = false;
      this.dataProvider.loading = false;
      this.alertify.presentToast('Some error occured', 'error');
    }
  }

  setDefaultAccount(business: UserBusiness) {
    this.dataProvider.loading = true;
    this.onboardingService.loadBusiness(business.businessId)
  }

  get everythingDone() {
    let formsValid =
      this.onboardingBusinessForm.valid;
    return formsValid;
  }

  checkRestMail() {
    this.dataProvider.loading = true;
    this.userManagementService
      .sendResetPasswordMail(
        this.resetPasswordFormVerification.value.username,
        this.resetPasswordFormVerification.value.email,
      )
      .then((res) => {
        console.log('res', res);
        if (res['data'] && res['data']['status'] == 'success') {
          this.alertify.presentToast('Verification mail sent');
          this.onboardingService.stage = 'resetPasswordStage2';
          this.resetPasswordRequestAuthId = res['data']['authId'];
        } else {
          this.alertify.presentToast('Some error occured', 'error');
        }
      })
      .catch((error) => {
        console.log('error', error);
        this.alertify.presentToast(error.message, 'error');
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }

  resetPassword() {
    this.dataProvider.loading = true;
    this.userManagementService
      .resetPasswordWithOtp(
        this.resetPasswordFormVerification.value.username,
        this.resetPasswordForm.value.otp,
        this.resetPasswordForm.value.password,
        this.resetPasswordForm.value.confirmPassword,
        this.resetPasswordRequestAuthId,
      )
      .then((res) => {
        console.log('res', res);
        if (res['data'] && res['data']['status'] == 'success') {
          this.alertify.presentToast('Password reset successfully');
          this.onboardingService.stage = 'noUser';
        } else {
          this.alertify.presentToast('Some error occured', 'error');
        }
      })
      .catch((error) => {
        console.log('error', error);
        this.alertify.presentToast(error.message, 'error');
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }
  
  downloadFormat(){
    // create a csv file with this format
    // name, category, price,veg/nonveg , half/full (half/full is optional),
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "name,category,price,veg/nonveg,half/full\n";
    // download the file
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "menu_format.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click(); // This will download the data file named "my_data.csv".
  }

  readFormat(event:any){
    // handle file event
    let file: File = event.target.files[0];

    if (file.size > 10000000) {
      alert('File size is too large, please choose a smaller file');
      return;
    }
    // read the file
    let reader = new FileReader();
    reader.readAsBinaryString(file)
    reader.onload = (e) => {
      let spreadSheetWorkBook = read(e.target.result, {type:'binary'});
      console.log('spreadSheetFile', spreadSheetWorkBook);
      const data = utils.sheet_to_json<ExcelProduct>(spreadSheetWorkBook.Sheets[spreadSheetWorkBook.SheetNames[0]]);
      console.log('data', data);
      
      //  console.log('reader.result', reader.result);
      // let lines = (reader.result as string).split('\n');
      // //  console.log('lines', lines);
      let products = [];
      this.rootCategories = [];
      data.forEach((line)=>{
        line.tag = line['half/full'] == 'full' ? {color:'green',contrast:'white',name:'Full'} : { color: 'tomato', contrast: 'white', name: 'Half'};
        line.type = line['veg/nonveg'] == 'veg' ? 'veg' : 'non-veg';
        let product = {
          name:line.name,
          category:line.category,
          price:line.price,
          type:line.type,
          tag:line.tag,
          selected:true
        };
        products.push(product);
        // add to root category if not already present
        if(!this.rootCategories.find((category)=>category.name == line.category)){
          this.rootCategories.push({name:line.category,products:[product]});
        } else {
          // add to the products of the category
          this.rootCategories.find((category)=>category.name == line.category)?.products.push(product);
        }
      });

      console.log('products', products,this.rootCategories);
      // this.selectedProducts = products;
    }
  }

  switchAll(event: any,category:{name:string,products:any[]}) {
    category.products.forEach((product: any) => {
      product.selected = event.checked;
    });
  }

  checkedAll(category:{name:string,products:any[]}){
    return category.products.every((product:any)=>product.selected);
  }

  deleteCategory(category:{name:string,products:any[]}){
    this.rootCategories = this.rootCategories.filter((c)=>c.name != category.name);
    this.alertify.presentToast("Category Deleted");
  }

  async addCategory(){
    let categoryName = await this.dataProvider.prompt('Add new category',{
      required:true
    });
    if(categoryName){
      this.rootCategories.push({name:categoryName,products:[]});
      this.alertify.presentToast("Category Added");
    }
  }

  addProduct(category:{name:string,products:any[]}){
    const dishComp = this.dialog.open(AddDishComponent,{data:{mode:'add'}});
    firstValueFrom(dishComp.closed).then((value)=>{
      console.log("TO be added product",value);
      if(value){
        category.products.push(value);
        this.alertify.presentToast("Product Added");
      }
    });
  }

  autoOnboard(){
    this.onboardingService.stage = 'onboardingStep1';
    console.log("this.onboardingService.autoOutletFromEmail",this.onboardingService.autoOutletFromEmail);
    this.onboardingBusinessForm.patchValue(this.onboardingService.autoOutletFromEmail);
  }
}


interface ExcelProduct {
  name:string;
  category:string;
  price:number;
  type:'veg'|'non-veg';
  tag:{color:'green',contrast:'white',name:'Full'} | { color: 'tomato', contrast: 'white', name: 'Half'};
  selected?:boolean;
}
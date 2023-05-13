import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataProvider } from '../provider/data-provider.service';
import { AlertsAndNotificationsService } from '../services/alerts-and-notification/alerts-and-notifications.service';
import { AuthService } from '../services/auth.service';
import { OnboardingService } from '../onboarding.service';
import { DatabaseService } from '../services/database.service';
import { Dialog } from '@angular/cdk/dialog';
import { Product, TableConstructor } from '../biller/constructors';
import { AddDishComponent } from '../biller/sidebar/edit-menu/add-dish/add-dish.component';
import { SelectRecipeComponent } from '../biller/sidebar/edit-menu/select-recipe/select-recipe.component';
import { AddNewCategoryComponent } from '../biller/sidebar/edit-menu/add-new-category/add-new-category.component';
import { Subject, debounceTime } from 'rxjs';
import { UserCredential, signInWithCustomToken } from '@angular/fire/auth';
import { BusinessRecord, UserBusiness } from '../structures/user.structure';
import { Timestamp, serverTimestamp } from '@angular/fire/firestore';
import { DialogComponent } from '../base-components/dialog/dialog.component';
import { zoomInOnEnterAnimation, zoomOutOnLeaveAnimation } from 'angular-animations';
import { httpsCallable } from "firebase/functions";
import { Functions } from '@angular/fire/functions';
@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  animations:[zoomInOnEnterAnimation(),zoomOutOnLeaveAnimation()]
})
export class LoadingComponent {

  loginForm: FormGroup = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
  });

  checkUsernameFunction = httpsCallable(this.functions, 'userNameAvailable');
  signUpWithUserAndPassword = httpsCallable(this.functions, 'signUpWithUserAndPassword');
  signInWithUserAndPassword = httpsCallable(this.functions, 'signInWithUserAndPassword');

  mode:'signup'|'login' = 'login';
  checkingUsername:boolean = false;
  userNameAvailable:'invalid'|'available'|'unavailable'|'checking' = 'checking';
  checkUsername:Subject<string> = new Subject<string>();
  // auth functions above

  onboardingBusinessForm:FormGroup = new FormGroup({
    name:new FormControl('',[Validators.required]),
    address:new FormControl('',[Validators.required]),
    phone:new FormControl('',[Validators.required]),
    email:new FormControl('',[Validators.required]),
    fssai:new FormControl(''),
    gst:new FormControl(''),
  })

  securityForm:FormGroup = new FormGroup({
    password:new FormControl('',[Validators.required,Validators.minLength(8)]),
    confirmPassword:new FormControl('',[Validators.required,Validators.minLength(8)]),
    billerPin:new FormControl('',[Validators.required,Validators.minLength(6)]),
    confirmBillerPin:new FormControl('',[Validators.required,Validators.minLength(6)]),
  })

  addNewMenuForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });
  onboardingStarted:boolean = false;

  accounts:{email:string,access:string}[] = [
    {
      email:"",
      access:"",
    }
  ]

  menuImage: File | undefined;
  products: Product[] = [];
  customDishes: any[] = [];
  selectedProducts: Product[] = [];
  rootCategories:{name:string,products:Product[]}[] = []
  imageUrl: string = '';

  loginStage:Subject<string> = new Subject<string>();

  logoFile:File|undefined;
  logoString:string = '';
  constructor(
    private authService: AuthService,
    public dataProvider: DataProvider,
    private alertify:AlertsAndNotificationsService,
    public onboardingService:OnboardingService,
    private databaseService: DatabaseService,
    private dialog:Dialog,
    private functions: Functions
  ) {
    this.checkUsername.subscribe((value)=>{
      this.checkingUsername = true;
    })
    this.checkUsername.pipe(debounceTime(1000)).subscribe((value)=>{
      this.checkingUsername = true;
      this.checkUsernameFunction({username:value}).then((result)=>{
        console.log(result.data);
        this.checkingUsername = false;
        this.userNameAvailable = result.data['stage'];
      }).catch((error)=>{
        console.log(error);
        this.checkingUsername = false;
        this.userNameAvailable = 'invalid';
      })
    })
  }

  customLogin(){
  }

  customSignup(){
  }

  openDishes() {
    // open dishes dialog
    this.dataProvider.loading = true;
    this.databaseService
      .getRootProducts()
      .then((products) => {
        const dialog = this.dialog.open(SelectRecipeComponent, {
          data: products.docs.map((p) => {
            return { ...p.data(), id: p.id };
          }),
        });
        dialog.componentInstance!.editMode = true;
        let a = dialog.closed.subscribe((value: any) => {
          console.log('value', value);
          if (value) {
            this.selectedProducts = value.filter((p: Product) => {
              return p.selected;
            });
            console.log('selectedProducts', this.selectedProducts);
          }
          a.unsubscribe();
        });
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }

  log(){
    console.log(this.securityForm);
    
  }

  chooseFile(event:any){
    // check for file size should not be more than 1mb and should only be image
    if(event.target.files[0].size > 1000000){
      this.alertify.presentToast("File Size should be less than 1mb")
      return;
    }
    if(event.target.files[0].type.split('/')[0] != 'image'){
      this.alertify.presentToast("File should be an image")
      return;
    }
    this.logoFile = event.target.files[0];
    if(this.logoFile){
      const reader = new FileReader();
      reader.onload = (e:any) => {
        this.logoString = e.target.result;
      }
      reader.readAsDataURL(this.logoFile);
    }
  }

  saveBusinessDetails(){
  }

  logout(){
    const confirmDialog = this.dialog.open(DialogComponent,{data:{title:'Logout',message:'Are you sure you want to logout?'}});
    confirmDialog.closed.subscribe(result=>{
      console.log(result);
      if(result){
        this.authService.logout();
      }
    })
  }

  signup(){
    console.log(this.loginForm.value);
    
    if (this.loginForm.invalid) {
      this.alertify.presentToast('Invalid form details.');
      return;
    }
    this.signUpWithUserAndPassword({
      username:this.loginForm.value.username,
      password:this.loginForm.value.password,
      business:{
        access:{
          accessLevel:'admin',
          lastUpdated:Timestamp.now(),
          updatedBy:'system'
        },
        address:'Sardar Patel Marg, beside JK Palace, Civil Lines, Prayagraj, Uttar Pradesh 211001',
        businessId:'46r0a1zlta7hyb077scig9',
        joiningDate:Timestamp.now(),
        name:'Momos Castle',
      }
    }).then((result)=>{
      console.log(result.data);
      this.authService.signInWithCustomToken(result.data['token']).then((data)=>{
        console.log(data);
        this.alertify.presentToast("Signed Up with "+this.loginForm.value.username)
      }).catch((error)=>{
        console.log(error);
        this.alertify.presentToast("Some Error Occured")
      })
    }).catch((error)=>{
      console.log(error);
    })
  }

  login() {
    if (this.mode == 'signup') {
      this.signup();
      return;
    }
    this.dataProvider.loading = true;
    this.signInWithUserAndPassword({
      username:this.loginForm.value.username,
      password:this.loginForm.value.password,
    }).then((result)=>{
      console.log(result.data);
      this.authService.signInWithCustomToken(result.data['token']).then((data)=>{
        console.log(data);
        this.alertify.presentToast("Logged In with "+this.loginForm.value.username)
      }).catch((error)=>{
        console.log(error);
        this.alertify.presentToast(error)
      })
    }).catch((error)=>{
      console.log(error);
      this.alertify.presentToast(error)
    }).finally(()=>{
      this.dataProvider.loading = false;
    })
    // this.authService
    //   .loginWithEmailPassword(
    //     this.loginForm.value.username,
    //     this.loginForm.value.password
    //   )
    //   .then((data) => {
    //     console.log(data.user);
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
      console.log('value', value);
      a.unsubscribe();
    });
    // open dishes dialog
  }

  addNewMenu() {
    this.dataProvider.loading = true;
    // filter rootCategories prdoucts to only include selected products
    this.rootCategories.forEach((category)=>{
      category.products = category.products.filter((product)=> product.selected)
    })
    this.databaseService
      .addNewMenu(this.addNewMenuForm.value, this.rootCategories)
      .then(() => {
        this.alertify.presentToast('Menu added successfully');
      })
      .catch((err) => {
        console.log('err', err);
        this.alertify.presentToast(
          'Error adding menu, please try again later',
          'error'
        );
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }

  openCategoryDialog() {
    let filteredProducts:Product[] = []
    this.rootCategories.forEach((category)=>{
      filteredProducts.push(...category.products)
    })
    // fincal products that are not in the filtered products
    let finalProducts:Product[] = []
    this.selectedProducts.forEach((product)=>{
      if(!filteredProducts.find((p)=>p.id == product.id)){
        finalProducts.push(product)
      }
    })
    console.log('filteredProducts', filteredProducts);
    const dialog = this.dialog.open(AddNewCategoryComponent,{data:{noSave:true,products:finalProducts}})
    dialog.closed.subscribe((value:any)=>{
      console.log('value', value);
      if(value){
        this.rootCategories.push(value)
      }
    })
  }

  async completeOnboarding(){
    this.onboardingStarted = true;
    // this.onboardingService.stage = 'virajGettingReady';
    // this.databaseService.setSettings() 
    // generate alphanumeric id
    let email = this.onboardingBusinessForm.value.email;
    let password = this.securityForm.value.password;
    this.loginStage.next('Checking Account')
    let id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    if(this.logoFile){
      var logo = await this.databaseService.upload('business/'+id,this.logoFile)
    }
    this.authService.userExists(email).then((exists)=>{
      if(exists.docs.length > 0){
        this.loginStage.next('Account Exists')
        this.authService.loginWithEmailPassword(email,password).then((data)=>{
          this.loginStage.next('Logged In')
          this.onboard(data,id,logo)
        }).catch((error)=>{
          this.loginStage.next('Error Logging In')
          this.alertify.presentToast(error.message,'error')
          // this.onboardingService.stage = 'onboardingStep3'
        })
      } else {
        let data:BusinessRecord = {
          address:this.onboardingBusinessForm.value.address,
          businessId:id,
          hotelName:this.onboardingBusinessForm.value.name,
          hotelLogo:logo || '',
          billerPin:this.securityForm.value.billerPin,
          devices:[],
          modes:this.dataProvider.activeModes,
          email:this.onboardingBusinessForm.value.email,
          fssai:this.onboardingBusinessForm.value.fssai,
          gst:this.onboardingBusinessForm.value.gst,
          image:'',
          billerPrinter:'',
          cgst:2.5,
          sgst:2.5,
          phone:this.onboardingBusinessForm.value.phone,
          users:[{
            access:'admin',
            email:this.onboardingBusinessForm.value.email,
            lastUpdated:Timestamp.fromDate(new Date()),
            updatedBy:'system',
          }],
        }
        this.loginStage.next('Creating Account')
        this.authService.createAccount(email,password,data).then((data)=>{
          this.loginStage.next('Account Created')
          this.onboard(data,id,logo)
        }).catch((error)=>{
          this.loginStage.next('Error Creating Account')
          this.alertify.presentToast(error.message,'error')
          // this.onboardingService.stage = 'onboardingStep3'
          this.onboardingStarted = false;
        })
      }
    }).catch((error)=>{
      this.loginStage.next('Error Fetching Account')
      this.alertify.presentToast(error.message,'error')
      // this.onboardingService.stage = 'onboardingStep3'
      this.onboardingStarted = false;
    })
  }

  get twoModeDeactived():boolean{
    // return true when any two modes are false from all modes
    return this.dataProvider.activeModes.filter((mode)=>!mode).length >= 2
  }

  async onboard(user:UserCredential,id:string,logoImage?:string){
    // TODO: create id
    // TODO: set settings
    // TODO: create current account
    // TODO: register accounts
    // TODO: create menu
    try {
      console.log("Started onboarding");
      let userBusiness:UserBusiness = {
        access:{accessLevel:'admin',lastUpdated:Timestamp.fromDate(new Date()),updatedBy:'system'},
        address:this.onboardingBusinessForm.value.address,
        businessId:id,
        joiningDate:Timestamp.fromDate(new Date()),
        name:this.onboardingBusinessForm.value.name,
      }
      console.log('userBusiness', userBusiness);
      this.loginStage.next('Adding user account')
      let userBusinessRes = await this.authService.addBusinessAccount(user,userBusiness)
      console.log('userBusinessRes', userBusinessRes);
      let data:BusinessRecord = {
        address:this.onboardingBusinessForm.value.address,
        businessId:id,
        hotelName:this.onboardingBusinessForm.value.name,
        hotelLogo:logoImage || '',
        modes:this.dataProvider.activeModes,
        billerPin:this.securityForm.value.billerPin,
        devices:[],
        email:this.onboardingBusinessForm.value.email,
        fssai:this.onboardingBusinessForm.value.fssai,
        gst:this.onboardingBusinessForm.value.gst,
        image:'',
        billerPrinter:'',
        cgst:2.5,
        sgst:2.5,
        phone:this.onboardingBusinessForm.value.phone,
        users:[{
          access:'admin',
          email:this.onboardingBusinessForm.value.email,
          lastUpdated:Timestamp.fromDate(new Date()),
          updatedBy:'system',
        }],
      }
      console.log('data', data);
      this.loginStage.next('Adding business account')
      let addBusinessRes = this.databaseService.addBusiness(data,id)
      let businessRes = await Promise.all([userBusinessRes,addBusinessRes])
      console.log('businessRes', businessRes);
      this.rootCategories.forEach((category)=>{
        category.products = category.products.filter((product)=> product.selected)
      })
      this.loginStage.next('Adding menu')
      console.log("this.addNewMenuForm.value, this.rootCategories,id",this.addNewMenuForm.value, this.rootCategories,id);
      let menuRes = await this.databaseService.addNewMenu(this.addNewMenuForm.value, this.rootCategories,id)
      // generate and add 10 tables
      this.loginStage.next('Adding tables')
      let tables:TableConstructor[] = []
      for(let i=0;i<10;i++){
        tables.push({
          name:`Table ${i+1}`,
          status:'available',
          id:`${i+1}`,
          bill:null,
          billPrice:0,
          maxOccupancy:'4',
          minutes:0,
          occupiedStart:Timestamp.now(),
          tableNo:i+1,
          timeSpent:'',
          type:'table',
        })
      }
      let tablesRes = await this.databaseService.addTables(tables,id)
      console.log('menuRes', menuRes);
      let settingsRef = await this.databaseService.updateRootSettings(
        {
          billTokenNo:0,
          kitchenTokenNo:0,
          onlineTokenNo:0,
          ncBillTokenNo:0,
          takeawayTokenNo:0,
          nonChargeableSales:0,
          takeawaySales:0,
          dineInSales:0,
          onlineSales:0,
          password:this.securityForm.value.billerPin,
          tableTimeOutTime:45,
          modes:this.dataProvider.activeModes,
          dineInMenu: this.dataProvider.activeModes[0] ? {
            description: this.addNewMenuForm.value.description,
            id: menuRes.menuRes.id,
            name: this.addNewMenuForm.value.name,
          } : null,
          onlineMenu: this.dataProvider.activeModes[1] ? {
            description: this.addNewMenuForm.value.description,
            id: menuRes.menuRes.id,
            name: this.addNewMenuForm.value.name,
          } : null,
          takeawayMenu: this.dataProvider.activeModes[2] ? {
            description: this.addNewMenuForm.value.description,
            id: menuRes.menuRes.id,
            name: this.addNewMenuForm.value.name,
          } : null,
        },
        id
      )
      console.log('settingsRef', settingsRef);
      this.loginStage.next('Adding other accounts')
      let accountRef = await Promise.all(this.accounts.map((account)=>{
        return this.databaseService.addAccount({
          access:account.access,
          email:account.email,
          lastUpdated:Timestamp.fromDate(new Date()),
          updatedBy:'system',
        },id)
      }))
      console.log('accountRef', accountRef);
      // onboard completed
      this.loginStage.next('Onboarding completed')
      const dialog = this.dialog.open(DialogComponent,{data:{title:'Your onboarding is complete.',description:"You can now login to your account and start using the application.",buttonText:'Login'}})
      dialog.closed.subscribe(()=>{
        let url = window.location.href.split('/')
        url.pop()
        url.push('index.html')
        window.location.href = url.join('/') 
      })
    } catch (error) {
      console.log('error', error);
      this.loginStage.next('Error Occured')
      this.onboardingService.stage = 'errorOccured'
      this.onboardingStarted = false;
      this.alertify.presentToast("Some error occured",'error')
    }

  }

  setDefaultAccount(business:UserBusiness){
    let dialog = this.dialog.open(DialogComponent,{data:{title:'Set '+business.name+' as default account?',description:'This will be your default account and you will be logged in to this account by default. Account id #'+business.businessId,buttonText:'Set as default'}})
    dialog.closed.subscribe((res)=>{
      if(res){
        localStorage.setItem('businessId',business.businessId);
        let url = window.location.href.split('/')
        url.pop()
        url.push('index.html')
        window.location.href = url.join('/') 
      }else {
        this.alertify.presentToast('Default account not set','error')
      }
    })
  }
}

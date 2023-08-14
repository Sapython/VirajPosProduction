import { DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { AlertsAndNotificationsService } from '../../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';
import { DataProvider } from '../../../../../../core/services/provider/data-provider.service';
import { SignupService } from '../../../../../../core/services/auth/signup/signup.service';
import { Timestamp } from '@angular/fire/firestore';
import { UserManagementService } from '../../../../../../core/services/auth/user/user-management.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddComponent {
  stage: 'available' | 'checking' | 'unavailable' | 'invalid' | undefined;
  onboardingStage: 'registration' | 'otp' = 'registration';
  previousUsername: string | undefined;
  authOtpVerificationId: string | undefined;
  maskedEmailInvitee: string | undefined;
  checkUsernameFunction = httpsCallable(this.functions, 'userNameAvailable');
  loginForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    accessType: new FormControl('', [Validators.required]),
    accessLevel: new FormControl(''),
    propertiesAllowed: new FormControl(''),
  });
  otpForm: FormGroup = new FormGroup({
    otp: new FormControl('', [Validators.required]),
  });
  accessCodes:AccessGroup[] = [
    { name: 'Menu Management Section', type:'divider',accessCodes:
      [
        { name: 'Add New Menu', accessCode: 'addNewMenu', allowed: false, type:'access' },
        { name: 'Switch Menu', accessCode: 'switchMenu', allowed: false, type:'access' },
        { name: 'Edit Menu', accessCode: 'editMenu', allowed: false, type:'access' },
        {
          name: 'Edit Takeaway Menu',
          accessCode: 'editTakeawayMenu',
          allowed: false,
          type:'access'
        },
        { name: 'Edit Online Menu', accessCode: 'editOnlineMenu', allowed: false, type:'access' },
        { name: 'Edit Dine In Menu', accessCode: 'editDineInMenu', allowed: false, type:'access' },
      ]
    },
    { name: 'Products Section', type:'divider', accessCodes:
      [
        {
          name: 'See Vrajera Categories',
          accessCode: 'seeVrajeraCategories',
          allowed: false,
          type:'access'
        },
        { name: 'See Combos', accessCode: 'seeCombos', allowed: false, type:'access' },
        {
          name: 'See Your Categories',
          accessCode: 'seeYourCategories',
          allowed: false,
          type:'access'
        },
        {
          name: 'See Main Categories',
          accessCode: 'seeMainCategories',
          allowed: false,
          type:'access'
        },
        { name: 'See All Products', accessCode: 'seeAllProducts', allowed: false, type:'access' },
        { name: 'Add New Product', accessCode: 'addNewProduct', allowed: false, type:'access' },
        {
          name: 'Enable Disable Products',
          accessCode: 'enableDisableProducts',
          allowed: false,
          type:'access'
        },
        {
          name: 'Set Taxes On Products',
          accessCode: 'setTaxesOnProducts',
          allowed: false,
          type:'access'
        },
        { name: 'Edit Product', accessCode: 'editProduct', allowed: false, type:'access' },
        { name: 'Can Edit Details', accessCode: 'canEditDetails', allowed: false, type:'access' },
        { name: 'Can Set Printer', accessCode: 'canSetPrinter', allowed: false, type:'access' },
        { name: 'Delete Product', accessCode: 'deleteProduct', allowed: false, type:'access' },
      ]
    },
    { name: 'Recommended Section', type:'divider',accessCodes:[
      {
        name: 'Recommended Categories',
        accessCode: 'recommendedCategories',
        allowed: false,
        type:'access'
      },
      {
        name: 'Edit Recommended Category Settings',
        accessCode: 'editRecommendedCategorySettings',
        allowed: false,
        type:'access'
      },
      {
        name: 'Enable Disable Recommended Products',
        accessCode: 'enableDisableRecommendedProducts',
        allowed: false,
        type:'access'
      },
      {
        name: 'Set Taxes On Recommended Products',
        accessCode: 'setTaxesOnRecommendedProducts',
        allowed: false,
        type:'access'
      },
      {
        name: 'Edit Recommended Product',
        accessCode: 'editRecommendedProduct',
        allowed: false,
        type:'access'
      },
      {
        name: 'Delete Recommended Product',
        accessCode: 'deleteRecommendedProduct',
        allowed: false,
        type:'access'
      },
      { name: 'View Categories', accessCode: 'viewCategories', allowed: false, type:'access' },
      {
        name: 'Add View Category',
        accessCode: 'addViewCategory',
        allowed: false,
        type:'access'
      },
      {
        name: 'Edit View Category',
        accessCode: 'editViewCategory',
        allowed: false,
        type:'access'
      },
      {
        name: 'Delete View Category',
        accessCode: 'deleteViewCategory',
        allowed: false,
        type:'access'
      },
      {
        name: 'Enable Disable View Products',
        accessCode: 'enableDisableViewProducts',
        allowed: false,
        type:'access'
      },
      {
        name: 'Set Taxes On View Products',
        accessCode: 'setTaxesOnViewProducts',
        allowed: false,
        type:'access'
      },
      {
        name: 'Edit View Product',
        accessCode: 'editViewProduct',
        allowed: false,
        type:'access'
      },
      {
        name: 'Delete View Product',
        accessCode: 'deleteViewProduct',
        allowed: false,
        type:'access'
      },
      { name: 'Main Categories', accessCode: 'mainCategories', allowed: false, type:'access' },
      {
        name: 'Enable Disable Main Products',
        accessCode: 'enableDisableMainProducts',
        allowed: false,
        type:'access'
      },
      {
        name: 'Set Taxes On Main Products',
        accessCode: 'setTaxesOnMainProducts',
        allowed: false,
        type:'access'
      },
      {
        name: 'Edit Main Product',
        accessCode: 'editMainProduct',
        allowed: false,
        type:'access'
      },
      {
        name: 'Delete Main Product',
        accessCode: 'deleteMainProduct',
        allowed: false,
        type:'access'
      },
    ] },
    { name: 'Taxes Section', type:'divider', accessCodes:[
      { name: 'Edit Taxes', accessCode: 'editTaxes', allowed: false, type:'access' },
      { name: 'See Taxes', accessCode: 'seeTaxes', allowed: false, type:'access' },
      { name: 'Add New Taxes', accessCode: 'addNewTaxes', allowed: false, type:'access' },
      { name: 'Delete Taxes', accessCode: 'deleteTaxes', allowed: false, type:'access' },
      { name: 'Edit Tax', accessCode: 'editTax', allowed: false, type:'access' },
    ] },
    { name: 'Discount Section', type:'divider', accessCodes:[
      { name: 'Discount', accessCode: 'discount', allowed: false, type:'access' },
      { name: 'See Discount', accessCode: 'seeDiscount', allowed: false, type:'access' },
      {
        name: 'Add New Discounts',
        accessCode: 'addNewDiscounts',
        allowed: false,
        type:'access'
      },
      { name: 'Delete Discounts', accessCode: 'deleteDiscounts', allowed: false, type:'access' },
      { name: 'Edit Discount', accessCode: 'editDiscount', allowed: false, type:'access' },
    ] },
    { name: 'Combos Section', type:'divider', accessCodes:[
      { name: 'Combos', accessCode: 'combos', allowed: false, type:'access' },
      { name: 'See Combos', accessCode: 'seeCombos', allowed: false, type:'access' },
      { name: 'Add New Combos', accessCode: 'addNewCombos', allowed: false, type:'access' },
      { name: 'Delete Combos', accessCode: 'deleteCombos', allowed: false, type:'access' },
      { name: 'Edit Combo', accessCode: 'editCombo', allowed: false, type:'access' },
    ] },
    { name: 'Loyalty Section', type:'divider', accessCodes:[
      { name: 'See Loyalty', accessCode:'seeLoyalty', allowed: false, type:'access'},
      { name: 'Add New Loyalty Settings', accessCode:'addNewLoyaltySettings', allowed: false, type:'access'},
      { name: 'Edit Loyalty Settings', accessCode:'editLoyaltySetting', allowed: false, type:'access'},
      { name: 'Delete Loyalty Settings', accessCode:'deleteLoyaltySetting', allowed: false, type:'access'},
    ] },
    { name: 'Reports Section', type:'divider', accessCodes:[
      {
        name: 'See Order Summary',
        accessCode: 'seeOrderSummary',
        allowed: false,
        type:'access'
      },
      { name: 'See Sale Summary', accessCode: 'seeSaleSummary', allowed: false, type:'access' },
      { name: 'See Reports', accessCode: 'seeReports', allowed: false, type:'access' },
    ] },
    { name: 'Tables Section', type: 'divider', accessCodes:[
      { name: 'View Table', accessCode: 'viewTable', allowed: false, type:'access' },
      {
        name: 'Re Arrange Group Order',
        accessCode: 'reArrangeGroupOrder',
        allowed: false,
        type:'access'
      },
      {
        name: 'Settle From Table',
        accessCode: 'settleFromTable',
        allowed: false,
        type:'access'
      },
      { name: 'Add Table', accessCode: 'addTable', allowed: false, type:'access' },
      { name: 'Delete Table', accessCode: 'deleteTable', allowed: false, type:'access' },
      {
        name: 'Add New Takeaway Token',
        accessCode: 'addNewTakeawayToken',
        allowed: false,
        type:'access'
      },
      {
        name: 'Add New Online Token',
        accessCode: 'addNewOnlineToken',
        allowed: false,
        type:'access'
      },
      {
        name: 'Move And Merge Options',
        accessCode: 'moveAndMergeOptions',
        allowed: false,
        type:'access'
      },
    ] },
    { name: 'Billing Section', type:'divider',accessCodes:[
      { name: 'Punch Kot', accessCode: 'punchKot', allowed: false, type:'access' },
      { name: 'Manage Kot', accessCode: 'manageKot', allowed: false, type:'access' },
      { name: 'Edit Kot', accessCode: 'editKot', allowed: false, type:'access' },
      { name: 'Delete Kot', accessCode: 'deleteKot', allowed: false, type:'access' },
      { name: 'Line Discount', accessCode: 'lineDiscount', allowed: false, type:'access' },
      { name: 'Line Cancel', accessCode: 'lineCancel', allowed: false, type:'access' },
      { name: 'Apply Discount', accessCode: 'applyDiscount', allowed: false, type:'access' },
      { name: 'See Preview', accessCode: 'seePreview', allowed: false, type:'access' },
      { name: 'Split Bill', accessCode: 'splitBill', allowed: false, type:'access' },
      {
        name: 'Set Non Chargeable',
        accessCode: 'setNonChargeable',
        allowed: false,
        type:'access'
      },
      { name: 'Bill Note', accessCode: 'billNote', allowed: false, type:'access' },
      { name: 'Cancel Bill', accessCode: 'cancelBill', allowed: false, type:'access' },
      { name: 'Settle Bill', accessCode: 'settleBill', allowed: false, type:'access' },
      {
        name: 'Write Customer Info',
        accessCode: 'writeCustomerInfo',
        allowed: false,
        type:'access'
      },
    ] },
    { name: 'Settings Section', type:'divider', accessCodes:[
      { name: 'Settings', accessCode: 'settings', allowed: false, type:'access' },
      { name: 'Update Biller', accessCode: 'updateBiller', allowed: false, type:'access' },
      { name: 'About', accessCode: 'about', allowed: false, type:'access' },
      {
        name: 'Read About Settings',
        accessCode: 'readAboutSettings',
        allowed: false,
        type:'access'
      },
      {
        name: 'Set Printer Settings',
        accessCode: 'setPrinterSettings',
        allowed: false,
        type:'access'
      },
      {
        name: 'Change About Settings',
        accessCode: 'changeAboutSettings',
        allowed: false,
        type:'access'
      },
      {
        name: 'Business Settings',
        accessCode: 'businessSettings',
        allowed: false,
        type:'access'
      },
      {
        name: 'Read Business Settings',
        accessCode: 'readBusinessSettings',
        allowed: false,
        type:'access'
      },
      { name: 'Switch Modes', accessCode: 'switchModes', allowed: false, type:'access' },
      { name: 'Change Config', accessCode: 'changeConfig', allowed: false, type:'access' },
      { name: 'Change Printer', accessCode: 'changePrinter', allowed: false, type:'access' },
    ] },
    { name: 'User Management', type:'divider',accessCodes:[
      { name: 'Account Settings', accessCode: 'accountSettings', allowed: false, type:'access' },
      {
        name: 'Read Account Settings',
        accessCode: 'readAccountSettings',
        allowed: false,
        type:'access'
      },
      { name: 'Add Account', accessCode: 'addAccount', allowed: false, type:'access' },
      { name: 'Remove Account', accessCode: 'removeAccount', allowed: false, type:'access' },
    ] },
    { name: 'Payment Method Management', type:'divider',accessCodes:[
      { name: 'Payment Methods', accessCode: 'paymentMethods', allowed: false, type:'access' },
      { name: 'New Method', accessCode: 'newMethod', allowed: false, type:'access' },
      { name: 'Edit Method', accessCode: 'editMethod', allowed: false, type:'access' },
      { name: 'Delete Method', accessCode: 'deleteMethod', allowed: false, type:'access' },
    ] },
    { name: 'Advanced Settings', type:'divider',accessCodes:[
      {
        name: 'Advanced Settings',
        accessCode: 'advancedSettings',
        allowed: false,
        type:'access'
      },
      { name: 'Multiple Discounts', accessCode:'multipleDiscounts', allowed: false, type:'access'},
      { name: 'General Settings', accessCode: 'generalSettings', allowed: false, type:'access' },
      { name: 'See History', accessCode: 'seeHistory', allowed: false, type:'access' },
    ] },
  ];
  constructor(
    private functions: Functions,
    private dialogRef: DialogRef,
    private alertify: AlertsAndNotificationsService,
    public dataProvider: DataProvider,
    private authService: SignupService,
    private userManagement: UserManagementService,
  ) {
    this.loginForm.valueChanges.pipe(debounceTime(600)).subscribe((res) => {
      if (this.previousUsername == res.username) {
        return;
      }
      this.previousUsername = res.username;
      this.stage = 'checking';
      this.checkUsernameFunction({ username: res.username })
        .then((res) => {
          //  console.log(res);
          if (res.data) {
            this.stage = res.data['stage'];
            if (this.stage == 'available') {
              this.addPasswordControl();
            } else if (this.stage == 'unavailable') {
              // this.addPasswordControl();
              // remove all the controls
              this.loginForm.removeControl('password');
              this.loginForm.removeControl('confirmPassword');
            }
          } else {
            this.stage = 'invalid';
          }
        })
        .catch((err) => {
          this.stage = 'invalid';
        });
    });
  }

  addPasswordControl() {
    // check if the controls are already added
    if (
      this.loginForm.contains('password') &&
      this.loginForm.contains('confirmPassword')
    ) {
      return;
    }
    this.loginForm.addControl(
      'email',
      new FormControl('', [Validators.required, Validators.email]),
    );
    this.loginForm.addControl(
      'password',
      new FormControl('', [Validators.required]),
    );
    this.loginForm.addControl(
      'confirmPassword',
      new FormControl('', [Validators.required]),
    );
  }

  async submit() {
    if (this.loginForm.invalid) {
      this.alertify.presentToast('Please fill all the fields');
      return;
    }
    if (this.loginForm.value.password != this.loginForm.value.confirmPassword) {
      this.alertify.presentToast('Passwords do not match');
      return;
    }
    if (this.stage == 'invalid') {
      this.alertify.presentToast('Username is invalid');
      return;
    }
    if (this.loginForm.invalid) return;
    // check the type and then check if either role or properties are set
    if (this.loginForm.value.accessType == 'role' && !this.loginForm.value.accessLevel) return;
    if (this.loginForm.value.accessType == 'custom' && !this.loginForm.value.propertiesAllowed) return;
    if (this.stage == 'unavailable') {
      if (
        await this.dataProvider.confirm(
          'This username is already present',
          [1],
          {
            description:
              'This username is already present. Are you sure you want to invite him. He will be able to access the account once he accepts the invitation',
            buttons: ['Cancel', 'Invite'],
          },
        )
      ) {
        this.dataProvider.loading = true;
        this.userManagement
          .addExistingUser(
            this.loginForm.value.username,
            this.loginForm.value.accessType,
            {
              role: this.loginForm.value.accessLevel,
              propertiesAllowed: this.loginForm.value.propertiesAllowed,
            }
          )
          .then((res) => {
            console.log(res);
            if (res.data['status'] == 'success' && res.data['authId']) {
              this.authOtpVerificationId = res.data['authId'];
              this.onboardingStage = 'otp';
              this.maskedEmailInvitee = res.data['maskedEmail']
              this.alertify.presentToast(res.data['message']);
            } else {
              this.alertify.presentToast('Something went wrong');
            }
          })
          .catch((err) => {
            console.log(err);
            this.alertify.presentToast(err.message);
          })
          .finally(() => {
            this.dataProvider.loading = false;
          });
      } else {
        this.alertify.presentToast('Invitation Cancelled');
        // this.dialogRef.close()
      }
    } else if (this.stage == 'available') {
      if (
        await this.dataProvider.confirm(
          'Are you sure you want to add this account ?',
          [1],
        )
      ) {
        if(this.loginForm.value.accessType == 'role'){
          var access:any = {
            accessType: 'role',
            role:this.loginForm.value.accessLevel
          }
        } else {
          var access:any = {
            accessType: 'custom',
            propertiesAllowed:this.loginForm.value.propertiesAllowed
          }
        }
        let accountRes = await this.authService.signUpWithUserAndPassword(
          this.loginForm.value.username,
          this.loginForm.value.password,
          {
            business: {
              access: {
                ...access,
                lastUpdated: Timestamp.now(),
                updatedBy: this.dataProvider.currentUser.username,
              },
              address: this.dataProvider.currentBusiness.address,
              businessId: this.dataProvider.currentBusiness.businessId,
              joiningDate: Timestamp.now(),
              name: this.dataProvider.currentBusiness.hotelName,
            },
            email: this.loginForm.value.email,
            noSignIn: true,
          },
        );
        if (accountRes['username']) {
          let resolvedUser = accountRes as { username: string };
          return this.dialogRef.close({
            username: resolvedUser.username,
            access: this.loginForm.value.accessLevel,
          });
        } else {
          return this.alertify.presentToast('Something went wrong');
        }
      } else {
        this.dialogRef.close();
      }
    } else {
      this.alertify.presentToast('Something went wrong');
    }
  }

  async cancel() {
    if (
      await this.dataProvider.confirm('Are you sure you want to cancel ?', [1])
    ) {
      this.dialogRef.close({ cancelled: true });
    }
  }

  verifyOtp() {
    this.dataProvider.loading = true;
    this.userManagement
      .verifyOtpExistingUser(
        this.loginForm.value.username,
        this.otpForm.value.otp,
        this.authOtpVerificationId,
      )
      .then((res) => {
        console.log(res);
        if (res.data['status'] == 'success') {
          this.alertify.presentToast('User added successfully');
          this.dialogRef.close();
        }
      })
      .catch((err) => {
        this.alertify.presentToast(err.message);
      })
      .finally(() => {
        this.dataProvider.loading = false;
      });
  }
}

export interface AccessCode { name: string; accessCode: string; allowed: boolean, type:'access' }
export interface AccessGroup { name: string; type:'divider', accessCodes:AccessCode[] }
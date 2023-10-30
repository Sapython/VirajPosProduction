import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import Fuse from 'fuse.js';
import { Subscription, debounceTime } from 'rxjs';
@Component({
  selector: 'app-select-properties',
  templateUrl: './select-properties.component.html',
  styleUrls: ['./select-properties.component.scss']
})
export class SelectPropertiesComponent implements OnDestroy {
  accessCodes:AccessGroup[] = [
    { name: 'Menu Management Section', type:'divider',accessCodes:
      [
        { name: 'Add New Menu', accessCode: 'addNewMenu', allowed: false, type:'access', description:'Allows a user to add a new menu with new dishes.' },
        { name: 'Switch Menu', accessCode: 'switchMenu', allowed: false, type:'access', description:'Allows a user to switch the selected menu for a given mode.' },
        { name: 'Edit Menu', accessCode: 'editMenu', allowed: false, type:'access', description:'Allows a user to edit the selected menu for a given mode.' },
        {
          name: 'Edit Takeaway Menu',
          accessCode: 'editTakeawayMenu',
          allowed: false,
          type:'access',
          description:'Allows a user to edit menu selected in takeaway mode.'
        },
        { name: 'Edit Online Menu', accessCode: 'editOnlineMenu', allowed: false, type:'access',
          description: 'Allows a user to edit menu selected in online mode.' },
        { name: 'Edit Dine In Menu', accessCode: 'editDineInMenu', allowed: false, type:'access', description: 'Allows a user to edit menu selected in dine in mode.' },
      ]
    },
    { name: 'Products Section', type:'divider', accessCodes:
      [
        {
          name: 'See Vrajera Categories',
          accessCode: 'seeVrajeraCategories',
          allowed: false,
          type:'access',
          description:'Allows a user to see the special categories like, most selling, high, range, low range.'
        },
        { name: 'See Combos', accessCode: 'seeCombos', allowed: false, type:'access', description:'Allows a user to see the combos of a selected menu.' },
        {
          name: 'See Your Categories',
          accessCode: 'seeYourCategories',
          allowed: false,
          type:'access',
          description:'Allows a user to see their custom categories for a menu.'
        },
        {
          name: 'See Main Categories',
          accessCode: 'seeMainCategories',
          allowed: false,
          type:'access',
          description:'Allows a user to see the main categories of a menu.'
        },
        { name: 'See All Products', accessCode: 'seeAllProducts', allowed: false, type:'access', description:'Allows a user to see all the products of a menu.' },
        { name: 'Add New Product', accessCode: 'addNewProduct', allowed: false, type:'access', description:'Allows a user to add a new product to a menu.' },
        {
          name: 'Enable Disable Products',
          accessCode: 'enableDisableProducts',
          allowed: false,
          type:'access',
          description:'Allows a user to enable or disable products of a menu.'
        },
        {
          name: 'Set Taxes On Products',
          accessCode: 'setTaxesOnProducts',
          allowed: false,
          type:'access',
          description:'Allows a user to set taxes on products of a menu.'
        },
        { name: 'Edit Product', accessCode: 'editProduct', allowed: false, type:'access', description:'Allows a user to edit a product of a menu.' },
        { name: 'Can Edit Details', accessCode: 'canEditDetails', allowed: false, type:'access', description:'Allows a user to edit the details of a product of a menu.' },
        { name: 'Can Set Printer', accessCode: 'canSetPrinter', allowed: false, type:'access', description:'Allows a user to set the printer of a product of a menu.' },
        { name: 'Delete Product', accessCode: 'deleteProduct', allowed: false, type:'access', description:'Allows a user to delete a product of a menu.' },
      ]
    },
    { name: 'Recommended Section', type:'divider',accessCodes:[
      {
        name: 'Recommended Categories',
        accessCode: 'recommendedCategories',
        allowed: false,
        type:'access',
        description:'Allows a user to see the categories of the Recommended menu.'
      },
      {
        name: 'Edit Recommended Category Settings',
        accessCode: 'editRecommendedCategorySettings',
        allowed: false,
        type:'access',
        description:'Allows a user to edit the settings of the Recommended menu.'
      },
      {
        name: 'Enable Disable Recommended Products',
        accessCode: 'enableDisableRecommendedProducts',
        allowed: false,
        type:'access',
        description:'Allows a user to enable or disable products of the Recommended menu.'
      },
      {
        name: 'Set Taxes On Recommended Products',
        accessCode: 'setTaxesOnRecommendedProducts',
        allowed: false,
        type:'access',
        description:'Allows a user to set taxes on products of the Recommended menu.'
      },
      {
        name: 'Edit Recommended Product',
        accessCode: 'editRecommendedProduct',
        allowed: false,
        type:'access',
        description:'Allows a user to edit a product of the Recommended menu.'
      },
      {
        name: 'Delete Recommended Product',
        accessCode: 'deleteRecommendedProduct',
        allowed: false,
        type:'access',
        description:'Allows a user to delete a product of the Recommended menu.'
      },
      { name: 'View Categories', accessCode: 'viewCategories', allowed: false, type:'access' },
      {
        name: 'Add View Category',
        accessCode: 'addViewCategory',
        allowed: false,
        type:'access',
        description:'Allows a user to add a new category to the Recommended menu.'
      },
      {
        name: 'Edit View Category',
        accessCode: 'editViewCategory',
        allowed: false,
        type:'access',
        description:'Allows a user to edit a category of the Recommended menu.'
      },
      {
        name: 'Delete View Category',
        accessCode: 'deleteViewCategory',
        allowed: false,
        type:'access',
        description:'Allows a user to delete a category of the Recommended menu.'
      },
      {
        name: 'Enable Disable View Products',
        accessCode: 'enableDisableViewProducts',
        allowed: false,
        type:'access',
        description:'Allows a user to enable or disable products of the Recommended menu.'
      },
      {
        name: 'Set Taxes On View Products',
        accessCode: 'setTaxesOnViewProducts',
        allowed: false,
        type:'access',
        description:'Allows a user to set taxes on products of the Recommended menu.'
      },
      {
        name: 'Edit View Product',
        accessCode: 'editViewProduct',
        allowed: false,
        type:'access',
        description:'Allows a user to edit a product of the Recommended menu.'
      },
      {
        name: 'Delete View Product',
        accessCode: 'deleteViewProduct',
        allowed: false,
        type:'access',
        description:'Allows a user to delete a product of the Recommended menu.'
      },
      { name: 'Main Categories', accessCode: 'mainCategories', allowed: false, type:'access', description:'Allows a user to see the categories of the Main menu.' },
      {
        name: 'Enable Disable Main Products',
        accessCode: 'enableDisableMainProducts',
        allowed: false,
        type:'access',
        description:'Allows a user to enable or disable products of the Main menu.'
      },
      {
        name: 'Set Taxes On Main Products',
        accessCode: 'setTaxesOnMainProducts',
        allowed: false,
        type:'access',
        description:'Allows a user to set taxes on products of the Main menu.'
      },
      {
        name: 'Edit Main Product',
        accessCode: 'editMainProduct',
        allowed: false,
        type:'access',
        description:'Allows a user to edit a product of the Main menu.'
      },
      {
        name: 'Delete Main Product',
        accessCode: 'deleteMainProduct',
        allowed: false,
        type:'access',
        description:'Allows a user to delete a product of the Main menu.'
      },
    ] },
    { name: 'Taxes Section', type:'divider', accessCodes:[
      { name: 'Edit Taxes', accessCode: 'editTaxes', allowed: false, type:'access', description:'Allows a user to edit the taxes of a menu.' },
      { name: 'See Taxes', accessCode: 'seeTaxes', allowed: false, type:'access', description:'Allows a user to see the taxes of a menu.' },
      { name: 'Add New Taxes', accessCode: 'addNewTaxes', allowed: false, type:'access', description:'Allows a user to add a new tax to a menu.' },
      { name: 'Delete Taxes', accessCode: 'deleteTaxes', allowed: false, type:'access', description:'Allows a user to delete a tax of a menu.' },
      { name: 'Edit Tax', accessCode: 'editTax', allowed: false, type:'access', description:'Allows a user to edit a tax of a menu.' },
    ] },
    { name: 'Discount Section', type:'divider', accessCodes:[
      { name: 'Discount', accessCode: 'discount', allowed: false, type:'access', description:'Allows a user to see the discounts of a menu.' },
      { name: 'See Discount', accessCode: 'seeDiscount', allowed: false, type:'access', description:'Allows a user to see the discounts of a menu.' },
      {
        name: 'Add New Discounts',
        accessCode: 'addNewDiscounts',
        allowed: false,
        type:'access',
        description:'Allows a user to add a new discount to a menu.'
      },
      { name: 'Delete Discounts', accessCode: 'deleteDiscounts', allowed: false, type:'access', description:'Allows a user to delete a discount of a menu.' },
      { name: 'Edit Discount', accessCode: 'editDiscount', allowed: false, type:'access', description:'Allows a user to edit a discount of a menu.' },
    ] },
    { name: 'Combos Section', type:'divider', accessCodes:[
      { name: 'Combos', accessCode: 'combos', allowed: false, type:'access', description:'Allows a user to see the combos of a menu.' },
      { name: 'See Combos', accessCode: 'seeCombos', allowed: false, type:'access', description:'Allows a user to see the combos of a menu.' },
      { name: 'Add New Combos', accessCode: 'addNewCombos', allowed: false, type:'access', description:'Allows a user to add a new combo to a menu.' },
      { name: 'Delete Combos', accessCode: 'deleteCombos', allowed: false, type:'access', description:'Allows a user to delete a combo of a menu.' },
      { name: 'Edit Combo', accessCode: 'editCombo', allowed: false, type:'access', description:'Allows a user to edit a combo of a menu.' },
    ] },
    { name: 'Loyalty Section', type:'divider', accessCodes:[
      { name: 'See Loyalty', accessCode:'seeLoyalty', allowed: false, type:'access', description:'Allows a user to see the loyalty settings of a menu.' },
      { name: 'Add New Loyalty Settings', accessCode:'addNewLoyaltySettings', allowed: false, type:'access', description:'Allows a user to add a new loyalty setting to a menu.' },
      { name: 'Edit Loyalty Settings', accessCode:'editLoyaltySetting', allowed: false, type:'access', description:'Allows a user to edit a loyalty setting of a menu.'},
      { name: 'Delete Loyalty Settings', accessCode:'deleteLoyaltySetting', allowed: false, type:'access', description:'Allows a user to delete a loyalty setting of a menu.'},
    ] },
    { name: 'Reports Section', type:'divider', accessCodes:[
      {
        name: 'See Order Summary',
        accessCode: 'seeOrderSummary',
        allowed: false,
        type:'access',
        description:'Allows a user to see the order summary of a menu.'
      },
      { name: 'See Sale Summary', accessCode: 'seeSaleSummary', allowed: false, type:'access', description:'Allows a user to see the sale summary of a menu.' },
      { name: 'See Reports', accessCode: 'seeReports', allowed: false, type:'access', description:'Allows a user to see the reports of a menu.' },
    ] },
    { name: 'Tables Section', type: 'divider', accessCodes:[
      { name: 'View Table', accessCode: 'viewTable', allowed: false, type:'access', description:'Allows a user to see the tables of a menu.' },
      {
        name: 'Re Arrange Group Order',
        accessCode: 'reArrangeGroupOrder',
        allowed: false,
        type:'access',
        description:'Allows a user to re arrange the group order of a menu.'
      },
      {
        name: 'Settle From Table',
        accessCode: 'settleFromTable',
        allowed: false,
        type:'access',
        description:'Allows a user to settle from the table of a menu.'
      },
      { name: 'Add Table', accessCode: 'addTable', allowed: false, type:'access', description:'Allows a user to add a new table to a menu.' },
      { name: 'Delete Table', accessCode: 'deleteTable', allowed: false, type:'access', description:'Allows a user to delete a table of a menu.' },
      {
        name: 'Add New Takeaway Token',
        accessCode: 'addNewTakeawayToken',
        allowed: false,
        type:'access',
        description:'Allows a user to add a new takeaway token to a menu.'
      },
      {
        name: 'Add New Online Token',
        accessCode: 'addNewOnlineToken',
        allowed: false,
        type:'access',
        description:'Allows a user to add a new online token to a menu.'
      },
      {
        name: 'Move And Merge Options',
        accessCode: 'moveAndMergeOptions',
        allowed: false,
        type:'access',
        description:'Allows a user to move and merge options of a menu.'
      },
    ] },
    { name: 'Billing Section', type:'divider',accessCodes:[
      { name: 'Punch Kot', accessCode: 'punchKot', allowed: false, type:'access', description:'Allows a user to punch a kot of a menu.' },
      { name: 'Manage Kot', accessCode: 'manageKot', allowed: false, type:'access', description:'Allows a user to manage a kot of a menu.' },
      { name: 'Edit Kot', accessCode: 'editKot', allowed: false, type:'access', description:'Allows a user to edit a kot of a menu.' },
      { name: 'Delete Kot', accessCode: 'deleteKot', allowed: false, type:'access', description:'Allows a user to delete a kot of a menu.' },
      { name: 'Line Discount', accessCode: 'lineDiscount', allowed: false, type:'access', description:'Allows a user to give a line discount of a menu.' },
      { name: 'Line Cancel', accessCode: 'lineCancel', allowed: false, type:'access', description:'Allows a user to give a line cancel of a menu.' },
      { name: 'Apply Discount', accessCode: 'applyDiscount', allowed: false, type:'access', description:'Allows a user to apply a discount of a menu.' },
      { name: 'See Preview', accessCode: 'seePreview', allowed: false, type:'access', description:'Allows a user to see the preview of a menu.' },
      { name: 'Split Bill', accessCode: 'splitBill', allowed: false, type:'access', description:'Allows a user to split a bill of a menu.' },
      {
        name: 'Set Non Chargeable',
        accessCode: 'setNonChargeable',
        allowed: false,
        type:'access',
        description:'Allows a user to set a non chargeable of a menu.'
      },
      { name: 'Bill Note', accessCode: 'billNote', allowed: false, type:'access', description:'Allows a user to give a bill note of a menu.' },
      { name: 'Cancel Bill', accessCode: 'cancelBill', allowed: false, type:'access', description:'Allows a user to cancel a bill of a menu.' },
      { name: 'Settle Bill', accessCode: 'settleBill', allowed: false, type:'access', description:'Allows a user to settle a bill of a menu.' },
      {
        name: 'Write Customer Info',
        accessCode: 'writeCustomerInfo',
        allowed: false,
        type:'access',
        description:'Allows a user to write customer info of a menu.'
      },
    ] },
    { name: 'Settings Section', type:'divider', accessCodes:[
      { name: 'Settings', accessCode: 'settings', allowed: false, type:'access', description:'Allows a user to see the settings of a menu.' },
      { name: 'Update Biller', accessCode: 'updateBiller', allowed: false, type:'access', description:'Allows a user to update the biller of a menu.' },
      { name: 'About', accessCode: 'about', allowed: false, type:'access', description:'Allows a user to see the about of a menu.' },
      {
        name: 'Read About Settings',
        accessCode: 'readAboutSettings',
        allowed: false,
        type:'access',
        description:'Allows a user to read the about settings of a menu.'
      },
      {
        name: 'Set Printer Settings',
        accessCode: 'setPrinterSettings',
        allowed: false,
        type:'access',
        description:'Allows a user to set the printer settings of a menu.'
      },
      {
        name: 'Change About Settings',
        accessCode: 'changeAboutSettings',
        allowed: false,
        type:'access',
        description:'Allows a user to change the about settings of a menu.'
      },
      {
        name: 'Business Settings',
        accessCode: 'businessSettings',
        allowed: false,
        type:'access',
        description:'Allows a user to see the business settings of a menu.'
      },
      {
        name: 'Read Business Settings',
        accessCode: 'readBusinessSettings',
        allowed: false,
        type:'access',
        description:'Allows a user to read the business settings of a menu.'
      },
      { name: 'Switch Modes', accessCode: 'switchModes', allowed: false, type:'access', description:'Allows a user to switch the modes of a menu.' },
      { name: 'Change Config', accessCode: 'changeConfig', allowed: false, type:'access', description:'Allows a user to change the config of a menu.' },
      { name: 'Change Printer', accessCode: 'changePrinter', allowed: false, type:'access', description:'Allows a user to change the printer of a menu.' },
    ] },
    { name: 'User Management', type:'divider',accessCodes:[
      { name: 'Account Settings', accessCode: 'accountSettings', allowed: false, type:'access', description:'Allows a user to see the account settings of a menu.' },
      {
        name: 'Read Account Settings',
        accessCode: 'readAccountSettings',
        allowed: false,
        type:'access',
        description:'Allows a user to read the account settings of a menu.'
      },
      { name: 'Add Account', accessCode: 'addAccount', allowed: false, type:'access', description:'Allows a user to add a new account to a menu.' },
      { name: 'Remove Account', accessCode: 'removeAccount', allowed: false, type:'access', description:'Allows a user to remove an account of a menu.' },
    ] },
    { name: 'Payment Method Management', type:'divider',accessCodes:[
      { name: 'Payment Methods', accessCode: 'paymentMethods', allowed: false, type:'access', description:'Allows a user to see the payment methods of a menu.' },
      { name: 'New Method', accessCode: 'newMethod', allowed: false, type:'access', description:'Allows a user to add a new method to a menu.' },
      { name: 'Edit Method', accessCode: 'editMethod', allowed: false, type:'access', description:'Allows a user to edit a method of a menu.' },
      { name: 'Delete Method', accessCode: 'deleteMethod', allowed: false, type:'access', description:'Allows a user to delete a method of a menu.' },
    ] },
    { name: 'Advanced Settings', type:'divider',accessCodes:[
      {
        name: 'Advanced Settings',
        accessCode: 'advancedSettings',
        allowed: false,
        type:'access',
        description:'Allows a user to see the advanced settings of a menu.'
      },
      { name: 'Multiple Discounts', accessCode:'multipleDiscounts', allowed: false, type:'access', description:'Allows a user to see the multiple discounts of a menu.' },
      { name: 'General Settings', accessCode: 'generalSettings', allowed: false, type:'access', description:'Allows a user to see the general settings of a menu.' },
      { name: 'See History', accessCode: 'seeHistory', allowed: false, type:'access', description:'Allows a user to see the history of a menu.' },
    ] },
  ];
  filteredAccessCodes:AccessGroup[] = [];
  searchControl:FormControl = new FormControl('');
  fuseAccessGroupSearchInstance:Fuse<AccessGroup> = new Fuse(structuredClone(this.accessCodes),{keys:['accessCodes.name','accessCodes.description']});
  fuseAccessCodeSearchInstance:Fuse<AccessCode> = new Fuse([],{keys:['name','description']});
  allowedAccessCodes:string[] = [];
  searchControlSubscription:Subscription = Subscription.EMPTY;
  constructor(public dialogRef:DialogRef, @Inject(DIALOG_DATA) public data:string[]){
    this.allowedAccessCodes = data;
    this.accessCodes.forEach((accessGroup)=>{
      accessGroup.accessCodes.forEach((accessCode)=>{
        accessCode.allowed = this.allowedAccessCodes.includes(accessCode.accessCode);
      });
    });
    this.searchControlSubscription = this.searchControl.valueChanges.pipe(debounceTime(400)).subscribe((data)=>{
      console.log("Search value changed",data);
      if (data == '') {
        this.filteredAccessCodes=[];
        this.accessCodes.forEach((accessGroup)=>{
          accessGroup.accessCodes.forEach((accessCode)=>{
            accessCode.allowed = this.allowedAccessCodes.includes(accessCode.accessCode);
          });
        });
        return
      }
      this.filteredAccessCodes = this.fuseAccessGroupSearchInstance.search(data).map((result)=>{
        this.fuseAccessCodeSearchInstance.setCollection(result.item.accessCodes);
        let res = this.fuseAccessCodeSearchInstance.search(data);
        result.item.accessCodes = res.map((result)=>{
          result.item.allowed = this.allowedAccessCodes.includes(result.item.accessCode);
          return result.item;
        });
        return result.item;
      }).filter((item)=>{
        return item.accessCodes.length
      });
    });
  }
  ngOnDestroy(): void {
    this.searchControlSubscription.unsubscribe();
  }

  switchAccess(event:any,accessCode:string){
    if(event.checked){
      // this.allowedAccessCodes.push(accessCode);
      this.allowedAccessCodes = [...new Set([...this.allowedAccessCodes,accessCode])];
    } else {
      this.allowedAccessCodes = this.allowedAccessCodes.filter((code)=>code!=accessCode);
    }
    console.log("Switched access",event);
  }
}
export interface AccessCode { name: string; accessCode: string; allowed: boolean, type:'access', description?:string }
export interface AccessGroup { name: string; type:'divider', accessCodes:AccessCode[] }
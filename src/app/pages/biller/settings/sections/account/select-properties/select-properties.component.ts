import { Component } from '@angular/core';

@Component({
  selector: 'app-select-properties',
  templateUrl: './select-properties.component.html',
  styleUrls: ['./select-properties.component.scss']
})
export class SelectPropertiesComponent {
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
}
export interface AccessCode { name: string; accessCode: string; allowed: boolean, type:'access', description?:string }
export interface AccessGroup { name: string; type:'divider', accessCodes:AccessCode[] }
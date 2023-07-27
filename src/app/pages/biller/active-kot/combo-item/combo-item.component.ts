import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Combo, ComboCategoryCategorized, ComboTypeProductWiseCategorized } from '../../../../types/combo.structure';
import { ApplicableCombo } from '../../../../core/constructors/comboKot/comboKot';
import { zoomInOnEnterAnimation, zoomOutOnLeaveAnimation } from 'angular-animations';
import { Product } from '../../../../types/product.structure';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-combo-item',
  templateUrl: './combo-item.component.html',
  styleUrls: ['./combo-item.component.scss'],
  animations:[zoomInOnEnterAnimation({duration:300}),
    zoomOutOnLeaveAnimation({duration:300}),]
})
export class ComboItemComponent {
  @Input() combo:ApplicableCombo;
  @Input() activeKotIndex:number = 0;
  @Input() kotId:string = '';
  @Input() active: boolean = true;
  @Input() editMode:boolean = false;
  @Input() newCombo:boolean = false;
  @Output() delete: EventEmitter<any> = new EventEmitter();
  
  constructor(private dataProvider:DataProvider){}
  addProductQuantity(type:ComboTypeProductWiseCategorized,category:ComboCategoryCategorized,item:Product){
    this.combo.increaseProductQuantity(type,category,item)
  }
  removeProductQuantity(type:ComboTypeProductWiseCategorized,category:ComboCategoryCategorized,item:Product){
    this.combo.decreaseProductQuantity(type,category,item)
  }
  setProductQuantity(type:ComboTypeProductWiseCategorized,category:ComboCategoryCategorized,item:Product,quantity:number){
    this.combo.setProductQuantity(type,category,item,quantity)
  }

  activateCombo(){
    this.dataProvider.currentApplicableCombo = this.combo;
    this.dataProvider.currentCombo = this.combo.combo;
    this.dataProvider.currentComboType = undefined;
    this.dataProvider.currentComboTypeCategory = undefined;
    let state = this.dataProvider.productPanelStateValue;
    if (state=='products'){
      console.log("switched",state);
      this.dataProvider.productPanelState.next('combos');
    }
    this.dataProvider.searchResults.next(false)
    console.log("openCombo",this.dataProvider.currentMenu.combos);
    this.dataProvider.comboSelected.next(this.dataProvider.currentMenu.combos);
    console.log("openCombo",this.dataProvider.currentMenu.combos);
  }

  get disabled(){
    return (!this.dataProvider.currentApplicableCombo) || (this.dataProvider.currentApplicableCombo && this.dataProvider.currentApplicableCombo.id !== this.combo.id)
  }
}

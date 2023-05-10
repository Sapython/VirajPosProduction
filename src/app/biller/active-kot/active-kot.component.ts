import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataProvider } from '../../provider/data-provider.service';
import { Product } from '../constructors';
import { Kot } from '../Kot';
import { fadeInLeftOnEnterAnimation, fadeInOnEnterAnimation, fadeInRightOnEnterAnimation, fadeOutLeftOnLeaveAnimation, fadeOutOnLeaveAnimation, fadeOutRightOnLeaveAnimation, slideInLeftOnEnterAnimation, slideOutRightOnLeaveAnimation, zoomInOnEnterAnimation, zoomOutOnLeaveAnimation } from 'angular-animations';
@Component({
  selector: 'app-active-kot',
  templateUrl: './active-kot.component.html',
  styleUrls: ['./active-kot.component.scss'],
  animations: [
    zoomInOnEnterAnimation({duration:300}),
    zoomOutOnLeaveAnimation({duration:300}),
  ],
})
export class ActiveKotComponent implements OnChanges {
  kots: Kot[] = [];
  allKot: Kot[] = [];
  labels: { color: { color: string; contrast: string }; name: string }[] = [];
  activeKotIndex: number = 0;
  activeKotSubscription: Subscription = Subscription.EMPTY;
  kotNoColors:{color:string,contrast:string}[] =[
    {color:'#4dc9f6',contrast:'#000'},
    {color:'#f67019',contrast: '#fff'},
    {color:'#f53794',contrast: '#fff'},
    {color:'#537bc4',contrast: '#fff'},
    {color:'#acc236',contrast: '#fff'},
    {color:'#166a8f',contrast: '#fff'},
    {color:'#00a950',contrast: '#fff'},
    {color:'#58595b',contrast: '#fff'},
    {color:'#8549ba',contrast: '#fff'},
  ];
  actionSheetExpanded: boolean = false;
  constructor(public dataProvider: DataProvider) {
    this.dataProvider.billAssigned.subscribe(() => {
      console.log("this.dataProvider.currentBill",this.dataProvider.currentBill);
      this.generateLabels();
      if (this.dataProvider.currentBill) {
        this.kots = this.dataProvider.currentBill.kots.filter((kot)=>kot.stage == 'active') || []
        this.activeKotSubscription.unsubscribe();
        this.activeKotSubscription =
          this.dataProvider.currentBill.updated.subscribe((bill: any) => {
            this.generateLabels();
            if (!this.dataProvider.currentBill) {
              this.activeKotSubscription.unsubscribe();
              return;
            }
            if (this.dataProvider.currentBill.kots) {
              this.allKot = this.dataProvider.currentBill.kots;
              let activeKot = this.dataProvider.currentBill.kots.find(
                (kot: Kot) => kot.stage === 'active' || kot.stage === 'edit'
              );
              // console.log("GENO 2", this.dataProvider.currentBill.kots);
              this.activeKotIndex =
                this.dataProvider.currentBill.kots.findIndex(
                  (kot: Kot) => kot.stage === 'active' || kot.stage === 'edit'
                );
              console.log('this.activeKotIndex', this.activeKotIndex);
              if (activeKot) {
                this.kots = [activeKot];
              } else {
                this.kots = [];
              }
              // console.log("GENO 3",this.kots);
            } else {
              this.kots = [];
            }
          });
      }
    });
    this.dataProvider.manageKotChanged.subscribe((state: boolean) => {
      this.allKot = this.dataProvider.currentBill?.kots || [];
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.generateLabels();
  }

  generateLabels() {
    this.labels = [];
    if (this.dataProvider.currentBill && this.dataProvider.currentBill.kots) {
      for (let i = 0; i < this.dataProvider.currentBill.kots.length; i++) {
        this.labels.push({
          color: this.kotNoColors[i % this.kotNoColors.length],
          name: this.dataProvider.currentBill.kots[i].id,
        });
      }
    }
    console.log('this.labels', this.labels);
  }

  delete(product: Product) {
    if (this.dataProvider.currentBill?.editKotMode) {
      const index = this.dataProvider.currentBill?.editKotMode.newKot.findIndex(
        (item) => item.id === product.id
      );
      this.dataProvider.currentBill?.editKotMode.newKot.splice(index, 1);
      this.dataProvider.currentBill.calculateBill();
    } else {
      this.dataProvider.currentBill?.removeProduct(product, this.activeKotIndex);
    }
  }

  printKot(kot: Kot) {
    this.dataProvider.currentBill?.printKot(kot,'reprintKot');
  }

  deleteKot(kot: Kot) {
    this.dataProvider.currentBill?.deleteKot(kot);
  }

  editKot(kot: Kot) {
    this.dataProvider.currentBill?.editKot(kot);
  }

  saveEditedKot(kot: Kot) {}

  get showImage() {
    if (this.dataProvider.currentBill) {
      if (this.dataProvider.currentBill.kots.length > 0) {
        if (this.dataProvider.currentBill.editKotMode) {
          if (this.dataProvider.currentBill.editKotMode.newKot.length > 0) {
            return false;
          }
        } else if (this.kots.length>0 && this.kots[0].products.length > 0) {
          return false;
        } else if (this.dataProvider.manageKot && this.allKot.reduce((acc, curr) => acc + curr.products.length,0) > 0){
          return false;
        }
      }
    }
    return true;

  }
}

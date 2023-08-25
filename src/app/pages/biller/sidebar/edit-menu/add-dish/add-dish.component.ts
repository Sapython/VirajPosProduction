import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Product, portionColor } from '../../../../../types/product.structure';
import { ElectronService } from '../../../../../core/services/electron/electron.service';
import { MenuManagementService } from '../../../../../core/services/database/menuManagement/menu-management.service';
import { Menu } from '../../../../../types/menu.structure';
import { Category } from '../../../../../types/category.structure';

@Component({
  selector: 'app-add-dish',
  templateUrl: './add-dish.component.html',
  styleUrls: ['./add-dish.component.scss'],
})
export class AddDishComponent {
  type: string[] = ['veg', 'non-veg'];
  predefinedColors: portionColor[] = [
    {
      color: '#008000',
      contrast: '#ffffff',
    },
    {
      color: '#ff6347',
      contrast: '#ffffff',
    },
    {
      color: '#ffa500',
      contrast: '#ffffff',
    },
    {
      color: '#ffff00',
      contrast: '#000000',
    },
    {
      color: '#0099ff',
      contrast: '#ffffff',
    },
  ];
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
  portions: {
    portionName: string;
    portionSize: number;
    portionColor: portionColor;
  }[] = [];
  printers: string[] = [];
  newDishForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    price: new FormControl('', Validators.required),
    type: new FormControl('', Validators.required),
    tag: new FormControl(''),
    specificPrinter: new FormControl(''),
    sellByAvailable: new FormControl(false),
    mainCategory: new FormControl('',this.data?.mainCategories?.length ? Validators.required : []),
  });
  defaultPrinters: { billPrinter: string; kotPrinter: string } = {
    billPrinter: '',
    kotPrinter: '',
  };
  localPrinterConfig:any[] = [];

  viewCategories: ExtendedCategory[] = [];

  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA)
    public data: { mode: 'add' | 'edit'; product?: Product, menu:Menu, mainCategories: Category[], viewCategories: Category[] },
    private electronService: ElectronService,
    private menuManagementService:MenuManagementService
  ) {
    if (data.mode == 'edit') {
      this.newDishForm.patchValue({...data.product,tag:data.product.tags[0].name});
      this.newDishForm.controls.tag.setValue(data.product.tags[0].name);
       console.log(this.newDishForm.value,"this.tags",this.tags);
    }
    this.viewCategories = this.data?.viewCategories?.map((category) => {
      return { ...category, selected: false };
    });
  }

  async ngOnInit(): Promise<void> {
    if(this.data.menu){
      this.menuManagementService.getDefaultPrinter(this.data.menu).then((printers)=>{
        this.defaultPrinters = printers;
        console.log("Default printers",this.defaultPrinters);
      })
      this.menuManagementService.getPrinterList(this.data.menu).then((printers)=>{
        this.localPrinterConfig = printers;
        console.log("Local config",this.localPrinterConfig);
      })
    }
    // let localPrinters = await this.electronService.getPrinters();
    // this.printers =
    //   localPrinters?.length > 0 ? localPrinters : ['Test 1', 'Test 2'];
  }

  addVariant() {
    this.portions.push({
      portionName: '',
      portionSize: 0,
      portionColor: this.predefinedColors[0],
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  removeVariant(i: number) {
    this.portions.splice(i, 1);
  }

  addDish() {
    if (this.newDishForm.invalid) {
      alert('Please fill all the fields');
      return;
    }
    if (this.data?.mainCategories?.length && !this.newDishForm.value.mainCategory){
      alert('Please select a main category');
      return;
    }
    this.dialogRef.close({
      ...this.newDishForm.value,
      tags: this.newDishForm.value.tag ? [this.newDishForm.value.tag] : [],
      viewCategories: this.viewCategories ? this.viewCategories : [],
    });
  }

  switchColor(event: any, i: number) {
    //  console.log(event,i);
  }
}

interface ExtendedCategory extends Category {
  selected: boolean;
}

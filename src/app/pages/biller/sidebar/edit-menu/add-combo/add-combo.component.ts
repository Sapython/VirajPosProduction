import {
  Component,
  ElementRef,
  Inject,
  ViewChild,
  inject,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ComboType,
  TypeCategory,
  productTree,
} from '../../../../../types/combo.structure';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ModeConfig } from '../../../../../core/constructors/menu/menu';
import { FileStorageService } from '../../../../../core/services/database/fileStorage/file-storage.service';
import { DataProvider } from '../../../../../core/services/provider/data-provider.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, startWith, map } from 'rxjs';
import { Category } from '../../../../../types/category.structure';
import Fuse from 'fuse.js';
import { Product } from '../../../../../types/product.structure';

@Component({
  selector: 'app-add-combo',
  templateUrl: './add-combo.component.html',
  styleUrls: ['./add-combo.component.scss'],
})
export class AddComboComponent {
  offerImageFile: File = null;
  imagePreviewData: string = null;
  availableTimes: {
    value: number;
    time: string;
  }[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  categorySearchControl = new FormControl('');
  categorySearchFuseInstance: Fuse<Category>;
  monthSearchControl = new FormControl('');
  monthSearchFuseInstance: Fuse<string>;

  filteredCategories: Observable<Category[]>;
  selectedCategories: {
    category: Category;
    offerType: 'fixed' | 'free' | 'discount' | 'mustBuy';
    discountType?: 'flat' | 'percentage';
    appliedOn: 'item' | 'group';
    amount: number;
    minimumProducts: number;
    maximumProducts: number;
    id: string;
  }[] = [];
  allCategories: Category[] = [];

  selectedMonths: string[] = [];
  days: string[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  allMonths: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  filteredMonths: Observable<string[]>;

  offerApplicableOnNumberOfProducts: number = 1;
  numberOfProductsNumbers: number[] = [];

  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;

  announcer = inject(LiveAnnouncer);

  comboFormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    discounted: new FormControl(''),
    maximumNoOfPurchases: new FormControl(''),
    // type: new FormControl('', Validators.required),
    offerPrice: new FormControl(''),
  });
  visibilityDateRangeForm: FormGroup = new FormGroup({
    startDate: new FormControl(),
    endDate: new FormControl(),
  });
  visibilityEnabled: boolean = false;
  visibilitySettings = {
    mode: 'monthly',
    repeating: false,
    dateRange: {},
    selectedMonths: this.selectedMonths,
    visibilityDateRangeForm: this.visibilityDateRangeForm,
    selectedWeeks: {
      week1: true,
      week2: true,
      week3: true,
      week4: true,
      week5: true,
      week6: true,
    },
    activatedWeeks: () => {
      return Object.keys(this.visibilitySettings.selectedWeeks).filter(
        (key) => this.visibilitySettings.selectedWeeks[key],
      ).length;
    },
    daysSelected: {
      allSunday: false,
      allMonday: false,
      allTuesday: false,
      allWednesday: false,
      allThursday: false,
      allFriday: false,
      allSaturday: false,
    },
    daysSetting: [],
    timeSlotSelected: {
      breakfast: {
        selected: false,
        timeStart: 6,
        timeEnd: 13,
      },
      lunch: {
        selected: false,
        timeStart: 13,
        timeEnd: 18,
      },
      dinner: {
        selected: false,
        timeStart: 18,
        timeEnd: 1,
      },
      night: {
        selected: false,
        timeStart: 1,
        timeEnd: 6,
      },
      custom: {
        selected: false,
        timeStart: 0,
        timeEnd: 0,
      },
    },
  };
  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA)
    public dialogData: { mode: 'add' | 'edit'; menu: ModeConfig; combo: any },
    private fileService: FileStorageService,
    private dataProvider: DataProvider,
  ) {
    if (dialogData.menu) {
      this.allCategories = this.dialogData.menu.mainCategories;
      this.allCategories.push({
        id: 'all',
        name: 'All Products',
        products: this.dialogData.menu.products,
        enabled:true
      });
      this.categorySearchFuseInstance = new Fuse(this.allCategories,{keys:['name']});
      console.log('Search Instance', this.categorySearchFuseInstance);
    }
    console.log('this.allCategories', this.allCategories);
    if (dialogData.combo) {
      this.comboFormGroup.patchValue({
        ...this.dialogData.combo,
      });
      // menu is selected
      console.log('this.dialogData.combo', this.dialogData.combo);

      this.selectedCategories = this.dialogData.combo.selectedCategories;
      this.selectedMonths =
        this.dialogData.combo.visibilitySettings.selectedMonths;
      this.visibilityEnabled = this.dialogData.combo.visibilityEnabled;
      this.visibilitySettings = this.dialogData.combo.visibilitySettings;
    }
    // this.comboFormGroup.get('type').valueChanges.subscribe((value) => {
    //   if (value == 'combo') {
    //     // disable
    //     this.comboFormGroup.get('offerPrice').disable();
    //   } else {
    //     // enable
    //     this.comboFormGroup.get('offerPrice').enable();
    //   }
    // });
    this.filteredCategories = this.categorySearchControl.valueChanges.pipe(
      startWith(null),
      map((searchQuery: string | null) => {
        if (searchQuery && typeof searchQuery == 'string') {
          console.log('searchQuery', searchQuery);
          let results = this.categorySearchFuseInstance.search(searchQuery);
          console.log('results', results);
          return results.map((category) => {
            return category.item;
          });
        } else {
          return this.allCategories.map((category) => category);
        }
      }),
    );

    this.filteredMonths = this.monthSearchControl.valueChanges.pipe(
      startWith(null),
      map((searchQuery: string | null) => {
        if (searchQuery && typeof searchQuery == 'string') {
          return this.monthSearchFuseInstance
            .search(searchQuery)
            .map((month) => {
              return month.item;
            });
        } else {
          return this.allMonths.map((category) => category);
        }
      }),
    );

    // add time at intervals of 30 minutes from 00:00 to 23:30
    for (let i = 1; i < 48; i++) {
      let time = new Date();
      time.setHours(0, 0, 0, 0);
      time.setMinutes(time.getMinutes() + i * 30);
      this.availableTimes.push({
        value: i * 0.5,
        time: time.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }),
      });
    }
  }

  configurations = [];

  types: ComboType[] = [];
  selectedType: ExtendedComboType = null;
  currentTypeCategory: TypeCategory = null;

  droppedImage(event) {
    console.log('droppedImage', event);
  }

  buildSelectedTypes() {
    this.types = this.dialogData.menu.types;
    const selectedTypes = this.types.filter((type) => type.selected);
    console.log(selectedTypes, this.configurations);
    this.configurations = selectedTypes.map((type) => {
      return {
        ...type,
        categories: [],
      };
    });
    if (this.configurations.length > 0) {
      this.selectedType = this.configurations[0];
      if (this.selectedType.categories.length > 0) {
        this.currentTypeCategory = this.selectedType.categories[0];
      } else {
        this.currentTypeCategory = null;
      }
    }
    // let notFoundTypes = selectedTypes.filter(type => !this.configurations.find(t => {
    //   console.log("Check",t.id === type.id);
    //   return t.id === type.id
    // }));
    // console.log("notFoundTypes",notFoundTypes);
    // let newConfigs = notFoundTypes.map(type => {
    //   return {
    //     ...type,
    //     categories: []
    //   }
    // });
    // this.configurations = [...this.configurations, ...newConfigs];
    // console.log(this.configurations);
  }

  setImage(event) {
    // verify it's image
    if (event.target.files[0].type.indexOf('image') === -1) {
      return;
    }
    if (event.target.files) {
      this.offerImageFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => (this.imagePreviewData = reader.result as string);
      reader.readAsDataURL(this.offerImageFile);
    }
  }

  selectTypeCategory(category: TypeCategory) {
    this.currentTypeCategory = category;
  }

  selectType(type: ExtendedComboType) {
    this.selectedType = type;
    this.currentTypeCategory = null;
    console.log(type);
  }

  addCategory(selectedType: ExtendedComboType) {
    selectedType.categories.push({
      id: this.randomId,
      name: 'New Category' + (selectedType.categories.length + 1),
      products: [],
      offerType: 'discount',
      productTree: this.cloneProductTree(),
    });
  }

  cloneProductTree(): productTree[] {
    return this.dialogData.menu.mainCategories.map((category) => {
      return {
        categoryName: category.name || '',
        categoryId: category.id,
        selected: false,
        products: category.products.map((subCategory) => {
          return {
            id: subCategory.id,
            name: subCategory.name,
            price: subCategory.price,
            image: subCategory.images[0] || '',
            selected: false,
          };
        }),
      };
    });
  }

  someSelected(category: productTree) {
    return (
      category.products.some((item) => item.selected) && !category.selected
    );
  }

  allSelected(category: Category) {
    return category.products.every((item) => item.selected);
  }

  selectAll(category: productTree) {
    category.selected = !category.selected;
    category.products.forEach((product) => {
      product.selected = category.selected;
    });
  }

  checkAll(category: Category) {}

  generateSelectedProducts(type: TypeCategory) {
    type.products = [];
    if (type) {
      type.productTree.forEach((category) => {
        category.products.forEach((product) => {
          if (
            product.selected &&
            !type.products.find((p) => p.id === product.id)
          ) {
            type.products.push({
              id: product.id,
              name: product.name,
              price: product.price,
            });
          }
        });
      });
    }
  }

  get allTimeSlotsSelected() {
    return Object.keys(this.visibilitySettings.timeSlotSelected).every(
      (key) => this.visibilitySettings.timeSlotSelected[key].selected,
    );
  }

  async save() {
    // verify if everything is ok
    console.log('this.comboFormGroup', this.comboFormGroup);
    if (this.comboFormGroup.invalid) {
      alert('Please fill all the fields');
      return;
    }
    this.dataProvider.loading = true;
    if (this.offerImageFile) {
      let url = await this.fileService.upload(
        `business/${this.dataProvider.currentBusiness.businessId}/menus/${
          this.dialogData.menu.selectedMenu.id
        }/combos/images/${new Date().getTime()}_${this.offerImageFile.name}`,
        this.offerImageFile,
      );
      console.log(url);
    } else {
      var url = '';
    }
    delete this.visibilitySettings.activatedWeeks;
    this.visibilitySettings.daysSetting.forEach((month) => {
      month.days.forEach((week) => {
        delete week.selectAllDays;
      });
    });
    this.selectedCategories = this.selectedCategories.map((category) => {
      // category.category.products = category.category.products.filter((prod)=>prod.selected);
      category.id = this.generateID();
      category.category.products = category.category.products.map((prod) => {
        return {
          id: prod.id,
          selected: prod.selected,
        } as Product
      })
      return category;
    });
    let data = {
      ...this.comboFormGroup.value,
      offerImage: url,
      selectedCategories: this.selectedCategories,
      visibilitySettings: {
        ...this.visibilitySettings,
        visibilityDateRangeForm:
          this.visibilitySettings.visibilityDateRangeForm.value,
      },
      visibilityEnabled: this.visibilityEnabled,
      enabled: true,
    };
    console.log('data', data);
    this.dialogRef.close(data);
    this.dataProvider.loading = false;
  }

  generateID() {
    return Math.floor(Math.random() * 1000000000).toString(36);
  }

  cancel() {
    this.dialogRef.close();
  }

  get randomId() {
    return Math.floor(Math.random() * 1000000000).toString(36);
  }

  add(event: MatChipInputEvent): void {
    // Add our fruit
    console.log('event.value', event);

    // if (event.value) {
    //   this.selectedCategories.push(event.value);
    // }

    // Clear the input value
    event.chipInput!.clear();

    this.categorySearchControl.setValue(null);
  }

  removeCategory(category: Category): void {
    const index = this.selectedCategories.findIndex(
      (res) => res.category.id == category.id,
    );

    if (index >= 0) {
      this.selectedCategories.splice(index, 1);

      this.announcer.announce(`Removed ${category}`);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    let category: any = {
      category: structuredClone(event.option.value),
      offerType: 'discount',
      appliedOn: 'item',
      amount: 0,
      minimumProducts: 1,
      maximumProducts: null,
    };
    category.category.products.forEach((element) => {
      element.selected = false;
    });
    this.selectedCategories.push(category);
    this.fruitInput.nativeElement.value = '';
    this.categorySearchControl.setValue(null);
  }

  selectMonth(event: MatAutocompleteSelectedEvent) {
    this.selectedMonths.push(event.option.value);
    // reorder months
    this.selectedMonths.sort((a, b) => {
      return this.allMonths.indexOf(a) - this.allMonths.indexOf(b);
    });
    this.fruitInput.nativeElement.value = '';
    this.categorySearchControl.setValue(null);
    this.generateMonthsData();
  }

  removeMonth(monthString: string) {
    const index = this.selectedMonths.indexOf(monthString);

    if (index >= 0) {
      this.selectedMonths.splice(index, 1);

      this.announcer.announce(`Removed ${monthString}`);
    }
  }

  selectProducts(products: Product[], selected: boolean) {
    products.forEach((item) => {
      item.selected = selected;
    });
  }

  generateMonthsData() {
    console.log('Selected weeks', this.visibilitySettings);
    let monthWiseDays: any[] = [];

    this.selectedMonths.forEach((month) => {
      // generate a full calendar for each month
      // every day must have three var day, possible, selected
      let monthDays: any[] = [];
      // example format
      // let singleMonth =  {
      //   weekOne: [
      //     {
      //       day:'Sunday',
      //       possible:false,
      //     },
      //     {
      //       day:'Monday',
      //       possible:false,
      //     },
      //     {
      //       day:'Tuesday',
      //       possible:true,
      //     },
      //     {
      //       day:'Wednesday',
      //       possible:true,
      //     },
      //     {
      //       day:'Thursday',
      //       possible:true,
      //     },
      //     {
      //       day:'Friday',
      //       possible:true,
      //     },
      //     {
      //       day:'Saturday',
      //       possible:true,
      //     },
      //   ]
      // };

      let date = new Date();
      date.setMonth(this.allMonths.indexOf(month));
      date.setDate(1);
      let day = date.getDay();
      let days: { day: string; possible: boolean; selected: boolean }[] = [];
      for (let i = 0; i < day; i++) {
        days.push({
          day: this.days[i],
          possible: false,
          selected: false,
        });
      }
      let monthLength = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
      ).getDate();
      console.log('monthLength', monthLength);
      for (let i = 1; i <= monthLength; i++) {
        let day = new Date(
          date.getFullYear(),
          date.getMonth(),
          i,
        ).toLocaleDateString('en-US', { weekday: 'long' });
        days.push({
          day: day,
          possible: true,
          selected: false,
        });
      }
      // split days into weeks
      let weeks: any[] = [];
      let week: any[] = [];
      let weekCounter = 0;
      days.forEach((day, index) => {
        week.push(day);
        if (index % 7 == 6) {
          console.log(
            'weekCounter',
            weekCounter + 1,
            this.visibilitySettings.selectedWeeks,
            'week' + (weekCounter + 1),
            this.visibilitySettings.selectedWeeks['week' + (weekCounter + 1)],
          );
          if (
            this.visibilitySettings.selectedWeeks['week' + (weekCounter + 1)]
          ) {
            weeks.push({
              week: week,
              selectAllDays: (select: boolean) => {
                week.forEach((day) => {
                  day.selected = select;
                });
              },
              weekName:
                weekCounter == 0
                  ? '1st week'
                  : weekCounter == 1
                  ? '2nd week'
                  : weekCounter == 2
                  ? '3rd week'
                  : weekCounter == 3
                  ? '4th week'
                  : weekCounter == 4
                  ? '5th week'
                  : '6th week',
            });
          }
          week = [];
          weekCounter++;
        } else if (index == days.length - 1) {
          // fill remaining days
          let counter = 7 - week.length;
          let initialWeekLength = week.length;
          console.log(
            'weekCounter',
            weekCounter + 1,
            this.visibilitySettings.selectedWeeks,
            'week' + (weekCounter + 1),
            this.visibilitySettings.selectedWeeks['week' + (weekCounter + 1)],
          );
          for (let j = 0; j < counter; j++) {
            console.log('ran', j, j + week.length);
            week.push({
              day: this.days[j + initialWeekLength],
              possible: false,
              selected: false,
            });
          }
          // check if the week is enabled
          if (
            this.visibilitySettings.selectedWeeks['week' + (weekCounter + 1)]
          ) {
            weeks.push({
              week: week,
              weekName:
                weekCounter == 0
                  ? '1st week'
                  : weekCounter == 1
                  ? '2nd week'
                  : weekCounter == 2
                  ? '3rd week'
                  : weekCounter == 3
                  ? '4th week'
                  : weekCounter == 4
                  ? '5th week'
                  : '6th week',
              selectAllDays: (select: boolean) => {
                week.forEach((day) => {
                  day.selected = select;
                });
              },
            });
          }
          weekCounter++;
        }
      });
      let weekLength = weeks.length;
      if (weekLength < 6) {
        for (let index = 0; index < 6 - weekLength; index++) {
          let week = [];
          for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            week.push({
              day: this.days[dayIndex],
              possible: false,
              selected: false,
            });
          }
          console.log('Adding Week ', week);
          weeks.push({
            week: week,
            weekName:
              weekCounter == 0
                ? '1st week'
                : weekCounter == 1
                ? '2nd week'
                : weekCounter == 2
                ? '3rd week'
                : weekCounter == 3
                ? '4th week'
                : weekCounter == 4
                ? '5th week'
                : '6th week',
            selectAllDays: (select: boolean) => {
              week.forEach((day) => {
                day.selected = select;
              });
            },
          });
          console.log('Adding Week ', weeks);
        }
      }
      monthDays = weeks;
      monthWiseDays.push({
        month: month,
        days: monthDays,
      });
    });
    console.log('monthWiseDays', monthWiseDays);
    this.visibilitySettings.daysSetting = monthWiseDays;
  }

  selectAllWeekDays(week: any[], select: boolean) {
    week.forEach((day) => {
      day.selected = select;
    });
  }

  checkAllWeekDays(dayNumber: number, value: boolean) {
    this.visibilitySettings.daysSetting.forEach((month) => {
      month.days.forEach((week) => {
        week.week[dayNumber].selected = value;
      });
    });
  }

  checkAllTimeSlots(value: boolean) {
    Object.keys(this.visibilitySettings.timeSlotSelected).forEach((key) => {
      this.visibilitySettings.timeSlotSelected[key].selected = value;
    });
  }
}

interface ExtendedComboType extends ComboType {
  categories: TypeCategory[];
}

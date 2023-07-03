import { Product } from "./product.structure";

export interface Combo {
    id: string;
    name:string;
    offerImage:string;
    discounted:boolean;
    numberOfProducts:number;
    maximumNoOfPurchases:number;
    type:'combo'|'offer';
    offerPrice?:number;
    timeGroups:TimeGroup[];
    types:ComboTypeProductWiseCategorized[];
}

export interface ComboTypeProductWiseCategorized extends ComboType {
    categories:ComboCategoryCategorized[];
}

export interface ComboCategoryCategorized {
    id:string;
    name:string;
    products:Product[],
    selectedProducts:Product[],
    offerType: 'discount' | 'free';
    offerValue?:number;
    maximumProducts?:number;
    minimumProducts?:number;
}

export interface ComboTypeCategorized extends ComboType {
    categories:TypeCategory[];
}

export interface TypeConfiguration {
    categories:TypeCategory[];
}

export interface TypeCategory {
    id:string;
    name:string;
    maximumProducts?:number;
    minimumProducts?:number;
    offerType:'discount'|'free';
    offerValue?:number;
    products:{
        id:string,
        name:string,
        price:number,
    }[];
    productTree:productTree[];
}

export interface ComboType {
    id?:string;
    name:string;
    image:string;
    description?:string;
    creationDate:any;
    updateDate:any;
    selected?:boolean;
}

export interface productTree {
    categoryName:string;
    categoryId:string;
    selected:boolean;
    products:{
      id:string;
      name:string;
      price:number;
      image:string;
      selected:boolean;
    }[];
  }

export interface TimeGroup {
    id?:string;
    name:string;
    conditions:TimeCondition[];
    selected:boolean;
}

export interface TimeCondition{
    type:'time'|'day'|'date';
    condition:'is'|'is not'|'is before'|'is after';
    value:any;
}

export interface ApplicableComboConstructor {
    itemType: 'combo';
    id:string;
    combo:Combo;
    selected:boolean;
    productSelection:ComboProductSelection[];
    quantity:number;
    cancelled:boolean;
}
export interface ComboProductSelection {
    id:string;
    name:string;
    products:Product[];
    config:any;
}
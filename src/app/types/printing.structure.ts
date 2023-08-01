import { Product } from "./product.structure";


export interface PrinterSetting{
	printerName:string;
	dishesId:string[],
}
export interface PrinterSettingProductWise extends PrinterSetting{
	products:Product[]
}
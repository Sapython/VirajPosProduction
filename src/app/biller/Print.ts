import { APP_CONFIG } from "../../environments/environment";
import { Bill } from "./Bill";

export interface PrintConstructor{
    printBill(bill:Bill):Promise<Response>;
    printKot(bill:Bill):Promise<Response>;
    printEditedKot(bill:Bill):Promise<Response>;
    printCancelledKot(bill:Bill):Promise<Response>;
}
export class Print implements PrintConstructor {
    getOptions(data:any){
        return {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }
    }
    
    printBill(bill: Bill): Promise<Response> {
        return fetch(APP_CONFIG.printerServerUrl+'/printBill',this.getOptions({bill:bill}))
    }
    
    printKot(bill: Bill): Promise<Response> {
        return fetch(APP_CONFIG.printerServerUrl+'/printKot',this.getOptions({bill:bill}))
    }

    printEditedKot(bill: Bill): Promise<Response> {
        return fetch(APP_CONFIG.printerServerUrl+'/printEditedKot',this.getOptions({bill:bill}))
    }

    printCancelledKot(bill: Bill): Promise<Response> {
        return fetch(APP_CONFIG.printerServerUrl+'/printCancelledKot',this.getOptions({bill:bill}))
    }

}
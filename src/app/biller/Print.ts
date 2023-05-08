import { environment } from "src/environments/environment";
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
        return fetch(environment.printerServerUrl+'/printBill',this.getOptions({bill:bill}))
    }
    
    printKot(bill: Bill): Promise<Response> {
        return fetch(environment.printerServerUrl+'/printKot',this.getOptions({bill:bill}))
    }

    printEditedKot(bill: Bill): Promise<Response> {
        return fetch(environment.printerServerUrl+'/printEditedKot',this.getOptions({bill:bill}))
    }

    printCancelledKot(bill: Bill): Promise<Response> {
        return fetch(environment.printerServerUrl+'/printCancelledKot',this.getOptions({bill:bill}))
    }

}
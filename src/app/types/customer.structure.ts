export interface Customer {
    id:string;
    name: string;
    phone: string;
    address: string;
    gst: string;
    loyaltyPoints: number;
    lastOrder: string;
    lastOrderDate: string;
    lastOrderDish: string[];
    orderFrequency: number;
    averageOrderPrice: number;
    lastMonth: string;
}
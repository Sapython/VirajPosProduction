export interface Menu {
    id?: string;
    name: string;
    description: string;
}

export interface MenuData {
    id?:string;
    name:string;
    description:string;
    templates:string[];
    createdAt?:Date;
    updatedAt?:Date;
}
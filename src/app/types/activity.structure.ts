export interface BillActivity {
  type:
    | 'newKot'
    | 'kotPrinted'
    | 'kotEdited'
    | 'kotCancelled'
    | 'billPrinted'
    | 'billEdited'
    | 'billCancelled'
    | 'billSettled'
    | 'billSplit'
    | 'billDiscounted'
    | 'billNC'
    | 'customerDetailEntered'
    | 'billNormal'
    | 'billFinalized'
    | 'instructionSet'
    | 'lineCancelled'
    | 'lineDiscounted'
    | 'billReactivated';
  message: string;
  user: string;
  data?: any;
}

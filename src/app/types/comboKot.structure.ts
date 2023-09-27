import { Timestamp } from '@angular/fire/firestore';
import { UserConstructor } from './user.structure';
import { ApplicableCombo } from './combo.structure';

export interface ComboKotConstructor {
  id?: string;
  createdDate: Timestamp;
  stage: 'active' | 'finalized' | 'cancelled' | 'edit';
  combos: ApplicableCombo[];
  editMode: boolean;
  selected: boolean;
  allSelected: boolean;
  someSelected: boolean;
  unmade?: boolean;
  cancelReason?: {
    reason: string;
    mode: 'un-made' | 'made';
    time: Timestamp;
    user: UserConstructor;
  };
  mode?:
    | 'firstChargeable'
    | 'cancelledKot'
    | 'editedKot'
    | 'runningNonChargeable'
    | 'runningChargeable'
    | 'firstNonChargeable'
    | 'reprintKot'
    | 'online';
}

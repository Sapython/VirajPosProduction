import { Component, Input } from '@angular/core';
import { Kot } from '../../../../../core/constructors/kot/Kot';
import { Dialog } from '@angular/cdk/dialog';
import { firstValueFrom } from 'rxjs';
import { ItemNoteComponent } from '../../kot-item/item-note/item-note.component';

@Component({
  selector: 'app-kot-note',
  templateUrl: './kot-note.component.html',
  styleUrls: ['./kot-note.component.scss']
})
export class KotNoteComponent {
  @Input() Kot:Kot;
  constructor(private dialog:Dialog) { }
  async setInfo() {
    //  console.log("this.info",this.info);
    const dialog = this.dialog.open(ItemNoteComponent, {
      data: {
        title: 'Enter a instruction',
        placeholder: 'Instruction',
        value: this.Kot?.note,
        type: 'text',
        required: false,
        description: 'Enter a instruction for the kitchen',
      },
    });
    let res:any = await firstValueFrom(dialog.closed);
    //  console.log("res",res);
    if (typeof res?.instruction == 'string') {
      this.Kot.note = res?.instruction;
    } else {
      return;
    }
  }
}

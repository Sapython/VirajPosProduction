import { Component, Inject } from '@angular/core';
import { TimeCondition, TimeGroup } from '../../../../../types/combo.structure';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';

@Component({
  selector: 'app-add-time-group',
  templateUrl: './add-time-group.component.html',
  styleUrls: ['./add-time-group.component.scss']
})
export class AddTimeGroupComponent {
  conditions:TimeCondition[] = [];
  days:string[] = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  timeGroupForm:FormGroup = new FormGroup({
    name:new FormControl('',[Validators.required]),
  })
  constructor(private dialogRef:DialogRef,private alertify:AlertsAndNotificationsService,@Inject(DIALOG_DATA) data:{mode:'add'|'edit',data:TimeGroup}){
    if(data){
      if(data.mode == 'edit'){
        this.timeGroupForm.controls.name.setValue(data.data.name);
        this.conditions = data.data.conditions;
      }
    }
  }
  addCondition() {
    if (this.conditions.length >= 5) return;
    this.conditions.push({
      condition: 'is',
      type:'day',
      value: 'monday'
    })
  }

  submit(){
    if(this.conditions.length ==0){
      this.alertify.presentToast('Please add at least one condition','info');
      return;
    }
    if(this.timeGroupForm.valid){
      this.dialogRef.close({
        name:this.timeGroupForm.controls.name.value,
        conditions:this.conditions
      })
    }else{
      this.alertify.presentToast('Please fill all fields','info');
    }
  }

  removeCondition(index:number) {
    this.conditions.splice(index, 1);
  }

  cancel(){
    this.dialogRef.close();
  }
}

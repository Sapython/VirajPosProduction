import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertsAndNotificationsService } from '../../../../../core/services/alerts-and-notification/alerts-and-notifications.service';

@Component({
  selector: 'app-add-type',
  templateUrl: './add-type.component.html',
  styleUrls: ['./add-type.component.scss']
})
export class AddTypeComponent {
  imageFile:File = null;
  output:string = '';
  newTypeForm:FormGroup = new FormGroup({
    name:new FormControl('',Validators.required),
    description:new FormControl(''),
    image:new FormControl('',Validators.required),
  })
  constructor(private dialogRef:DialogRef,@Inject(DIALOG_DATA) public data:{mode:'add'|'edit'},private alertify:AlertsAndNotificationsService) {
    if(data.mode === 'edit'){
      this.newTypeForm.patchValue(data);
    }
  }

  submit(){
    if (!this.imageFile){
      this.alertify.presentToast('Please select an image for the type');
    }
    this.dialogRef.close({...this.newTypeForm.value,image:this.imageFile});
  }

  close(){
    this.dialogRef.close();
  }

  setFileObject(event:any){
    event.preventDefault();
    console.log(event);
    if(event.target.files.length > 0){
      this.imageFile = event.target.files[0];
      // convert file to url
      const reader = new FileReader();
      reader.onload = (e:any) => {
        this.output = e.target.result;
      }
      console.log(this.imageFile);
      reader.readAsDataURL(this.imageFile);
    } else {
      this.imageFile = null;
    }
  }
}

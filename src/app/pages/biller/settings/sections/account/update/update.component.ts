import { Component, Inject, OnInit } from '@angular/core';
import { Member } from '../../../../../../types/user.structure';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataProvider } from '../../../../../../core/services/provider/data-provider.service';
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { AccessGroup, SelectPropertiesComponent } from '../select-properties/select-properties.component';


@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {
  accessForm:FormGroup = new FormGroup({
    accessType:new FormControl('',[Validators.required]),
    role:new FormControl(''),
    propertiesAllowed:new FormControl(''),
  });
  constructor(public dataProvider:DataProvider,public dialogRef:DialogRef,@Inject(DIALOG_DATA) public user:Member,private dialog:Dialog){
    
  }
  ngOnInit(): void {
    this.accessForm.patchValue(this.user);
  }

  submit(){
    if (this.accessForm.invalid) return;
    // check the type and then check if either role or properties are set
    if (this.accessForm.value.accessType == 'role' && !this.accessForm.value.role) return;
    if (this.accessForm.value.accessType == 'custom' && !this.accessForm.value.propertiesAllowed) return;
    this.dialogRef.close(this.accessForm.value);
  }

  selectProperties(){
    const dialog = this.dialog.open(SelectPropertiesComponent,{data:this.user.accessType=='custom'?this.user.propertiesAllowed:[]});
    dialog.closed.subscribe((data)=>{
      console.log("Received data from prop selector",data);
      if (data) this.accessForm.patchValue({propertiesAllowed:data});
    })
  }
}

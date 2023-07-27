import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent {
  constructor(@Inject(DIALOG_DATA) public data:{groupName:string},public dialogRef:DialogRef) {}
  submit(event:any){
    event.preventDefault();
    event.stopPropagation();
    this.dialogRef.close(this.data)
  }
}

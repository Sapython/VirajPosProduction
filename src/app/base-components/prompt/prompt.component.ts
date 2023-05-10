import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-prompt',
  templateUrl: './prompt.component.html',
  styleUrls: ['./prompt.component.scss'],
})
export class PromptComponent {
  promptForm: FormGroup = new FormGroup({
    value: new FormControl(''),
  });
  constructor(
    @Inject(DIALOG_DATA)
    public config: {
      title: string;
      description?: string;
      value?: string;
      required: boolean;
      placeholder: string;
      type: string;
    },
    private dialogRef: DialogRef
  ) {
    if (config.value) {
      this.promptForm.get('value')?.setValue(config.value);
    }
    if (config.required) {
      this.promptForm.get('value')?.addValidators([Validators.required]);
    }
  }

  cancel(){
    this.dialogRef.close();
  }

  submit(){
    if (this.promptForm.valid){
      console.log(this.promptForm.value);
      this.dialogRef.close(this.promptForm.get('value')?.value);
    }
  }
}

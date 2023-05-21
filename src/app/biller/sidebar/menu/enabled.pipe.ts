import { Pipe, PipeTransform } from '@angular/core';
import { Category } from '../../../structures/general.structure';

@Pipe({
  name: 'enabled'
})
export class EnabledPipe implements PipeTransform {

  transform(value: Category[],): Category[] {
    return value.filter((item: Category) => item.enabled);
  }

}

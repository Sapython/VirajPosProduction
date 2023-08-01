import { Pipe, PipeTransform } from '@angular/core';
import { Category } from '../../../../types/category.structure';

@Pipe({
  name: 'enabled',
})
export class EnabledPipe implements PipeTransform {
  transform(value: Category[]): Category[] {
    return value.filter((item: Category) => item.enabled);
  }
}

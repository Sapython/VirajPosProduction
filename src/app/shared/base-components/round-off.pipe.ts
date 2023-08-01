import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roundOff',
})
export class RoundOffPipe implements PipeTransform {
  transform(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}

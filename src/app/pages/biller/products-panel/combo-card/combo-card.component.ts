import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Combo, TimeGroup } from '../../../../types/combo.structure';

@Component({
  selector: 'app-combo-card',
  templateUrl: './combo-card.component.html',
  styleUrls: ['./combo-card.component.scss'],
})
export class ComboCardComponent implements OnInit {
  @Input() combo: Combo;
  @Output() open: EventEmitter<Combo> = new EventEmitter<Combo>();
  disabled: boolean = false;
  days: string[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  ngOnInit(): void {
    // this.disabled = !this.checkDateIsAvailable(this.combo.timeGroups) TODO: checker
  }
  checkDateIsAvailable(timeGroups: TimeGroup[]) {
    let available = true;
    timeGroups.forEach((timeGroup) => {
      timeGroup.conditions.forEach((condition) => {
        if (condition.type == 'date') {
          if (condition.condition == 'is') {
            if (condition.value != new Date().toISOString().split('T')[0]) {
              available = false;
            }
          } else if (condition.condition == 'is not') {
            if (condition.value == new Date().toISOString().split('T')[0]) {
              available = false;
            }
          } else if (condition.condition == 'is before') {
            if (condition.value >= new Date().toISOString().split('T')[0]) {
              available = false;
            }
          } else if (condition.condition == 'is after') {
            if (condition.value <= new Date().toISOString().split('T')[0]) {
              available = false;
            }
          }
        } else if (condition.type == 'day') {
          console.log('IS day');
          if (condition.condition == 'is') {
            console.log('IS day', condition.value, new Date().getDay());
            if (
              !condition.value.includes(
                this.getDayFromIndex(new Date().getDay()),
              )
            ) {
              available = false;
            }
          } else if (condition.condition == 'is not') {
            if (
              !condition.value.includes(
                this.getDayFromIndex(new Date().getDay()),
              )
            ) {
              available = false;
            }
          } else if (condition.condition == 'is before') {
            if (
              !condition.value.includes(
                this.getDayFromIndex(new Date().getDay()),
              )
            ) {
              available = false;
            }
          } else if (condition.condition == 'is after') {
            if (
              !condition.value.includes(
                this.getDayFromIndex(new Date().getDay()),
              )
            ) {
              available = false;
            }
          }
        } else if (condition.type == 'time') {
          if (condition.condition == 'is') {
            if (condition.value != new Date().getHours()) {
              available = false;
            }
          } else if (condition.condition == 'is not') {
            if (condition.value == new Date().getHours()) {
              available = false;
            }
          } else if (condition.condition == 'is before') {
            if (condition.value >= new Date().getHours()) {
              available = false;
            }
          } else if (condition.condition == 'is after') {
            if (condition.value <= new Date().getHours()) {
              available = false;
            }
          }
        }
      });
    });
    console.log('IS DAY VALID', available);
    return available;
  }

  getDayFromIndex(dayIndex: number) {
    return this.days[dayIndex];
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Combo, TimeGroup, VisibilitySettings } from '../../../../types/combo.structure';

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
    this.disabled = !this.checkDateIsAvailable(this.combo,new Date());
  }
  checkDateIsAvailable(combo: Combo, date: Date) {
    let available = true;
    let visibilitySettings = combo.visibilitySettings;
    // console.log("this.combo");
    if (combo.visibilityEnabled){
      if (visibilitySettings.mode == 'monthly') {
        if (visibilitySettings.repeating) {
          let todayYear = new Date().getFullYear();
          let comboYear = date.getFullYear();
          if (todayYear != comboYear) {
            available = false;
            return;
          }
        }
        let currentMonth = new Date().toLocaleDateString('en-US', {
          month: 'long',
        });
        let currentDay = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
        });
        let currentMonthVisibility = visibilitySettings.daysSetting.find(
          (month) => month.month == currentMonth,
        );
        let availableDays = currentMonthVisibility.days.filter((day) =>
          day.week.find(
            (week) => week.day == currentDay && week.possible && week.selected,
          ),
        );
        if (availableDays.length == 0) {
          available = false;
        } else {
          available = true;
        }
      } else if (visibilitySettings.mode == 'weekly') {
        let currentDay = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
        });
        if (visibilitySettings.daysSetting.length){
          let availableDays = visibilitySettings.daysSetting[0].days.filter((day) =>
            day.week.find(
              (week) => week.day == currentDay && week.possible && week.selected,
            ),
          );
          if (availableDays.length == 0) {
            available = false;
          } else {
            available = true;
          }
        } else {
          available = false;
        }
      }
      // console.log('IS DAY VALID', available);
      return available;
    } else {
      return combo.enabled
    }
  }

  getDayFromIndex(dayIndex: number) {
    return this.days[dayIndex];
  }
}

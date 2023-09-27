import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-emergency',
  templateUrl: './emergency.component.html',
  styleUrls: ['./emergency.component.scss']
})
export class EmergencyComponent implements OnInit{
  alerts:Alert[] = [
    {
      type:'billPending',
      title:'Bill Pending',
      startTime:new Date(),
      referDetail:'T2'
    }
  ]

  ngOnInit(): void {
    setInterval(()=>{
      this.alerts[0].elapsedTime = this.getElapsedTime(this.alerts[0].startTime);
    },1000)
  }

  getElapsedTime(startTime:Date):string{
    let elapsedTime = new Date().getTime() - startTime.getTime();
    let seconds = Math.floor(elapsedTime/1000);
    let minutes = Math.floor(seconds/60);
    let hours = Math.floor(minutes/60);
    let days = Math.floor(hours/24);
    if(days>0){
      return `${days} day${days>1?'s':''} ago`;
    }else if(hours>0){
      return `${hours} hr${hours>1?'s':''} ago`;
    }else if(minutes>0){
      return `${minutes} min${minutes>1?'s':''} ago`;
    }else{
      return `${seconds} sec${seconds>1?'s':''} ago`;
    }
  }
}
export interface Alert {
  type:'billPending',
  title:string,
  startTime:Date,
  elapsedTime?:string,
  referDetail:string;
}
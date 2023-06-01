import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { DataProvider } from '../../../../core/services/provider/data-provider.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements AfterViewInit{
  @ViewChild('internalChat') chat:any;
  constructor(private dataProvider:DataProvider){
    
  }
  ngAfterViewInit(): void {
  //  console.log("(this.chat)",(this.chat),this.dataProvider.chatInnerHtml);
    this.chat.nativeElement.appendChild(this.dataProvider.chatInnerHtml)
  }
}

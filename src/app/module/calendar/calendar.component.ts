import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import * as moment from 'moment';
import { StoreService } from 'src/app/services/store/store.service';
import { START_POINTER } from './constants';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {

  isDragging = false

  selected: any;
  times: string[] = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
  events: any[] = [];
  actionType: string = '';
  
  constructor(
    public store: StoreService
  ) { }

  async ngOnInit() {
    this.drawEvents();
    this.store.state$.subscribe(state=> {
      this.drawEvents();
    });
  }

  drawEvents = () => {
    const positions: any[] = []
    this.events = this.store.getEvents()?.filter(filter_item => (
      new Date(this.selected).getTime() < Date.parse(filter_item.start) &&
      new Date(moment(new Date(this.selected)).format('YYYY/MM/DD') + ' 23:59:59').getTime() > Date.parse(filter_item.start) 
    )).map(item=>{
      let diff = Math.floor((Date.parse(item.start)-Date.parse(item.start.substring(0, 10) + " 00:00:00")) / 1000 / 60)
      let top = diff + Math.ceil(diff/60);

      diff = Math.floor((Date.parse(item.end)-Date.parse(item.start)) / 1000 / 60)
      let height =  diff - Math.ceil(diff/60) - 1 
      let left = 0

      const position = positions.find(pos => pos.top == top)
      if (position) {
        left = position.left + 50
        position.left = left
      } else {
        positions.push({top, left})
      }

      return {
        title: item.title,
        start: item.start,
        end: item.end,
        description: item.description,
        left,
        top,
        height
      }
    });
  }

  onClickTimeCell = (index: number, time: string) => {
    if (this.isDragging)
      return

    if(this.selected==undefined) 
      return

    this.actionType = 'add'
    this.store.storeActionType('add');
    this.store.storeSelectedTime(time);
    this.store.storeFlagOpenModal(true);
  }

  onClickEvent = (event: any, evet_item: any) => {
    if (this.isDragging)
      return

    this.actionType = 'edit'
    this.store.storeActionType('edit');
    this.store.storeFlagOpenModal(true);
    this.store.storeSelectedEvent(evet_item);
  }

  onSelectedDate = (event: any) => {
    this.drawEvents()
  }

  onDragStart = (event: any) => {
    this.isDragging = true
  }

  onDragEnd = (event: any) => {
    console.log(event.dropPoint, event.source.data)
    if(event.dropPoint.y>START_POINTER) {
      let top = event.dropPoint.y - START_POINTER;
      let start_hour = '0' + String(Math.floor(top/60));
      let start_min = '0' + String(top%60);
      let end_hour = '0' + String(Math.floor((top + event.source.data.height)/60));
      let end_min = '0' + String((top + event.source.data.height)%60);
      let start = event.source.data.start.substring(0, 11) + start_hour.slice(Math.max(start_hour.length - 2, 0)) + ':' + start_min.slice(Math.max(start_min.length - 2, 0));
      let end = event.source.data.end.substring(0, 11) + end_hour.slice(Math.max(end_hour.length - 2, 0)) + ':' + end_min.slice(Math.max(end_min.length - 2, 0));
      let title = event.source.data.title;
      let description = event.source.data.description;

      let events = this.store.getEvents();
      events = events.map(item=> {
        if(
          item.title == event.source.data.title &&
          item.start == event.source.data.start && 
          item.end == event.source.data.end && 
          item.description == event.source.data.description
        ) {
          return {title, start, end, description}
        } else {
          return item;
        }
      });
      this.store.storeEvents(events);
    }
    setTimeout(() => {
      this.isDragging = false
    }, 500)
  }

}

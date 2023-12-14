import { Component, ElementRef, HostListener, OnInit, inject, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { StoreService } from 'src/app/services/store/store.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})

export class ModalComponent implements OnInit {
  @Input() selectedDate: any;
  @Input() actionType!: string;
  @HostListener('document:click', ['$event'])
  clickWindow(event: any) {
    if(event.target.className=='open_modal') {
      this.openModal = true;
    }
  }

  openModal: boolean = false;
  eventForm: FormGroup = new FormGroup({
    title: new FormControl('', Validators.required),
    start: new FormControl('', Validators.required),
    end: new FormControl('', Validators.required),
    description: new FormControl('')
  });
  validPeriod: boolean = true;

  constructor(
    public store: StoreService
  ) { }

  ngOnInit(): void {
    this.store.state$.subscribe(async (state)=> {
      let dkd = '0' + (Number(state.selectedTime?.split(':')[0])+1).toString()+':00';
      let fif = dkd.slice(Math.max(dkd.length - 5, 0));
      if(state.actionType=='add') {
        this.eventForm.setValue({
          title: '',
          start: state.selectedTime ? state.selectedTime : '',
          end: fif,
          description: ''
        });
      } else if(state.actionType=='edit') {
        this.eventForm.setValue({
          title: state.selectedEvent?.title ? state.selectedEvent?.title : '',
          start: state.selectedEvent?.start ? state.selectedEvent?.start.substring(state.selectedEvent?.start.length - 5) : '',
          end: state.selectedEvent?.end ? state.selectedEvent?.end.substring(state.selectedEvent?.end.length - 5) : '',
          description: state.selectedEvent?.description ? state.selectedEvent?.description : ''
        });
      }
      this.openModal = state.bOpenModal;
    })
  }

  closeModal = () => {
    this.openModal = false;
    this.eventForm.reset();
    this.validPeriod = true
  }

  onEventSubmit = () => {
    
    if (this.eventForm.invalid) {
      this.validateAllFormFields(this.eventForm)
      return;
    }
    
    let date = moment(this.selectedDate).format('YYYY/MM/DD');
    let title = this.eventForm.get('title')?.value;
    let start = date + ' ' + this.eventForm.get('start')?.value;
    let end = date + ' ' + this.eventForm.get('end')?.value;
    let description = this.eventForm.get('description')?.value;

    if(start > end) {
      this.validPeriod = false;
      return;
    }

    if(this.actionType='add') {
      let eventData = {title, start, end, description}
      this.store.storeEvents([...(JSON.parse(this.store.getDBEvents() as any)), eventData]);
    } else if (this.actionType='edit') {
      let events = this.store.getEvents();
      let selectedEvent = this.store.getSelectedEvent();
      events = events.map(item=> {
        if(
          item.title == selectedEvent.title &&
          item.start == selectedEvent.start && 
          item.end == selectedEvent.end && 
          item.description == selectedEvent.description
        ) {
          return {title, start, end, description}
        } else {
          return item;
        }
      });
      this.store.storeEvents(events);
    }
    this.closeModal();
  }

  onDeleteEvent = () => {
    let events = this.store.getEvents();
    let selectedEvent = this.store.getSelectedEvent();
    let index = events.findIndex(item=>(
      item.title == selectedEvent.title &&
      item.start == selectedEvent.start && 
      item.end == selectedEvent.end && 
      item.description == selectedEvent.description
    ));
    events.splice(index, 1);
    this.store.storeEvents(events);
    this.closeModal();
  }

  validateAllFormFields(formGroup: FormGroup) {         //{1}
    Object.keys(formGroup.controls).forEach(field => {  //{2}
      const control = formGroup.get(field);             //{3}
      if (control instanceof FormControl) {             //{4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {        //{5}
        this.validateAllFormFields(control);            //{6}
      }
    });
  }

}
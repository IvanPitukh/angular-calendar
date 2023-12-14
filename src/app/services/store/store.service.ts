import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";

export interface IEvent {
  title: string,
  start: any,
  end: any,
  description: string,
}

export interface AppState {
  events: any[],
  selectedDate: any,
  bOpenModal: boolean,
  selectedTime: string,
  selectedEvent: any,
  actionType: string
}

export const DBKEYS = {
  EVENTS: 'EVENTS'
};

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private localdb: Storage = window.localStorage;

  // Initial state in BehaviorSubject's constructor
  private readonly subject!: BehaviorSubject<AppState>;

  // Shared Customer Balance State
  private balance: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  // Exposed observable$ store stream
  readonly state$: Observable<AppState>;

  // Getter of the last store value emitted
  private get store(): AppState {
    return this.subject.getValue();
  }

  // Push new state into the observable
  private set store(val: AppState) {
    this.subject.next(val);
  }

  constructor(private breakpointsObs: BreakpointObserver) {
    // @ts-ignore

    this.subject = new BehaviorSubject<AppState>({
      // @ts-ignore

    });
    this.state$ = this.subject.asObservable();

    breakpointsObs.observe(Breakpoints.HandsetPortrait).subscribe(result => {

    });
  }

  public storeEvents(events: any) {
    this.localdb.setItem(DBKEYS.EVENTS, JSON.stringify(events));
    this.store = { ...this.store, events };
  }

  public removeEvents() {
    this.localdb.removeItem(DBKEYS.EVENTS);
    this.store = { ...this.store, events: [] };
  }

  public getEvents() {
    return this.store.events
  }

  public getDBEvents() {
    return this.localdb.getItem(DBKEYS.EVENTS);
  }

  public storeFlagOpenModal(bOpenModal: boolean) {
    this.store = { ...this.store, bOpenModal };
  }

  public getFlagOpenModal() {
    return this.store.bOpenModal;
  }

  public storeSelectedTime(selectedTime: string) {
    this.store = { ...this.store, selectedTime };
  }

  public getSelectedTime() {
    return this.store.selectedTime;
  }

  public storeSelectedEvent(selectedEvent: any) {
    this.store = { ...this.store, selectedEvent };
  }

  public getSelectedEvent() {
    return this.store.selectedEvent;
  }

  public storeActionType(actionType: any) {
    this.store = { ...this.store, actionType };
  }

  public getActionType() {
    return this.store.actionType;
  }
}

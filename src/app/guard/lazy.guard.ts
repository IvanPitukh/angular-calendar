import { Injectable } from '@angular/core';
import {Router, CanLoad} from '@angular/router';
import {StoreService} from "../services/store/store.service";

@Injectable({
  providedIn: 'root'
})
export class LazyGuard implements CanLoad {

  constructor(private router: Router, private store: StoreService) {
    this.store.state$.subscribe(async (state) => {

    });
  }

  public async canLoad() {
    this.setEvents();
    return true;
  }

  setEvents = () => {
    let dbEvents = this.store.getDBEvents();
    if(dbEvents==null) {
      this.store.storeEvents([]);
    } else {
      this.store.storeEvents(JSON.parse(dbEvents));
    }
  }

}

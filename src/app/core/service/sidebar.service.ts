import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private sidebarOpenSubject = new BehaviorSubject<boolean>(true);
  isOpen$ = this.sidebarOpenSubject.asObservable();

  openSidebar() {
    this.sidebarOpenSubject.next(true);
  }

  closeSidebar() {
    this.sidebarOpenSubject.next(false);
  }

  toggleSidebar() {
    this.sidebarOpenSubject.next(!this.sidebarOpenSubject.value);
  }
}

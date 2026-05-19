import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private _isOpen$ = new BehaviorSubject<boolean>(true);
  readonly isOpen$ = this._isOpen$.asObservable();

  openSidebar() {
    this._isOpen$.next(true);
  }

  closeSidebar() {
    this._isOpen$.next(false);
  }

  toggleSidebar() {
    this._isOpen$.next(!this._isOpen$.value);
  }

  set(value: boolean) {
    this._isOpen$.next(value);
  }

  reset() {
    this._isOpen$.next(true);
  }
}

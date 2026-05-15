import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Appointment } from '../models/appoinment';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);

  constructor() {}

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  }

  login(email: string, password: string): boolean {
    if (email === 'admin@gmail.com' && password === 'admin123') {
      const user = {
        email,
        role: 'admin',
        token: 'fake-jwt-token',
      };

      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('currentUser');
  }

  getAppointmentsSnapshot() {
    return this.appointmentsSubject.getValue();
  }

  resetState() {
    this.appointmentsSubject.next([]);
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }
}

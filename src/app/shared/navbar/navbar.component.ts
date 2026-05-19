import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PatientService } from 'src/app/core/service/patient.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  todayAppointmentsCount = 0;
  private appointmentsSub?: Subscription;
  private routerSub?: Subscription;

  constructor(
    private router: Router,
    private patientService: PatientService,
  ) {}

  ngOnInit() {
    this.currentUser = this.patientService.getCurrentUser();
    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentUser = this.patientService.getCurrentUser();
      });

    this.appointmentsSub = this.patientService
      .getAppointments()
      .subscribe((appointments) => {
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();

        this.todayAppointmentsCount = appointments.filter((appt) => {
          if (appt.status !== 'Scheduled') {
            return false;
          }
          const appointmentDate =
            appt.appointmentDate instanceof Date
              ? appt.appointmentDate
              : new Date(appt.appointmentDate);
          return (
            appointmentDate.getFullYear() === todayYear &&
            appointmentDate.getMonth() === todayMonth &&
            appointmentDate.getDate() === todayDate
          );
        }).length;
      });
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.patientService.resetState();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.appointmentsSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  isLoginRoute(): boolean {
    return this.router.url === '/login';
  }
}

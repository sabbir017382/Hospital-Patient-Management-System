import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { PatientService } from 'src/app/core/service/patient.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  currentUser: any = null;
  todayAppointmentsCount = 0;

  constructor(
    private router: Router,
    private patientService: PatientService,
  ) {}

  ngOnInit() {
    this.currentUser = this.patientService.getCurrentUser();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentUser = this.patientService.getCurrentUser();
      });
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.patientService.resetState();
    this.router.navigate(['/login']);
  }

  isLoginRoute(): boolean {
    return this.router.url === '/login';
  }
}

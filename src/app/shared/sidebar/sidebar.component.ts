import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../core/service/sidebar.service';
import { PatientService } from '../../core/service/patient.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  isOpen = true;
  doctorMenuOpen = false;

  constructor(
    public sidebarService: SidebarService,
    private patientService: PatientService,
  ) {
    this.sidebarService.isOpen$.subscribe((value: boolean) => {
      this.isOpen = value;
    });
  }

  get currentUser() {
    return this.patientService.getCurrentUser();
  }

  toggleDoctorMenu() {
    this.doctorMenuOpen = !this.doctorMenuOpen;
  }

  closeSidebar() {
    this.sidebarService.closeSidebar();
  }
}

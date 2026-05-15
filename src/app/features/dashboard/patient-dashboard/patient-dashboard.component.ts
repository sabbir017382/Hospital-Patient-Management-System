import { Component } from '@angular/core';
import { SidebarService } from 'src/app/core/service/sidebar.service';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css'],
})
export class PatientDashboardComponent {
  constructor(private sidebarService: SidebarService) {}

  hideSidebar() {
    this.sidebarService.closeSidebar();
  }
}

import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SidebarService } from './core/service/sidebar.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'hospitalPatientManagementSystem';
  showNavbar = true;
  isSidebarOpen = true;

  constructor(
    private router: Router,
    public sidebarService: SidebarService,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentPath = this.router.url.split('?')[0].split('#')[0];
        this.showNavbar = currentPath !== '/login';
      });
    this.sidebarService.isOpen$.subscribe((value) => {
      this.isSidebarOpen = value;
    });
  }
}

import { Component } from '@angular/core';
import { SidebarService } from 'src/app/core/service/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  isOpen = true;

  constructor(public sidebarService: SidebarService) {
    this.sidebarService.isOpen$.subscribe((value) => {
      this.isOpen = value;
    });
  }

  closeSidebar() {
    this.sidebarService.closeSidebar();
  }
}

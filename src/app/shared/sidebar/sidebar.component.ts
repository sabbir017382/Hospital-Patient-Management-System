import { Component } from '@angular/core';
import { SidebarService } from '../../core/service/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  isOpen = true;

  constructor(public sidebarService: SidebarService) {
    this.sidebarService.isOpen$.subscribe((value: boolean) => {
      this.isOpen = value;
    });
  }

  closeSidebar() {
    this.sidebarService.closeSidebar();
  }
}

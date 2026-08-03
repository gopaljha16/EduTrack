import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  auth = inject(AuthService);

  navLinks = [
    { label: 'Dashboard', icon: 'fa-gauge-high', route: '/dashboard' },
    { label: 'Students', icon: 'fa-users', route: '/students' },
    { label: 'Attendance', icon: 'fa-calendar-days', route: '/attendance' },
    { label: 'Enroll Student', icon: 'fa-user-plus', route: '/students/new' },
  ];

  logout() { this.auth.logout(); }
}

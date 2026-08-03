import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  auth = inject(AuthService);
  private toast = inject(ToastService);

  navLinks = [
    { label: 'Dashboard', icon: 'fa-gauge-high', route: '/dashboard' },
    { label: 'Students', icon: 'fa-users', route: '/students' },
    { label: 'Attendance', icon: 'fa-calendar-days', route: '/attendance' },
    { label: 'Timetable', icon: 'fa-table-cells', route: '/timetable' },
    { label: 'Teachers', icon: 'fa-user-tie', route: '/teachers' },
    { label: 'Exams', icon: 'fa-file-signature', route: '/exams' },
    { label: 'Enroll Student', icon: 'fa-user-plus', route: '/students/new' },
  ];

  showPasswordModal = false;
  isUpdating = false;
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  updatePassword() {
    const { currentPassword, newPassword, confirmPassword } = this.passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      this.toast.error('Validation Error', 'Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.toast.error('Validation Error', 'New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      this.toast.error('Validation Error', 'Password must be at least 6 characters.');
      return;
    }

    this.isUpdating = true;

    this.auth.updatePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.toast.success('Updated', 'Your password has been changed successfully.');
        this.closeModal();
      },
      error: (err) => {
        this.toast.error('Update Failed', err?.error?.message || 'Failed to update password.');
        this.isUpdating = false;
      }
    });
  }

  closeModal() {
    this.showPasswordModal = false;
    this.isUpdating = false;
    this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  logout() { this.auth.logout(); }
}

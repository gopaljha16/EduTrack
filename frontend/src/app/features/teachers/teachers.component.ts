import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeacherService, Teacher } from '../../core/services/teacher.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teachers.component.html',
})
export class TeachersComponent implements OnInit {
  private teacherService = inject(TeacherService);
  private toast = inject(ToastService);

  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  isLoading = false;
  isSaving = false;
  search = '';

  // Modal State
  showAddModal = false;
  isEditMode = false;
  currentTeacherId: string | null = null;
  newTeacher: Partial<Teacher> = {
    name: '',
    email: '',
    phone: '',
    specialization: '',
    assignedClass: '',
    status: 'Active',
  };

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading = true;
    this.teacherService.getTeachers().subscribe({
      next: (res: any) => {
        this.teachers = res.teachers || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Error', 'Failed to retrieve teacher list.');
        this.isLoading = false;
      }
    });
  }

  applyFilter() {
    const q = this.search.toLowerCase().trim();
    this.filteredTeachers = this.teachers.filter(t =>
      !q || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.specialization.toLowerCase().includes(q)
    );
  }

  save() {
    const { name, email, phone, specialization } = this.newTeacher;
    if (!name || !email || !phone || !specialization) {
      this.toast.error('Validation Error', 'Please fill in all required fields.');
      return;
    }

    this.isSaving = true;

    if (this.isEditMode && this.currentTeacherId) {
      this.teacherService.updateTeacher(this.currentTeacherId, this.newTeacher).subscribe({
        next: () => {
          this.toast.success('Updated', 'Teacher profile updated.');
          this.load();
          this.closeModal();
        },
        error: (err) => {
          this.toast.error('Update Failed', err?.error?.message || 'Error occurred.');
          this.isSaving = false;
        }
      });
    } else {
      this.teacherService.createTeacher(this.newTeacher).subscribe({
        next: () => {
          this.toast.success('Created', 'Teacher record created.');
          this.load();
          this.closeModal();
        },
        error: (err) => {
          this.toast.error('Creation Failed', err?.error?.message || 'Error occurred.');
          this.isSaving = false;
        }
      });
    }
  }

  openEdit(teacher: Teacher) {
    this.isEditMode = true;
    this.currentTeacherId = teacher._id || null;
    this.newTeacher = { ...teacher };
    this.showAddModal = true;
  }

  deleteTeacher(id: string, name: string) {
    if (confirm(`Are you sure you want to remove teacher: ${name}?`)) {
      this.teacherService.deleteTeacher(id).subscribe({
        next: () => {
          this.toast.info('Deleted', 'Teacher record removed.');
          this.load();
        },
        error: () => this.toast.error('Error', 'Failed to delete record.')
      });
    }
  }

  closeModal() {
    this.showAddModal = false;
    this.isEditMode = false;
    this.currentTeacherId = null;
    this.isSaving = false;
    this.newTeacher = { name: '', email: '', phone: '', specialization: '', assignedClass: '', status: 'Active' };
  }

  getAvatarColor(name: string): string {
    const colors = ['#7c6cf8','#22d3ee','#10b981','#f59e0b','#ec4899','#ef4444','#8b5cf6','#14b8a6'];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const p = name.trim().split(' ');
    return p.length > 1 ? (p[0][0]+p[1][0]).toUpperCase() : name.slice(0,2).toUpperCase();
  }
}

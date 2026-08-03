import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService, Student } from '../../../core/services/student.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './student-list.component.html',
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  isLoading = false;
  showConfirm = false;
  studentToDelete: Student | null = null;

  search = '';
  filterClass = '';
  filterStatus = '';
  filterFee = '';

  classes: string[] = [];

  constructor(private studentService: StudentService, private toast: ToastService) {}

  ngOnInit() { this.load(); }

  load() {
    this.isLoading = true;
    this.studentService.getStudents().subscribe({
      next: (res: any) => {
        this.students = res.student || [];
        this.classes = [...new Set(this.students.map((s: Student) => s.studentClass).filter(Boolean))].sort() as string[];
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => { this.toast.error('Error', 'Failed to load students.'); this.isLoading = false; }
    });
  }

  applyFilters() {
    this.filteredStudents = this.students.filter(s => {
      const q = this.search.toLowerCase();
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || String(s.phone).includes(q);
      const matchClass  = !this.filterClass  || s.studentClass === this.filterClass;
      const matchStatus = !this.filterStatus || s.status === this.filterStatus;
      const matchFee    = !this.filterFee    || s.feeStatus === this.filterFee;
      return matchSearch && matchClass && matchStatus && matchFee;
    });
  }

  confirmDelete(student: Student) { this.studentToDelete = student; this.showConfirm = true; }
  cancelDelete() { this.showConfirm = false; this.studentToDelete = null; }

  proceedDelete() {
    if (!this.studentToDelete?._id) return;
    const name = this.studentToDelete.name;
    this.studentService.deleteStudent(this.studentToDelete._id).subscribe({
      next: () => { this.toast.info('Deleted', `${name} has been removed.`); this.load(); },
      error: () => this.toast.error('Error', 'Could not delete student.')
    });
    this.cancelDelete();
  }

  exportCsv() {
    this.studentService.exportCsv(this.filteredStudents);
    this.toast.success('Export', 'CSV file downloaded successfully.');
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

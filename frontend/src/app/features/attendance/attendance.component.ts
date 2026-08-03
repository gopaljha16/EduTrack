import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../core/services/attendance.service';
import { StudentService } from '../../core/services/student.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.component.html',
})
export class AttendanceComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private studentService = inject(StudentService);
  private toast = inject(ToastService);

  classes: string[] = [];
  selectedClass = '';
  selectedDate = new Date().toISOString().slice(0, 10);
  records: any[] = []; // [{ student: {_id, name, rollNumber}, status: 'Present'|'Absent'|'Late', remarks: '' }]
  isLoading = false;
  isSaving = false;

  ngOnInit() {
    this.loadClasses();
  }

  loadClasses() {
    this.studentService.getStudents().subscribe({
      next: (res: any) => {
        const list = res.student || [];
        this.classes = [...new Set(list.map((s: any) => s.studentClass).filter(Boolean))].sort() as string[];
        if (this.classes.length > 0) {
          this.selectedClass = this.classes[0];
          this.loadAttendance();
        }
      },
      error: () => this.toast.error('Error', 'Failed to retrieve classes.')
    });
  }

  loadAttendance() {
    if (!this.selectedClass || !this.selectedDate) return;
    this.isLoading = true;
    this.attendanceService.getClassAttendance(this.selectedDate, this.selectedClass).subscribe({
      next: (res: any) => {
        // Response format: { status: "success", date, attendance: [{ student, status, remarks }] }
        this.records = res.attendance.map((r: any) => ({
          student: r.student,
          status: r.status || 'Present', // Default to Present if not marked
          remarks: r.remarks || ''
        }));
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Error', 'Failed to load attendance.');
        this.isLoading = false;
      }
    });
  }

  setStatusAll(status: 'Present' | 'Absent' | 'Late') {
    this.records.forEach(r => r.status = status);
    this.toast.info('Attendance Action', `Set all student statuses to ${status}.`);
  }

  save() {
    if (this.records.length === 0) return;
    this.isSaving = true;
    const formattedRecords = this.records.map(r => ({
      student: r.student._id,
      status: r.status,
      remarks: r.remarks
    }));

    this.attendanceService.markAttendance(this.selectedDate, formattedRecords).subscribe({
      next: () => {
        this.toast.success('Saved', 'Attendance updated successfully.');
        this.isSaving = false;
      },
      error: (err) => {
        this.toast.error('Failed to save', err?.error?.message || 'Error occurred.');
        this.isSaving = false;
      }
    });
  }

  getAvatarColor(name: string): string {
    const colors = ['#7c6cf8','#22d3ee','#10b981','#f59e0b','#ec4899','#ef4444','#8b5cf6','#14b8a6'];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const p = name.trim().split(' ');
    return p.length > 1 ? (p[0][0]+p[1][0]).toUpperCase() : name.slice(0,2).toUpperCase();
  }
}

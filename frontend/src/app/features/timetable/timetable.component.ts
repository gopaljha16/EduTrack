import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimetableService } from '../../core/services/timetable.service';
import { StudentService } from '../../core/services/student.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timetable.component.html',
})
export class TimetableComponent implements OnInit {
  private timetableService = inject(TimetableService);
  private studentService = inject(StudentService);
  private toast = inject(ToastService);

  classes: string[] = [];
  selectedClass = '';
  schedules: any[] = [];
  isLoading = false;
  isSaving = false;

  // Days list to render columns/tabs
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  activeDay = 'Monday';

  // Add Period Modal state
  showAddModal = false;
  newPeriod = {
    day: 'Monday',
    subject: '',
    startTime: '',
    endTime: '',
    teacher: '',
    room: '',
  };

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
          this.loadTimetable();
        }
      },
      error: () => this.toast.error('Error', 'Failed to retrieve classes.')
    });
  }

  loadTimetable() {
    if (!this.selectedClass) return;
    this.isLoading = true;
    this.timetableService.getClassSchedules(this.selectedClass).subscribe({
      next: (res: any) => {
        this.schedules = res.schedules || [];
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Error', 'Failed to load timetable.');
        this.isLoading = false;
      }
    });
  }

  getFilteredSchedules(day: string): any[] {
    return this.schedules.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  addPeriod() {
    const { subject, startTime, endTime } = this.newPeriod;
    if (!subject || !startTime || !endTime) {
      this.toast.error('Validation Error', 'Please fill in all required fields.');
      return;
    }

    this.isSaving = true;
    const payload = { ...this.newPeriod, studentClass: this.selectedClass };

    this.timetableService.addSchedule(payload).subscribe({
      next: () => {
        this.toast.success('Period Added', 'Timetable slot created successfully.');
        this.loadTimetable();
        this.closeModal();
      },
      error: (err) => {
        this.toast.error('Failed to Add', err?.error?.message || 'Error occurred.');
        this.isSaving = false;
      }
    });
  }

  deletePeriod(id: string) {
    if (confirm('Are you sure you want to delete this class period?')) {
      this.timetableService.deleteSchedule(id).subscribe({
        next: () => {
          this.toast.info('Deleted', 'Period removed from timetable.');
          this.loadTimetable();
        },
        error: () => this.toast.error('Error', 'Failed to delete period.')
      });
    }
  }

  closeModal() {
    this.showAddModal = false;
    this.isSaving = false;
    this.newPeriod = {
      day: this.activeDay,
      subject: '',
      startTime: '',
      endTime: '',
      teacher: '',
      room: '',
    };
  }

  openModal() {
    this.newPeriod.day = this.activeDay;
    this.showAddModal = true;
  }
}

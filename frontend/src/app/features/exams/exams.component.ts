import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamService, Exam } from '../../core/services/exam.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exams.component.html',
})
export class ExamsComponent implements OnInit {
  private examService = inject(ExamService);
  private toast = inject(ToastService);

  exams: Exam[] = [];
  filteredExams: Exam[] = [];
  isLoading = false;
  isSaving = false;
  searchClass = '';

  // Modal State
  showAddModal = false;
  isEditMode = false;
  currentExamId: string | null = null;
  newExam: Partial<Exam> = {
    studentClass: '',
    subject: '',
    examType: 'Midterm',
    date: '',
    startTime: '',
    endTime: '',
    room: '',
  };

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading = true;
    this.examService.getExams().subscribe({
      next: (res: any) => {
        this.exams = res.exams || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Error', 'Failed to retrieve exam date sheets.');
        this.isLoading = false;
      }
    });
  }

  applyFilter() {
    const q = this.searchClass.toLowerCase().trim();
    this.filteredExams = this.exams.filter(e =>
      !q || e.studentClass.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q)
    );
  }

  save() {
    const { studentClass, subject, examType, date, startTime, endTime, room } = this.newExam;
    if (!studentClass || !subject || !examType || !date || !startTime || !endTime || !room) {
      this.toast.error('Validation Error', 'Please fill in all fields.');
      return;
    }

    this.isSaving = true;

    if (this.isEditMode && this.currentExamId) {
      this.examService.updateExam(this.currentExamId, this.newExam).subscribe({
        next: () => {
          this.toast.success('Updated', 'Exam schedule modified successfully.');
          this.load();
          this.closeModal();
        },
        error: (err) => {
          this.toast.error('Update Failed', err?.error?.message || 'Error occurred.');
          this.isSaving = false;
        }
      });
    } else {
      this.examService.createExam(this.newExam).subscribe({
        next: () => {
          this.toast.success('Scheduled', 'Exam schedule added successfully.');
          this.load();
          this.closeModal();
        },
        error: (err) => {
          this.toast.error('Scheduling Failed', err?.error?.message || 'Error occurred.');
          this.isSaving = false;
        }
      });
    }
  }

  openEdit(exam: Exam) {
    this.isEditMode = true;
    this.currentExamId = exam._id || null;
    this.newExam = {
      ...exam,
      date: exam.date ? new Date(exam.date).toISOString().slice(0, 10) : ''
    };
    this.showAddModal = true;
  }

  deleteExam(id: string, subject: string, className: string) {
    if (confirm(`Cancel and delete exam for Class ${className}: ${subject}?`)) {
      this.examService.deleteExam(id).subscribe({
        next: () => {
          this.toast.info('Deleted', 'Exam schedule record removed.');
          this.load();
        },
        error: () => this.toast.error('Error', 'Failed to remove schedule.')
      });
    }
  }

  closeModal() {
    this.showAddModal = false;
    this.isEditMode = false;
    this.currentExamId = null;
    this.isSaving = false;
    this.newExam = { studentClass: '', subject: '', examType: 'Midterm', date: '', startTime: '', endTime: '', room: '' };
  }
}

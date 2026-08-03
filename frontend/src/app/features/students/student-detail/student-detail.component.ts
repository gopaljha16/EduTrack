import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService, Student } from '../../../core/services/student.service';
import { ToastService } from '../../../core/services/toast.service';
import { GradeService } from '../../../core/services/grade.service';
import { PaymentService } from '../../../core/services/payment.service';
import { AttendanceService } from '../../../core/services/attendance.service';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './student-detail.component.html',
})
export class StudentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentService);
  private toast = inject(ToastService);
  private gradeService = inject(GradeService);
  private paymentService = inject(PaymentService);
  private attendanceService = inject(AttendanceService);

  student: Student | null = null;
  isLoading = true;
  showConfirm = false;

  // Active Tab: 'overview' | 'grades' | 'fees' | 'attendance'
  activeTab: 'overview' | 'grades' | 'fees' | 'attendance' = 'overview';

  // Grades Tab State
  grades: any[] = [];
  overallPercentage: string = '0';
  showAddGradeModal = false;
  newGrade = {
    subject: '',
    marksObtained: 0,
    maxMarks: 100,
    term: 'Midterm',
    remarks: '',
  };

  // Fees Tab State
  payments: any[] = [];
  totalPaid = 0;
  showAddPaymentModal = false;
  newPayment = {
    amount: 0,
    paymentMethod: 'Online' as 'Cash' | 'Card' | 'Bank Transfer' | 'Online',
    referenceNumber: '',
    remarks: '',
  };

  // Attendance Tab State
  attendanceStats: any = null;
  attendanceRecords: any[] = [];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadStudent(id);
  }

  loadStudent(id: string) {
    this.studentService.getStudentById(id).subscribe({
      next: (res: any) => {
        this.student = res.student;
        this.isLoading = false;
        // Pre-fetch all tab data in parallel/background
        this.loadGrades();
        this.loadPayments();
        this.loadAttendance();
      },
      error: () => {
        this.toast.error('Error', 'Student not found.');
        this.router.navigate(['/students']);
      }
    });
  }

  // --- Grades Operations ---
  loadGrades() {
    if (!this.student?._id) return;
    this.gradeService.getStudentGrades(this.student._id).subscribe({
      next: (res: any) => {
        this.grades = res.grades || [];
        this.overallPercentage = res.overallPercentage || '0';
      }
    });
  }

  addGrade() {
    if (!this.student?._id || !this.newGrade.subject || this.newGrade.marksObtained === null) return;
    const payload = { ...this.newGrade, student: this.student._id };
    this.gradeService.addGrade(payload).subscribe({
      next: () => {
        this.toast.success('Added', 'Academic score added successfully.');
        this.loadGrades();
        this.closeGradeModal();
      },
      error: (err) => this.toast.error('Error', err?.error?.message || 'Failed to add marks.')
    });
  }

  deleteGrade(id: string) {
    this.gradeService.deleteGrade(id).subscribe({
      next: () => {
        this.toast.info('Removed', 'Marks entry deleted.');
        this.loadGrades();
      }
    });
  }

  closeGradeModal() {
    this.showAddGradeModal = false;
    this.newGrade = { subject: '', marksObtained: 0, maxMarks: 100, term: 'Midterm', remarks: '' };
  }

  // --- Fees Operations ---
  loadPayments() {
    if (!this.student?._id) return;
    this.paymentService.getStudentPayments(this.student._id).subscribe({
      next: (res: any) => {
        this.payments = res.payments || [];
        this.totalPaid = res.totalPaid || 0;
      }
    });
  }

  addPayment() {
    if (!this.student?._id || !this.newPayment.amount || this.newPayment.amount <= 0) return;
    const payload = { ...this.newPayment, student: this.student._id };
    this.paymentService.addPayment(payload).subscribe({
      next: () => {
        this.toast.success('Payment Logged', 'Transaction saved successfully.');
        this.loadPayments();
        if (this.student) this.student.feeStatus = 'Paid'; // Live state update
        this.closePaymentModal();
      },
      error: (err) => this.toast.error('Error', err?.error?.message || 'Transaction failed.')
    });
  }

  deletePayment(id: string) {
    this.paymentService.deletePayment(id).subscribe({
      next: () => {
        this.toast.info('Removed', 'Transaction record deleted.');
        this.loadPayments();
      }
    });
  }

  closePaymentModal() {
    this.showAddPaymentModal = false;
    this.newPayment = { amount: 0, paymentMethod: 'Online', referenceNumber: '', remarks: '' };
  }

  // --- Attendance Operations ---
  loadAttendance() {
    if (!this.student?._id) return;
    this.attendanceService.getStudentAttendance(this.student._id).subscribe({
      next: (res: any) => {
        this.attendanceStats = res.stats;
        this.attendanceRecords = res.records || [];
      }
    });
  }

  // --- General Helpers ---
  deleteStudent() {
    if (!this.student?._id) return;
    this.studentService.deleteStudent(this.student._id).subscribe({
      next: () => {
        this.toast.info('Deleted', `${this.student?.name} removed.`);
        this.router.navigate(['/students']);
      },
      error: () => this.toast.error('Error', 'Could not delete student.')
    });
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

  // Utility helper for conditional letter grade coloring
  getGradeBadgeClass(letter: string): string {
    if (letter.startsWith('A')) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (letter.startsWith('B')) return 'bg-brand-500/10 text-brand-400 border border-brand-500/20';
    if (letter.startsWith('C')) return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
    if (letter.startsWith('D')) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-red-500/10 text-red-400 border border-red-500/20';
  }
}

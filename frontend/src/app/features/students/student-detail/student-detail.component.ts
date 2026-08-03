import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService, Student } from '../../../core/services/student.service';
import { ToastService } from '../../../core/services/toast.service';
import { GradeService } from '../../../core/services/grade.service';
import { PaymentService } from '../../../core/services/payment.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { BehaviorService } from '../../../core/services/behavior.service';
import { PtmService } from '../../../core/services/ptm.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { ExamService } from '../../../core/services/exam.service';
import { HostelService } from '../../../core/services/hostel.service';
import { TransportService } from '../../../core/services/transport.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { TimetableService } from '../../../core/services/timetable.service';
import { LibraryService } from '../../../core/services/library.service';
import { MedicalService } from '../../../core/services/medical.service';

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
  private behaviorService = inject(BehaviorService);
  private ptmService = inject(PtmService);
  private teacherService = inject(TeacherService);
  private examService = inject(ExamService);
  private hostelService = inject(HostelService);
  private transportService = inject(TransportService);
  private invoiceService = inject(InvoiceService);
  private timetableService = inject(TimetableService);
  private libraryService = inject(LibraryService);
  private medicalService = inject(MedicalService);

  student: Student | null = null;
  isLoading = true;
  showConfirm = false;
  showIdCardPreview = false;
  showReportCardModal = false;

  // Active Tab
  activeTab: 'overview' | 'grades' | 'fees' | 'attendance' | 'discipline' | 'ptm' | 'exams' | 'schedule' | 'library' | 'medical' = 'overview';
  examsList: any[] = [];

  // Weekly Timetable State
  timetableList: any[] = [];
  showAddTimetableModal = false;
  newTimetable = {
    day: 'Monday',
    subject: '',
    startTime: '09:00',
    endTime: '09:45',
    teacher: '',
    room: ''
  };

  // Library Checkouts State
  libraryLogs: any[] = [];
  showIssueBookModal = false;
  newBook = {
    bookTitle: '',
    author: '',
    isbn: '',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().slice(0, 10)
  };

  // Health Dossier State
  medicalDossier: any = null;
  showClinicVisitModal = false;
  newVisit = {
    reason: '',
    treatment: ''
  };

  // Hostel Allocation State
  hostelAllocation: any = null;
  showHostelModal = false;
  newHostel = {
    hostelName: '',
    roomNumber: '',
    bedNumber: '',
    monthlyRent: 0
  };

  // Transport Allocation State
  transportAllocation: any = null;
  showTransportModal = false;
  newTransport = {
    routeName: '',
    busNumber: '',
    driverName: '',
    driverPhone: '',
    monthlyFare: 0
  };

  // Invoicing Ledger State
  invoices: any[] = [];
  showAddInvoiceModal = false;
  newInvoice = {
    amount: 0,
    month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().slice(0, 10)
  };

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

  // Attendance Calendar UI State
  currentCalendarYear = new Date().getFullYear();
  currentCalendarMonth = new Date().getMonth(); // 0-indexed
  calendarDays: { dayNumber: number; status?: 'Present' | 'Late' | 'Absent'; dateString: string }[] = [];
  monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Discipline Tab State
  behaviorLogs: any[] = [];
  totalBehaviorPoints = 0;
  showAddBehaviorModal = false;
  newBehavior = {
    category: 'Commendation' as 'Commendation' | 'Warning' | 'Suspension',
    points: 10,
    details: '',
    date: new Date().toISOString().slice(0, 10),
  };

  // PTM Tab State
  ptmMeetings: any[] = [];
  teachersList: any[] = [];
  showAddPtmModal = false;
  newPtm = {
    teacher: '',
    dateTime: '',
    topic: '',
    meetingLink: '',
    remarks: '',
  };

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
        this.loadBehaviorLogs();
        this.loadPTMMeetings();
        this.loadTeachersList();
        this.loadExams();
        this.loadHostel();
        this.loadTransport();
        this.loadInvoices();
        this.loadTimetable();
        this.loadLibraryLogs();
        this.loadMedicalDossier();
      },
      error: () => {
        this.toast.error('Error', 'Student not found.');
        this.router.navigate(['/students']);
      }
    });
  }

  printTranscript() {
    window.print();
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
        this.loadInvoices();
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
        this.loadInvoices();
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
        this.buildCalendar();
      }
    });
  }

  buildCalendar() {
    const year = this.currentCalendarYear;
    const month = this.currentCalendarMonth;
    const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const numDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Pad empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push({ dayNumber: 0, dateString: '' });
    }
    // Add month days
    for (let d = 1; d <= numDays; d++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      // Look for a matching attendance record on this date
      const record = this.attendanceRecords.find(r => {
        const rDate = new Date(r.date);
        const rStr = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, '0')}-${String(rDate.getDate()).padStart(2, '0')}`;
        return rStr === dStr;
      });

      days.push({
        dayNumber: d,
        status: record ? record.status : undefined,
        dateString: dStr
      });
    }
    this.calendarDays = days;
  }

  prevCalendarMonth() {
    if (this.currentCalendarMonth === 0) {
      this.currentCalendarMonth = 11;
      this.currentCalendarYear--;
    } else {
      this.currentCalendarMonth--;
    }
    this.buildCalendar();
  }

  nextCalendarMonth() {
    if (this.currentCalendarMonth === 11) {
      this.currentCalendarMonth = 0;
      this.currentCalendarYear++;
    } else {
      this.currentCalendarMonth++;
    }
    this.buildCalendar();
  }

  // --- Discipline Operations ---
  loadBehaviorLogs() {
    if (!this.student?._id) return;
    this.behaviorService.getStudentLogs(this.student._id).subscribe({
      next: (res: any) => {
        this.behaviorLogs = res.logs || [];
        this.totalBehaviorPoints = res.totalPoints || 0;
      }
    });
  }

  addBehaviorLog() {
    if (!this.student?._id || !this.newBehavior.details) return;
    const payload = { ...this.newBehavior, student: this.student._id };
    this.behaviorService.addLog(payload).subscribe({
      next: () => {
        this.toast.success('Recorded', 'Disciplinary entry recorded successfully.');
        this.loadBehaviorLogs();
        this.closeBehaviorModal();
      },
      error: () => this.toast.error('Error', 'Failed to save disciplinary log.')
    });
  }

  deleteBehaviorLog(id: string) {
    if (confirm('Are you sure you want to remove this log?')) {
      this.behaviorService.deleteLog(id).subscribe({
        next: () => {
          this.toast.info('Removed', 'Behavioral entry removed.');
          this.loadBehaviorLogs();
        }
      });
    }
  }

  closeBehaviorModal() {
    this.showAddBehaviorModal = false;
    this.newBehavior = {
      category: 'Commendation',
      points: 10,
      details: '',
      date: new Date().toISOString().slice(0, 10)
    };
  }

  // --- PTM Operations ---
  loadPTMMeetings() {
    if (!this.student?._id) return;
    this.ptmService.getStudentPTMs(this.student._id).subscribe({
      next: (res: any) => {
        this.ptmMeetings = res.meetings || [];
      }
    });
  }

  loadTeachersList() {
    this.teacherService.getTeachers().subscribe({
      next: (res: any) => {
        this.teachersList = res.teachers || [];
        if (this.teachersList.length > 0) {
          this.newPtm.teacher = this.teachersList[0]._id;
        }
      }
    });
  }

  schedulePTM() {
    const { teacher, dateTime, topic } = this.newPtm;
    if (!this.student?._id || !teacher || !dateTime || !topic) return;

    const payload = { ...this.newPtm, student: this.student._id };
    this.ptmService.schedulePTM(payload).subscribe({
      next: () => {
        this.toast.success('Scheduled', 'Parent-Teacher Meeting booked successfully.');
        this.loadPTMMeetings();
        this.closePtmModal();
      },
      error: (err) => this.toast.error('Error', err?.error?.message || 'Failed to book slot.')
    });
  }

  updatePTMStatus(id: string, status: 'Scheduled' | 'Completed' | 'Cancelled') {
    this.ptmService.updatePTM(id, { status }).subscribe({
      next: () => {
        this.toast.success('Status Updated', `Meeting status marked as ${status}.`);
        this.loadPTMMeetings();
      }
    });
  }

  deletePTM(id: string) {
    if (confirm('Are you sure you want to cancel and delete this meeting slot?')) {
      this.ptmService.deletePTM(id).subscribe({
        next: () => {
          this.toast.info('Cancelled', 'Meeting schedule slot removed.');
          this.loadPTMMeetings();
        }
      });
    }
  }

  closePtmModal() {
    this.showAddPtmModal = false;
    this.newPtm = {
      teacher: this.teachersList.length > 0 ? this.teachersList[0]._id : '',
      dateTime: '',
      topic: '',
      meetingLink: '',
      remarks: ''
    };
  }

  // --- Exam Operations ---
  loadExams() {
    if (!this.student?.studentClass) return;
    this.examService.getClassExams(this.student.studentClass).subscribe({
      next: (res: any) => {
        this.examsList = res.exams || [];
      }
    });
  }

  // --- Hostel Operations ---
  loadHostel() {
    if (!this.student?._id) return;
    this.hostelService.getHostelAllocation(this.student._id).subscribe({
      next: (res: any) => {
        this.hostelAllocation = res.allocation;
        if (this.hostelAllocation) {
          this.newHostel = { ...this.hostelAllocation };
        }
      }
    });
  }

  allocateHostel() {
    if (!this.student?._id) return;
    const payload = { ...this.newHostel, student: this.student._id };
    this.hostelService.allocateHostel(payload).subscribe({
      next: () => {
        this.toast.success('Allocated', 'Hostel accommodation saved.');
        this.loadHostel();
        this.closeHostelModal();
      }
    });
  }

  vacateHostel() {
    if (!this.student?._id) return;
    if (confirm('Are you sure you want to vacate this hostel room assignment?')) {
      this.hostelService.vacateHostel(this.student._id).subscribe({
        next: () => {
          this.toast.info('Vacated', 'Hostel room vacated.');
          this.hostelAllocation = null;
          this.newHostel = { hostelName: '', roomNumber: '', bedNumber: '', monthlyRent: 0 };
        }
      });
    }
  }

  closeHostelModal() {
    this.showHostelModal = false;
  }

  // --- Transport Operations ---
  loadTransport() {
    if (!this.student?._id) return;
    this.transportService.getTransportAllocation(this.student._id).subscribe({
      next: (res: any) => {
        this.transportAllocation = res.allocation;
        if (this.transportAllocation) {
          this.newTransport = { ...this.transportAllocation };
        }
      }
    });
  }

  allocateTransport() {
    if (!this.student?._id) return;
    const payload = { ...this.newTransport, student: this.student._id };
    this.transportService.allocateTransport(payload).subscribe({
      next: () => {
        this.toast.success('Allocated', 'Bus route transport saved.');
        this.loadTransport();
        this.closeTransportModal();
      }
    });
  }

  cancelTransport() {
    if (!this.student?._id) return;
    if (confirm('Are you sure you want to cancel transport bus route seat booking?')) {
      this.transportService.cancelTransport(this.student._id).subscribe({
        next: () => {
          this.toast.info('Cancelled', 'Bus seat route vacated.');
          this.transportAllocation = null;
          this.newTransport = { routeName: '', busNumber: '', driverName: '', driverPhone: '', monthlyFare: 0 };
        }
      });
    }
  }

  closeTransportModal() {
    this.showTransportModal = false;
  }

  // --- Invoice Operations ---
  loadInvoices() {
    if (!this.student?._id) return;
    this.invoiceService.getStudentInvoices(this.student._id).subscribe({
      next: (res: any) => {
        this.invoices = res.invoices || [];
      }
    });
  }

  generateInvoice() {
    const { amount, month, dueDate } = this.newInvoice;
    if (!this.student?._id || !amount || !month || !dueDate) return;

    const payload = { ...this.newInvoice, student: this.student._id };
    this.invoiceService.generateInvoice(payload).subscribe({
      next: () => {
        this.toast.success('Generated', 'Fee demand invoice generated.');
        this.loadInvoices();
        this.closeInvoiceModal();
      }
    });
  }

  deleteInvoice(id: string) {
    if (confirm('Are you sure you want to remove this invoice demand?')) {
      this.invoiceService.deleteInvoice(id).subscribe({
        next: () => {
          this.toast.info('Removed', 'Invoice deleted.');
          this.loadInvoices();
        }
      });
    }
  }
  closeInvoiceModal() {
    this.showAddInvoiceModal = false;
    this.newInvoice = {
      amount: 0,
      month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().slice(0, 10)
    };
  }

  // --- Timetable Operations ---
  loadTimetable() {
    if (!this.student?.studentClass) return;
    this.timetableService.getClassSchedules(this.student.studentClass).subscribe({
      next: (res: any) => {
        this.timetableList = res.schedules || [];
      }
    });
  }

  addTimetablePeriod() {
    if (!this.student?.studentClass || !this.newTimetable.subject || !this.newTimetable.startTime) return;
    const payload = { ...this.newTimetable, studentClass: this.student.studentClass };
    this.timetableService.addSchedule(payload).subscribe({
      next: () => {
        this.toast.success('Scheduled', 'Class timetable slot added.');
        this.loadTimetable();
        this.closeTimetableModal();
      },
      error: (err) => this.toast.error('Scheduling Error', err?.error?.message || 'Conflict detected.')
    });
  }

  deleteTimetablePeriod(id: string) {
    if (confirm('Are you sure you want to remove this timetable slot?')) {
      this.timetableService.deleteSchedule(id).subscribe({
        next: () => {
          this.toast.info('Removed', 'Timetable slot deleted.');
          this.loadTimetable();
        }
      });
    }
  }

  closeTimetableModal() {
    this.showAddTimetableModal = false;
    this.newTimetable = {
      day: 'Monday',
      subject: '',
      startTime: '09:00',
      endTime: '09:45',
      teacher: this.teachersList.length > 0 ? this.teachersList[0]._id : '',
      room: ''
    };
  }

  // --- Library Operations ---
  loadLibraryLogs() {
    if (!this.student?._id) return;
    this.libraryService.getStudentBooks(this.student._id).subscribe({
      next: (res: any) => {
        this.libraryLogs = res.books || [];
      }
    });
  }

  issueLibraryBook() {
    const { bookTitle, author, dueDate } = this.newBook;
    if (!this.student?._id || !bookTitle || !author || !dueDate) return;

    const payload = { ...this.newBook, student: this.student._id };
    this.libraryService.issueBook(payload).subscribe({
      next: () => {
        this.toast.success('Book Issued', 'Library ledger checked out.');
        this.loadLibraryLogs();
        this.closeLibraryModal();
      }
    });
  }

  returnLibraryBook(id: string) {
    this.libraryService.returnBook(id).subscribe({
      next: () => {
        this.toast.success('Returned', 'Book returned to library inventory.');
        this.loadLibraryLogs();
      }
    });
  }

  deleteLibraryLog(id: string) {
    if (confirm('Are you sure you want to delete library check-out log?')) {
      this.libraryService.deleteLibraryLog(id).subscribe({
        next: () => {
          this.toast.info('Removed', 'Library record deleted.');
          this.loadLibraryLogs();
        }
      });
    }
  }

  closeLibraryModal() {
    this.showIssueBookModal = false;
    this.newBook = {
      bookTitle: '',
      author: '',
      isbn: '',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().slice(0, 10)
    };
  }

  // --- Medical Dossier Operations ---
  loadMedicalDossier() {
    if (!this.student?._id) return;
    this.medicalService.getStudentMedical(this.student._id).subscribe({
      next: (res: any) => {
        this.medicalDossier = res.medical;
      }
    });
  }

  saveMedicalDossierInfo() {
    if (!this.student?._id || !this.medicalDossier) return;
    const payload = {
      student: this.student._id,
      bloodGroup: this.medicalDossier.bloodGroup,
      allergies: this.medicalDossier.allergies,
      medications: this.medicalDossier.medications
    };
    this.medicalService.updateMedical(payload).subscribe({
      next: () => {
        this.toast.success('Saved', 'Medical record parameters saved.');
        this.loadMedicalDossier();
      }
    });
  }

  addClinicCheckinVisit() {
    const { reason, treatment } = this.newVisit;
    if (!this.student?._id || !reason || !treatment) return;

    const payload = { ...this.newVisit, student: this.student._id };
    this.medicalService.recordClinicVisit(payload).subscribe({
      next: () => {
        this.toast.success('Logged', 'Clinic check-in visit recorded.');
        this.loadMedicalDossier();
        this.closeClinicVisitModal();
      }
    });
  }

  deleteClinicCheckinVisit(visitId: string) {
    if (!this.student?._id) return;
    if (confirm('Are you sure you want to delete this clinic visit check-in record?')) {
      this.medicalService.deleteClinicVisit(this.student._id, visitId).subscribe({
        next: (res: any) => {
          this.toast.info('Removed', 'Clinic visit entry deleted.');
          this.medicalDossier = res.medical;
        }
      });
    }
  }

  closeClinicVisitModal() {
    this.showClinicVisitModal = false;
    this.newVisit = { reason: '', treatment: '' };
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

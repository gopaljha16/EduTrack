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
  viewMode: 'table' | 'grid' = 'table';

  // Promotion Wizard State
  showPromoteModal = false;
  isProcessingPromotion = false;
  promotionData = {
    sourceClass: '',
    targetClass: '',
    action: 'promote' as 'promote' | 'graduate'
  };

  search = '';
  filterClass = '';
  filterStatus = '';
  filterFee = '';

  classes: string[] = [];

  // Sorting State
  sortKey = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

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
    let result = this.students.filter(s => {
      const q = this.search.toLowerCase();
      const matchSearch = !q || (s.name && s.name.toLowerCase().includes(q)) || (s.email && s.email.toLowerCase().includes(q)) || (s.phone && String(s.phone).includes(q));
      const matchClass  = !this.filterClass  || s.studentClass === this.filterClass;
      const matchStatus = !this.filterStatus || s.status === this.filterStatus;
      const matchFee    = !this.filterFee    || s.feeStatus === this.filterFee;
      return matchSearch && matchClass && matchStatus && matchFee;
    });

    // Dynamic sort
    result.sort((a: any, b: any) => {
      let valA = a[this.sortKey] ?? '';
      let valB = b[this.sortKey] ?? '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredStudents = result;
  }

  setSort(key: string) {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
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

  triggerImport() {
    const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    this.isLoading = true;

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

        if (lines.length <= 1) {
          this.toast.error('Import Failed', 'CSV file is empty or missing headers.');
          this.isLoading = false;
          return;
        }

        // Parse headers to match indexes
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const nameIdx = headers.indexOf('name');
        const ageIdx = headers.indexOf('age');
        const emailIdx = headers.indexOf('email');
        const classIdx = headers.indexOf('class');
        const statusIdx = headers.indexOf('status');
        const feeIdx = headers.indexOf('fee status');
        const phoneIdx = headers.indexOf('phone');
        const addressIdx = headers.indexOf('address');

        if (nameIdx === -1 || ageIdx === -1 || emailIdx === -1 || classIdx === -1 || phoneIdx === -1 || addressIdx === -1) {
          this.toast.error('Import Failed', 'CSV must contain Name, Age, Email, Class, Phone, and Address headers.');
          this.isLoading = false;
          return;
        }

        const studentsToImport: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          // Handle potential commas within quotes (common in addresses)
          const cols: string[] = [];
          let current = '';
          let inQuotes = false;

          for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              cols.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          cols.push(current.trim());

          const name = cols[nameIdx];
          const age = parseInt(cols[ageIdx], 10);
          const email = cols[emailIdx];
          const studentClass = cols[classIdx];
          const phone = cols[phoneIdx];
          const address = cols[addressIdx]?.replace(/^"|"$/g, ''); // strip outer quotes

          if (!name || isNaN(age) || !email || !studentClass || !phone || !address) {
            continue; // Skip invalid rows silently or log them
          }

          studentsToImport.push({
            name,
            age,
            email,
            studentClass,
            phone,
            address,
            status: (statusIdx !== -1 ? cols[statusIdx] : 'Active') || 'Active',
            feeStatus: (feeIdx !== -1 ? cols[feeIdx] : 'Pending') || 'Pending',
          });
        }

        if (studentsToImport.length === 0) {
          this.toast.error('Import Failed', 'No valid student rows found.');
          this.isLoading = false;
          return;
        }

        this.studentService.importStudents(studentsToImport).subscribe({
          next: (res: any) => {
            this.toast.success('Import Successful', `${res.importedCount} students enrolled.`);
            this.load();
          },
          error: (err) => {
            const count = err?.error?.importedCount || 0;
            if (count > 0) {
              this.toast.warning('Import Completed with Warnings', `${count} students were imported. Others had duplicate emails.`);
            } else {
              this.toast.error('Import Failed', err?.error?.message || 'Invalid CSV data.');
            }
            this.load();
          }
        });

      } catch (err) {
        this.toast.error('Import Failed', 'Failed to parse CSV file.');
        this.isLoading = false;
      }

      // Reset file input value so same file can be selected again
      input.value = '';
    };

    reader.readAsText(file);
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

  executePromotion() {
    const { sourceClass, targetClass, action } = this.promotionData;
    if (!sourceClass) {
      this.toast.error('Validation Error', 'Please select a source class.');
      return;
    }
    if (action === 'promote' && !targetClass) {
      this.toast.error('Validation Error', 'Please enter a target class.');
      return;
    }

    this.isProcessingPromotion = true;
    this.studentService.promoteClass(this.promotionData).subscribe({
      next: (res: any) => {
        this.toast.success('Wizard Complete', res.message);
        this.load();
        this.closePromoteModal();
      },
      error: (err) => {
        this.toast.error('Failed', err?.error?.message || 'Action failed.');
        this.isProcessingPromotion = false;
      }
    });
  }

  closePromoteModal() {
    this.showPromoteModal = false;
    this.isProcessingPromotion = false;
    this.promotionData = { sourceClass: '', targetClass: '', action: 'promote' };
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const p = name.trim().split(' ');
    return p.length > 1 ? (p[0][0]+p[1][0]).toUpperCase() : name.slice(0,2).toUpperCase();
  }
}

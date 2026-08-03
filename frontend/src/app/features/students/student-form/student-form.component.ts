import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StudentService } from '../../../core/services/student.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './student-form.component.html',
})
export class StudentFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  studentId: string | null = null;
  isLoading = false;
  isFetching = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({
      name:         ['', [Validators.required, Validators.minLength(2)]],
      age:          ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      email:        ['', [Validators.required, Validators.email]],
      phone:        ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      studentClass: ['', Validators.required],
      address:      ['', Validators.required],
      gender:       ['Male'],
      status:       ['Active'],
      feeStatus:    ['Pending'],
      rollNumber:   [''],
      admissionDate:[''],
      parentName:   [''],
      parentPhone:  [''],
    });
  }

  ngOnInit() {
    this.studentId = this.route.snapshot.paramMap.get('id');
    if (this.studentId) {
      this.isEdit = true;
      this.isFetching = true;
      this.studentService.getStudentById(this.studentId).subscribe({
        next: (res: any) => {
          const s = res.student;
          this.form.patchValue({
            ...s,
            admissionDate: s.admissionDate ? new Date(s.admissionDate).toISOString().slice(0,10) : '',
          });
          this.isFetching = false;
        },
        error: () => { this.toast.error('Error', 'Student not found.'); this.router.navigate(['/students']); }
      });
    }
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading = true;
    const data = this.form.value;
    const op = this.isEdit
      ? this.studentService.updateStudent(this.studentId!, data)
      : this.studentService.createStudent(data);

    op.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'Updated' : 'Enrolled', `${data.name} has been ${this.isEdit ? 'updated' : 'enrolled'} successfully.`);
        this.router.navigate(['/students']);
      },
      error: (err) => {
        this.toast.error('Error', err?.error?.message || 'Something went wrong.');
        this.isLoading = false;
      }
    });
  }

  f(name: string) { return this.form.get(name); }
}

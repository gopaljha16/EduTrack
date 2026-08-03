import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudentService } from '../../core/services/student.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  isLoading = true;

  statCards = [
    { key: 'total',      label: 'Total Students',   icon: 'fa-users',            color: 'purple' },
    { key: 'active',     label: 'Active Students',  icon: 'fa-user-check',       color: 'green'  },
    { key: 'graduated',  label: 'Graduated',        icon: 'fa-graduation-cap',   color: 'cyan'   },
    { key: 'totalClasses', label: 'Classes',        icon: 'fa-chalkboard-user',  color: 'orange' },
  ];

  constructor(
    private studentService: StudentService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.studentService.getStats().subscribe({
      next: (res: any) => { this.stats = res.stats; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  get feeCollectionRate(): number {
    if (!this.stats || !this.stats.fee) return 0;
    const { paid, pending, overdue } = this.stats.fee;
    const total = paid + pending + overdue;
    if (total === 0) return 0;
    return Math.round((paid / total) * 100);
  }

  get activeRate(): number {
    if (!this.stats || !this.stats.total) return 0;
    const { active, total } = this.stats;
    if (total === 0) return 0;
    return Math.round((active / total) * 100);
  }

  getStatValue(key: string): any {
    if (!this.stats) return '—';
    return this.stats[key] ?? '—';
  }

  getIconClasses(color: string): string {
    const map: Record<string, string> = {
      purple: 'bg-gradient-purple shadow-[0_4px_15px_rgba(124,108,248,0.35)]',
      green:  'bg-gradient-green shadow-[0_4px_15px_rgba(16,185,129,0.35)]',
      cyan:   'bg-gradient-cyan shadow-[0_4px_15px_rgba(34,211,238,0.35)]',
      orange: 'bg-gradient-orange shadow-[0_4px_15px_rgba(245,158,11,0.35)]',
    };
    return map[color] || '';
  }

  get feeStats() { return this.stats?.fee; }
  get recentStudents() { return this.stats?.recentStudents || []; }
  get classDistribution() { return this.stats?.classDistribution || []; }
  get recentLogs() { return this.stats?.recentLogs || []; }
  get classAttendance() { return this.stats?.classAttendance || []; }

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

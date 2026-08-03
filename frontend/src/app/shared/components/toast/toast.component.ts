import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      @for (toast of (toastService.toasts$ | async) || []; track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 min-w-[300px] max-w-sm bg-dark-700 border rounded-xl p-4 shadow-2xl animate-toast-in"
          [class]="getBorderClass(toast.type)"
          [class.opacity-0]="toast.hide"
          [class.translate-x-full]="toast.hide"
          style="transition: all 0.35s ease"
        >
          <div class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" [class]="getIconBg(toast.type)">
            <i class="fa-solid text-base" [class]="getIcon(toast.type)"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-slate-100">{{ toast.title }}</div>
            <div class="text-xs text-slate-400 mt-0.5">{{ toast.message }}</div>
          </div>
          <button (click)="toastService.dismiss(toast.id)" class="text-slate-500 hover:text-slate-300 transition-colors mt-0.5">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  toastService = inject(ToastService);


  getBorderClass(type: Toast['type']): string {
    const map: Record<string, string> = {
      success: 'border-emerald-500/30',
      error:   'border-red-500/30',
      info:    'border-brand-500/30',
      warning: 'border-amber-500/30',
    };
    return map[type] || 'border-white/10';
  }

  getIconBg(type: Toast['type']): string {
    const map: Record<string, string> = {
      success: 'bg-emerald-500/15 text-emerald-400',
      error:   'bg-red-500/15 text-red-400',
      info:    'bg-brand-500/15 text-brand-400',
      warning: 'bg-amber-500/15 text-amber-400',
    };
    return map[type] || '';
  }

  getIcon(type: Toast['type']): string {
    const map: Record<string, string> = {
      success: 'fa-circle-check',
      error:   'fa-circle-xmark',
      info:    'fa-circle-info',
      warning: 'fa-triangle-exclamation',
    };
    return map[type] || 'fa-bell';
  }
}

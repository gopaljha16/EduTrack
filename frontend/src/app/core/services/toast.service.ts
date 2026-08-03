import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  hide?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();
  private counter = 0;

  show(type: Toast['type'], title: string, message: string) {
    const id = ++this.counter;
    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, { id, type, title, message }]);
    setTimeout(() => this.dismiss(id), 4500);
  }

  success(title: string, message: string) { this.show('success', title, message); }
  error(title: string, message: string) { this.show('error', title, message); }
  info(title: string, message: string) { this.show('info', title, message); }
  warning(title: string, message: string) { this.show('warning', title, message); }

  dismiss(id: number) {
    const updated = this.toastsSubject.value.map(t => t.id === id ? { ...t, hide: true } : t);
    this.toastsSubject.next(updated);
    setTimeout(() => {
      this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
    }, 400);
  }
}

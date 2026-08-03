import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, SidebarComponent, ToastComponent],
  template: `
    <ng-container *ngIf="auth.isLoggedIn; else noSidebar">
      <div class="flex min-h-screen">
        <app-sidebar></app-sidebar>
        <main class="flex-1 ml-64 min-h-screen bg-dark-900">
          <router-outlet></router-outlet>
        </main>
      </div>
    </ng-container>
    <ng-template #noSidebar>
      <router-outlet></router-outlet>
    </ng-template>
    <app-toast></app-toast>
  `,
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}

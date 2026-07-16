import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
        <!-- Logo -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div class="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900">Influencer</p>
            <p class="text-xs text-gray-400">Platform</p>
          </div>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 space-y-1">
          <a routerLink="/dashboard" routerLinkActive="bg-blue-50 text-blue-700"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Dashboard
          </a>
          <a routerLink="/deals" routerLinkActive="bg-blue-50 text-blue-700"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm font-medium">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            Deals
          </a>
        </nav>

        <!-- User -->
        <div class="px-3 py-4 border-t border-gray-100">
          <div class="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span class="text-blue-700 text-xs font-bold">
                {{ (authService.currentUser()?.fullName || 'U')[0].toUpperCase() }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-gray-800 truncate">{{ authService.currentUser()?.fullName }}</p>
              <p class="text-xs text-gray-400 truncate">{{ authService.currentUser()?.email }}</p>
            </div>
          </div>
          <button (click)="authService.logout()"
            class="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <!-- Content -->
      <main class="flex-1 overflow-y-auto">
        <router-outlet/>
      </main>
    </div>
  `
})
export class LayoutComponent {
  constructor(public authService: AuthService) {}
}

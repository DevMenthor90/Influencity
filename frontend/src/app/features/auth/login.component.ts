import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Influencer Platform</h1>
          <p class="text-gray-500 text-sm mt-1">Gestión de Deals y Campañas</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-5">
            <label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              formControlName="email"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="tu@correo.com"
            />
            <p *ngIf="form.get('email')?.touched && form.get('email')?.invalid"
               class="text-red-500 text-xs mt-1">Ingresa un correo válido</p>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div class="relative">
              <input
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-12"
                placeholder="••••••••"
              />
              <button type="button" (click)="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path *ngIf="!showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  <path *ngIf="showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
                </svg>
              </button>
            </div>
          </div>

          <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-600 text-sm">{{ errorMessage }}</p>
          </div>

          <button
            type="submit"
            [disabled]="form.invalid || loading"
            class="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
            <svg *ngIf="loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?
          <a routerLink="/auth/register" class="text-blue-600 hover:underline font-medium">Regístrate</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor() {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.form.value;
    this.authService.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Error al iniciar sesión.';
        this.loading = false;
      }
    });
  }
}

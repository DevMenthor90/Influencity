import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

function passwordMatch(control: AbstractControl) {
  const pass = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pass === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p class="text-gray-500 text-sm mt-1">Regístrate con tu correo electrónico</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input type="text" formControlName="fullName"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Tu nombre"/>
            <p *ngIf="form.get('fullName')?.touched && form.get('fullName')?.invalid"
               class="text-red-500 text-xs mt-1">El nombre es requerido</p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input type="email" formControlName="email"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="tu@correo.com"/>
            <p *ngIf="form.get('email')?.touched && form.get('email')?.invalid"
               class="text-red-500 text-xs mt-1">Correo inválido</p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" formControlName="password"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Mínimo 8 caracteres"/>
            <p *ngIf="form.get('password')?.touched && form.get('password')?.invalid"
               class="text-red-500 text-xs mt-1">Mínimo 8 caracteres</p>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <input type="password" formControlName="confirmPassword"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Repite tu contraseña"/>
            <p *ngIf="form.errors?.['mismatch'] && form.get('confirmPassword')?.touched"
               class="text-red-500 text-xs mt-1">Las contraseñas no coinciden</p>
          </div>

          <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-600 text-sm">{{ errorMessage }}</p>
          </div>

          <button type="submit" [disabled]="form.invalid || loading"
            class="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
            <svg *ngIf="loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta? <a routerLink="/auth/login" class="text-blue-600 hover:underline font-medium">Ingresa</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatch });

  loading = false;
  errorMessage = '';

  constructor() {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    const { fullName, email, password } = this.form.value;
    this.authService.register(fullName!, email!, password!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Error al registrarse.';
        this.loading = false;
      }
    });
  }
}

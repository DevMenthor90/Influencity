import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DealService } from '../../core/services/deal.service';
import { DashboardData } from '../../shared/models/app.models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p class="text-gray-500 text-sm mt-1">Resumen del mes actual</p>
        </div>
        <a routerLink="/deals/new"
          class="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo Deal
        </a>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center h-64">
        <svg class="animate-spin w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <ng-container *ngIf="!loading && data">
        <!-- KPI Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p class="text-sm font-medium text-gray-500">Deals Activos</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ data.totalActiveDeals }}</p>
            <div class="mt-3 flex items-center gap-1">
              <span class="text-xs text-green-600 font-medium">{{ data.totalPublishedDeals }} publicados</span>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p class="text-sm font-medium text-gray-500">Valor Total del Mes</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ formatCurrency(data.totalValueThisMonth) }}</p>
            <p class="text-xs text-gray-400 mt-3">Todas las monedas sumadas</p>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p class="text-sm font-medium text-gray-500">Comisiones del Mes</p>
            <p class="text-3xl font-bold text-blue-600 mt-1">{{ formatCurrency(data.totalCommissionsThisMonth) }}</p>
            <p class="text-xs text-gray-400 mt-3">20% de deals del mes</p>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p class="text-sm font-medium text-gray-500">Comisiones Pendientes</p>
            <p class="text-3xl font-bold text-orange-500 mt-1">{{ formatCurrency(data.pendingCommissions) }}</p>
            <p class="text-xs text-gray-400 mt-3">{{ data.pendingCommissionCount }} deals</p>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p class="text-sm font-medium text-gray-500">Deals Publicados</p>
            <p class="text-3xl font-bold text-green-600 mt-1">{{ data.totalPublishedDeals }}</p>
            <p class="text-xs text-gray-400 mt-3">Contenido en vivo</p>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p class="text-sm font-medium text-gray-500">Deals Cancelados</p>
            <p class="text-3xl font-bold text-red-500 mt-1">{{ data.totalCancelledDeals }}</p>
            <p class="text-xs text-gray-400 mt-3">Total histórico</p>
          </div>
        </div>

        <!-- Alerts -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            Alertas
          </h2>

          <div *ngIf="data.dealsWithoutLink === 0 && data.pendingApprovalToBill === 0 && data.pendingCommissionCount === 0"
            class="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
            <svg class="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <p class="text-green-700 text-sm font-medium">¡Todo al día! No hay alertas pendientes.</p>
          </div>

          <div class="space-y-3">
            <div *ngIf="data.dealsWithoutLink > 0"
              class="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <p class="text-sm text-gray-700">Deals publicados <strong>sin link</strong></p>
              </div>
              <span class="text-sm font-bold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
                {{ data.dealsWithoutLink }}
              </span>
            </div>

            <div *ngIf="data.pendingApprovalToBill > 0"
              class="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                <p class="text-sm text-gray-700">Deals pendientes de <strong>aprobación para facturar</strong></p>
              </div>
              <span class="text-sm font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                {{ data.pendingApprovalToBill }}
              </span>
            </div>

            <div *ngIf="data.pendingCommissionCount > 0"
              class="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 rounded-full bg-orange-400"></div>
                <p class="text-sm text-gray-700">Comisiones <strong>pendientes por recibir</strong></p>
              </div>
              <span class="text-sm font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
                {{ data.pendingCommissionCount }}
              </span>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  data: DashboardData | null = null;
  loading = true;

  constructor(private dealService: DealService, public authService: AuthService) {}

  ngOnInit(): void {
    this.dealService.getDashboard().subscribe({
      next: (d: DashboardData) => { this.data = d; this.loading = false; },
      error: () => this.loading = false
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  }
}

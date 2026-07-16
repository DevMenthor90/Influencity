import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DealService } from '../../core/services/deal.service';
import { Deal, DealFilters, PagedResponse } from '../../shared/models/app.models';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-deals-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="p-6 max-w-full">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Deals</h1>
          <p class="text-gray-500 text-sm mt-1">
            {{ response?.totalCount || 0 }} deals registrados
          </p>
        </div>
        <div class="flex gap-3">
          <button (click)="exportExcel()"
            class="flex items-center gap-2 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Exportar Excel
          </button>
          <a routerLink="/deals/new"
            class="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nuevo Deal
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl border border-gray-200 p-4 mb-5" [formGroup]="filtersForm">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input formControlName="campaignName" type="text" placeholder="Campaña..."
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
          <input formControlName="creatorName" type="text" placeholder="Creador..."
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
          <input formControlName="clientName" type="text" placeholder="Cliente..."
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
          <select formControlName="status"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Todos los estados</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Publicado">Publicado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
          <button (click)="clearFilters()"
            class="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Limpiar filtros
          </button>
        </div>
        <div class="grid grid-cols-2 gap-3 mt-3">
          <div class="flex items-center gap-2">
            <label class="text-xs text-gray-500 whitespace-nowrap">Desde:</label>
            <input formControlName="dateFrom" type="date"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs text-gray-500 whitespace-nowrap">Hasta:</label>
            <input formControlName="dateTo" type="date"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div *ngIf="loading" class="flex items-center justify-center h-48">
          <svg class="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>

        <div *ngIf="!loading" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Creador</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaña</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Comisión</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Facturar</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Pago Creador</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Comisión</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let deal of response?.items" class="hover:bg-gray-50 transition">
                <td class="px-4 py-3 font-mono text-xs text-gray-500">DEAL-{{ deal.dealNumber | number:'3.0-0' }}</td>
                <td class="px-4 py-3 font-medium text-gray-900">{{ deal.creatorName }}</td>
                <td class="px-4 py-3 text-gray-600">{{ deal.clientName }}</td>
                <td class="px-4 py-3 text-gray-600 max-w-[180px] truncate" [title]="deal.campaignName">{{ deal.campaignName }}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                    {{ contentTypeLabel(deal.contentType) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right font-medium text-gray-900">
                  {{ deal.currency }} {{ deal.totalValue | number:'1.0-0' }}
                </td>
                <td class="px-4 py-3 text-right text-blue-600 font-medium">
                  {{ deal.currency }} {{ deal.commission | number:'1.0-0' }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span [ngClass]="statusClass(deal.status)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    {{ deal.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span [ngClass]="deal.approvedToBill ? 'text-green-600' : 'text-gray-400'">
                    <svg class="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path *ngIf="deal.approvedToBill" fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      <circle *ngIf="!deal.approvedToBill" cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span [ngClass]="deal.creatorPaymentReceived ? 'text-green-600' : 'text-gray-400'">
                    <svg class="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path *ngIf="deal.creatorPaymentReceived" fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      <circle *ngIf="!deal.creatorPaymentReceived" cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span [ngClass]="deal.commissionReceived ? 'text-green-600' : 'text-gray-400'">
                    <svg class="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path *ngIf="deal.commissionReceived" fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      <circle *ngIf="!deal.commissionReceived" cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <a [routerLink]="['/deals', deal.id]"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition">
                    Ver / Editar
                  </a>
                </td>
              </tr>
              <tr *ngIf="response?.items?.length === 0">
                <td colspan="12" class="px-4 py-12 text-center text-gray-400">
                  No se encontraron deals con los filtros aplicados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="response && response.totalPages > 1"
          class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <p class="text-sm text-gray-500">
            Mostrando {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, response.totalCount) }}
            de {{ response.totalCount }}
          </p>
          <div class="flex gap-2">
            <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1"
              class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
              Anterior
            </button>
            <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage === response.totalPages"
              class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DealsListComponent implements OnInit {
  private dealService = inject(DealService);
  private fb = inject(FormBuilder);

  response: PagedResponse<Deal> | null = null;
  loading = true;
  currentPage = 1;
  pageSize = 20;
  Math = Math;

  filtersForm = this.fb.group({
    campaignName: [''],
    creatorName: [''],
    clientName: [''],
    status: [''],
    dateFrom: [''],
    dateTo: ['']
  });

  constructor() {}

  ngOnInit(): void {
    this.loadDeals();
    this.filtersForm.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.currentPage = 1;
      this.loadDeals();
    });
  }

  loadDeals(): void {
    this.loading = true;
    const v = this.filtersForm.value;
    const filters: DealFilters = {
      campaignName: v.campaignName || undefined,
      creatorName: v.creatorName || undefined,
      clientName: v.clientName || undefined,
      status: v.status || undefined,
      dateFrom: v.dateFrom || undefined,
      dateTo: v.dateTo || undefined,
      page: this.currentPage,
      pageSize: this.pageSize
    };
    this.dealService.getAll(filters).subscribe({
      next: (r: PagedResponse<Deal>) => { this.response = r; this.loading = false; },
      error: () => this.loading = false
    });
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadDeals();
  }

  clearFilters(): void {
    this.filtersForm.reset({ campaignName: '', creatorName: '', clientName: '', status: '', dateFrom: '', dateTo: '' });
  }

  exportExcel(): void {
    const v = this.filtersForm.value;
    this.dealService.exportToExcel({
      campaignName: v.campaignName || undefined,
      creatorName: v.creatorName || undefined,
      clientName: v.clientName || undefined,
      status: v.status || undefined,
      dateFrom: v.dateFrom || undefined,
      dateTo: v.dateTo || undefined
    });
  }

  statusClass(status: string): string {
    return {
      'Confirmado': 'bg-yellow-100 text-yellow-800',
      'Publicado': 'bg-green-100 text-green-800',
      'Cancelado': 'bg-red-100 text-red-800'
    }[status] || 'bg-gray-100 text-gray-800';
  }

  contentTypeLabel(type: string): string {
    return {
      'TikTokPost': 'TikTok',
      'InstagramReel': 'IG Reel',
      'InstagramStory': 'IG Story',
      'YouTubeVideo': 'YouTube'
    }[type] || type;
  }
}

import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { DealService } from '../../core/services/deal.service';
import { Deal } from '../../shared/models/app.models';

@Component({
  selector: 'app-deal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <a routerLink="/deals" class="p-2 hover:bg-gray-100 rounded-lg transition">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ isEdit ? 'Editar Deal' : 'Nuevo Deal' }}</h1>
          <p *ngIf="isEdit && deal" class="text-gray-500 text-sm mt-0.5">DEAL-{{ deal.dealNumber | number:'3.0-0' }}</p>
        </div>
      </div>

      <div *ngIf="pageLoading" class="flex items-center justify-center h-48">
        <svg class="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <form *ngIf="!pageLoading" [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Basic Info -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-base font-semibold text-gray-800 mb-5">Información General</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Creador *</label>
              <input formControlName="creatorName" type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Nombre del creador"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
              <input formControlName="clientName" type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Nombre del cliente/marca"/>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de Campaña *</label>
              <input formControlName="campaignName" type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Nombre de la campaña"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Contenido *</label>
              <select formControlName="contentType"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                <option value="">Seleccionar...</option>
                <option value="TikTokPost">TikTok Post</option>
                <option value="InstagramReel">Instagram Reel</option>
                <option value="InstagramStory">Instagram Story</option>
                <option value="YouTubeVideo">YouTube Video</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Moneda *</label>
              <select formControlName="currency"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                <option value="COP">COP - Peso Colombiano</option>
                <option value="USD">USD - Dólar</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Financial -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-base font-semibold text-gray-800 mb-5">Valor del Deal</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Valor Total (Booking Price) *</label>
              <input formControlName="totalValue" type="number" min="0" step="0.01"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="0"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pago al Creador (80%)</label>
              <div class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800">
                {{ calculatedCreatorPayment | number:'1.2-2' }}
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Comisión (20%)</label>
              <div class="px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm font-semibold text-blue-700">
                {{ calculatedCommission | number:'1.2-2' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Editable-only sections -->
        <ng-container *ngIf="isEdit">
          <!-- Status & Publication -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-base font-semibold text-gray-800 mb-5">Publicación y Estado</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select formControlName="status"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  <option value="Confirmado">Confirmado</option>
                  <option value="Publicado">Publicado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Publicación</label>
                <input formControlName="publicationDate" type="date"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"/>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Link de Publicación</label>
                <input formControlName="publicationLink" type="url"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="https://..."/>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Notas Internas</label>
                <textarea formControlName="notes" rows="3"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                  placeholder="Notas o comentarios internos..."></textarea>
              </div>
            </div>

            <!-- Approved to Bill -->
            <div class="mt-4 p-4 rounded-lg border" [ngClass]="form.get('approvedToBill')?.value ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'">
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" formControlName="approvedToBill"
                  class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                <div>
                  <p class="text-sm font-semibold text-gray-800">Approved to Bill</p>
                  <p class="text-xs text-gray-500">Solo disponible cuando hay link de publicación registrado</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Payments -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-base font-semibold text-gray-800 mb-5">Control de Pagos</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="p-4 rounded-lg border border-gray-200">
                <label class="flex items-center gap-3 cursor-pointer mb-3">
                  <input type="checkbox" formControlName="creatorPaymentReceived"
                    class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                  <p class="text-sm font-semibold text-gray-800">Pago recibido por el creador</p>
                </label>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Fecha de pago</label>
                  <input formControlName="creatorPaymentDate" type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
              </div>
              <div class="p-4 rounded-lg border border-gray-200">
                <label class="flex items-center gap-3 cursor-pointer mb-3">
                  <input type="checkbox" formControlName="commissionReceived"
                    class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                  <p class="text-sm font-semibold text-gray-800">Comisión recibida</p>
                </label>
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Fecha de recepción</label>
                  <input formControlName="commissionReceivedDate" type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- Error -->
        <div *ngIf="errorMessage" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-600 text-sm">{{ errorMessage }}</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between">
          <button *ngIf="isEdit" type="button" (click)="confirmDelete()"
            class="px-4 py-2.5 text-red-600 border border-red-200 hover:bg-red-50 font-medium rounded-lg transition text-sm">
            Eliminar Deal
          </button>
          <div class="flex gap-3 ml-auto">
            <a routerLink="/deals"
              class="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition text-sm">
              Cancelar
            </a>
            <button type="submit" [disabled]="form.invalid || saving"
              class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition text-sm flex items-center gap-2">
              <svg *ngIf="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ saving ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Crear Deal') }}
            </button>
          </div>
        </div>
      </form>
    </div>
  `
})
export class DealFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private dealService = inject(DealService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  deal: Deal | null = null;
  isEdit = false;
  pageLoading = true;
  saving = false;
  errorMessage = '';
  private linkSub?: Subscription;

  form = this.fb.group({
    creatorName: ['', Validators.required],
    clientName: ['', Validators.required],
    campaignName: ['', Validators.required],
    contentType: ['', Validators.required],
    currency: ['COP', Validators.required],
    totalValue: [0, [Validators.required, Validators.min(1)]],
    status: ['Confirmado'],
    publicationLink: [''],
    publicationDate: [''],
    notes: [''],
    approvedToBill: [false],
    creatorPaymentReceived: [false],
    creatorPaymentDate: [''],
    commissionReceived: [false],
    commissionReceivedDate: ['']
  });

  constructor() {}

  ngOnDestroy(): void {
    this.linkSub?.unsubscribe();
  }

  get calculatedCreatorPayment(): number {
    return (this.form.get('totalValue')?.value || 0) * 0.8;
  }

  get calculatedCommission(): number {
    return (this.form.get('totalValue')?.value || 0) * 0.2;
  }

  ngOnInit(): void {
    this.linkSub = this.form.get('publicationLink')!.valueChanges.subscribe(link => {
      if (link && !this.form.get('publicationDate')!.value) {
        const today = new Date().toISOString().split('T')[0];
        this.form.get('publicationDate')!.setValue(today, { emitEvent: false });
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.dealService.getById(id).subscribe({
        next: (deal: Deal) => {
          this.deal = deal;
          this.form.patchValue({
            ...deal,
            publicationDate: deal.publicationDate ? deal.publicationDate.split('T')[0] : '',
            creatorPaymentDate: deal.creatorPaymentDate ? deal.creatorPaymentDate.split('T')[0] : '',
            commissionReceivedDate: deal.commissionReceivedDate ? deal.commissionReceivedDate.split('T')[0] : ''
          });
          this.pageLoading = false;
        },
        error: () => this.router.navigate(['/deals'])
      });
    } else {
      this.pageLoading = false;
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMessage = '';

    const v = this.form.value;

    if (this.isEdit && this.deal) {
      this.dealService.update(this.deal.id, {
        creatorName: v.creatorName!,
        clientName: v.clientName!,
        campaignName: v.campaignName!,
        contentType: v.contentType!,
        currency: v.currency!,
        totalValue: v.totalValue!,
        status: v.status!,
        publicationLink: v.publicationLink || undefined,
        publicationDate: v.publicationDate || undefined,
        notes: v.notes || undefined,
        approvedToBill: v.approvedToBill ?? false,
        creatorPaymentReceived: v.creatorPaymentReceived ?? false,
        creatorPaymentDate: v.creatorPaymentDate || undefined,
        commissionReceived: v.commissionReceived ?? false,
        commissionReceivedDate: v.commissionReceivedDate || undefined
      }).subscribe({
        next: () => this.router.navigate(['/deals']),
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Error al actualizar.';
          this.saving = false;
        }
      });
    } else {
      this.dealService.create({
        creatorName: v.creatorName!,
        clientName: v.clientName!,
        campaignName: v.campaignName!,
        contentType: v.contentType! as any,
        currency: v.currency! as any,
        totalValue: v.totalValue!
      }).subscribe({
        next: () => this.router.navigate(['/deals']),
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Error al crear deal.';
          this.saving = false;
        }
      });
    }
  }

  confirmDelete(): void {
    if (!this.deal) return;
    if (confirm(`¿Eliminar DEAL-${this.deal.dealNumber}? Esta acción no se puede deshacer.`)) {
      this.dealService.delete(this.deal.id).subscribe({
        next: () => this.router.navigate(['/deals']),
        error: () => alert('Error al eliminar el deal.')
      });
    }
  }
}

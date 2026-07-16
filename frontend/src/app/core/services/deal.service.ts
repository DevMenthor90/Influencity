import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Deal, CreateDealRequest, UpdateDealRequest,
  DealFilters, PagedResponse, DashboardData
} from '../../shared/models/app.models';

@Injectable({ providedIn: 'root' })
export class DealService {
  private readonly API = `${environment.apiUrl}/deals`;

  constructor(private http: HttpClient) {}

  getAll(filters: DealFilters = {}): Observable<PagedResponse<Deal>> {
    let params = new HttpParams();
    if (filters.campaignName) params = params.set('campaignName', filters.campaignName);
    if (filters.creatorName) params = params.set('creatorName', filters.creatorName);
    if (filters.clientName) params = params.set('clientName', filters.clientName);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
    return this.http.get<PagedResponse<Deal>>(this.API, { params });
  }

  getById(id: string): Observable<Deal> {
    return this.http.get<Deal>(`${this.API}/${id}`);
  }

  create(request: CreateDealRequest): Observable<Deal> {
    return this.http.post<Deal>(this.API, request);
  }

  update(id: string, request: UpdateDealRequest): Observable<{ message: string; data: Deal }> {
    return this.http.put<{ message: string; data: Deal }>(`${this.API}/${id}`, request);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API}/${id}`);
  }

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.API}/dashboard`);
  }

  exportToExcel(filters: DealFilters = {}): void {
    let params = new HttpParams();
    if (filters.campaignName) params = params.set('campaignName', filters.campaignName);
    if (filters.creatorName) params = params.set('creatorName', filters.creatorName);
    if (filters.clientName) params = params.set('clientName', filters.clientName);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);

    this.http.get(`${this.API}/export`, { params, responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deals_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../../shared/models/app.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/auth`;
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = this.getAccessToken();
    if (token) {
      this.isAuthenticated.set(true);
      // Decode JWT payload
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUser.set({
          userId: payload.sub,
          email: payload.email,
          fullName: payload.unique_name || payload.name || '',
          role: payload.role || 'admin'
        });
      } catch { this.clearTokens(); }
    }
  }

  register(fullName: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, { fullName, email, password }).pipe(
      tap(res => this.storeSession(res))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, { email, password }).pipe(
      tap(res => this.storeSession(res))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.API}/refresh`, { refreshToken }).pipe(
      tap(res => this.storeSession(res))
    );
  }

  logout(): void {
    this.http.post(`${this.API}/logout`, {}).subscribe();
    this.clearTokens();
    this.router.navigate(['/auth/login']);
  }

  private storeSession(res: AuthResponse): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, res.data.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, res.data.refreshToken);
    this.currentUser.set({
      userId: res.data.userId,
      email: res.data.email,
      fullName: res.data.fullName,
      role: res.data.role
    });
    this.isAuthenticated.set(true);
  }

  private clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch { return true; }
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap } from 'rxjs';
import { API_ORIGIN } from '../api';
import { Admin } from '../models/admin';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${API_ORIGIN}/api/auth`;

  readonly admin = signal<Admin | null>(null);

  constructor(private http: HttpClient) {}

  getGoogleClientId(): Observable<string | null> {
    return this.http
      .get<{ googleClientId: string | null }>(`${this.apiUrl}/config`)
      .pipe(map((config) => config.googleClientId));
  }

  loginWithGoogle(credential: string): Observable<Admin> {
    return this.http
      .post<Admin>(`${this.apiUrl}/google`, { credential })
      .pipe(tap((admin) => this.admin.set(admin)));
  }

  // The backend session is the source of truth, so this always asks the server.
  // /me answers 204 (no body) when there is no admin session.
  checkSession(): Observable<boolean> {
    return this.http.get<Admin | null>(`${this.apiUrl}/me`).pipe(
      tap((admin) => this.admin.set(admin)),
      map((admin) => admin !== null),
      catchError(() => {
        this.admin.set(null);
        return of(false);
      })
    );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/logout`, {})
      .pipe(finalize(() => this.admin.set(null)));
  }
}

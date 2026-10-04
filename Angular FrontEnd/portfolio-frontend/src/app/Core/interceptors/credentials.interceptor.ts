import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_ORIGIN } from '../api';

// Sends the admin session cookie to the backend and sends the user to /login when it expires.
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_ORIGIN)) return next(req);

  const router = inject(Router);
  return next(req.clone({ withCredentials: true })).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.startsWith(`${API_ORIGIN}/api/auth/`)) {
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};

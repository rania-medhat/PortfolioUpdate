import { Component, ElementRef, NgZone, OnInit, ViewChild, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../Core/Services/Auth.Service';

declare const google: any;

const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit {
  @ViewChild('googleButton', { static: true }) googleButton!: ElementRef<HTMLElement>;

  readonly error = signal('');

  constructor(private auth: AuthService, private router: Router, private zone: NgZone) {}

  ngOnInit() {
    this.auth.checkSession().subscribe((isAdmin) => {
      if (isAdmin) this.router.navigate(['/dashboard']);
      else this.initGoogleSignIn();
    });
  }

  private initGoogleSignIn() {
    this.auth.getGoogleClientId().subscribe({
      next: async (clientId) => {
        if (!clientId) {
          return this.error.set(
            'Google sign-in is not configured: set GOOGLE_CLIENT_ID in the backend .env and restart the backend.'
          );
        }
        try {
          await loadGoogleScript();
        } catch {
          return this.error.set('Could not load Google sign-in. Check your connection.');
        }
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential: string }) =>
            this.zone.run(() => this.onCredential(response.credential)),
        });
        google.accounts.id.renderButton(this.googleButton.nativeElement, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
        });
      },
      error: () => this.error.set('Could not reach the server.'),
    });
  }

  private onCredential(credential: string) {
    this.error.set('');
    this.auth.loginWithGoogle(credential).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: HttpErrorResponse) =>
        this.error.set(
          err.status === 403
            ? 'This Google account is not allowed to access the dashboard.'
            : 'Sign-in failed. Please try again.'
        ),
    });
  }
}

let googleScript: Promise<void> | null = null;

// Loads the Google Identity Services SDK once; a failed load can be retried on the next visit.
function loadGoogleScript(): Promise<void> {
  if (typeof google !== 'undefined' && google.accounts?.id) return Promise.resolve();
  googleScript ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GSI_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      googleScript = null;
      reject(new Error('Failed to load Google sign-in'));
    };
    document.head.appendChild(script);
  });
  return googleScript;
}

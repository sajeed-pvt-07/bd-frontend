import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AnalyticsSummary } from '../models/Analytics';
import { AdminAuthService } from './admin-auth.service';

@Injectable({ providedIn: 'root' })
export class AdminAnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly adminAuth = inject(AdminAuthService);
  private readonly endpoint = `${environment.backendUrl}v1/admin/analytics`;

  authenticate(username: string, password: string, days = 30): Observable<AnalyticsSummary> {
    const authorization = this.adminAuth.createAuthorization(username, password);
    return this.fetchSummary(days, authorization).pipe(
      tap(() => this.adminAuth.remember(authorization)),
    );
  }

  restoreSession(days = 30): Observable<AnalyticsSummary> | null {
    if (!this.adminAuth.restore()) return null;
    return this.fetchSummary(days);
  }

  getSummary(days: number): Observable<AnalyticsSummary> {
    return this.fetchSummary(days);
  }

  logout(): void {
    this.adminAuth.logout();
  }

  private fetchSummary(days: number, authorization?: string): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(this.endpoint, {
      params: { days },
      headers: authorization
        ? new HttpHeaders({ Authorization: authorization })
        : this.adminAuth.getHeaders(),
    }).pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.logout();
        }
        return throwError(() => error);
      }));
  }
}

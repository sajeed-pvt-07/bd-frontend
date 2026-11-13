import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly storageKey = 'admin-analytics-session-v1';
  private readonly sessionDurationMs = 24 * 60 * 60 * 1000;
  private authorization: string | null = null;

  createAuthorization(username: string, password: string): string {
    const credentials = new TextEncoder().encode(`${username}:${password}`);
    const encodedCredentials = Array.from(credentials, (byte) => String.fromCharCode(byte)).join('');
    return `Basic ${btoa(encodedCredentials)}`;
  }

  remember(authorization: string): void {
    this.authorization = authorization;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        authorization,
        expiresAt: Date.now() + this.sessionDurationMs,
      }));
    } catch (error) {
      console.warn('Could not remember the admin session in this browser.', error);
    }
  }

  restore(): boolean {
    try {
      const value = localStorage.getItem(this.storageKey);
      if (!value) return false;

      const session: unknown = JSON.parse(value);
      if (
        typeof session !== 'object' ||
        session === null ||
        !('authorization' in session) ||
        typeof session.authorization !== 'string' ||
        !session.authorization.startsWith('Basic ') ||
        !('expiresAt' in session) ||
        typeof session.expiresAt !== 'number' ||
        session.expiresAt <= Date.now()
      ) {
        this.logout();
        return false;
      }

      this.authorization = session.authorization;
      return true;
    } catch (error) {
      this.logout();
      console.warn('Could not restore the remembered admin session.', error);
      return false;
    }
  }

  getHeaders(): HttpHeaders {
    if (!this.authorization) {
      throw new Error('Admin authentication is required.');
    }
    return new HttpHeaders({ Authorization: this.authorization });
  }

  logout(): void {
    this.authorization = null;
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Could not clear the remembered admin session.', error);
    }
  }
}

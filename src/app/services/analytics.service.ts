import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../environments/environment';

type AnalyticsEventType =
  | 'SESSION_START'
  | 'PAGE_VIEW'
  | 'PAGE_LEAVE'
  | 'THEME_SET'
  | 'THEME_CHANGE'
  | 'SONG_PLAY'
  | 'SONG_PAUSE'
  | 'SONG_END'
  | 'PROFILE_SELECT'
  | 'GREETING_CONTINUE'
  | 'BIRTHDAY_BALLOON_POP'
  | 'BIRTHDAY_COMPLETE'
  | 'OPEN_WHEN_NOTE_OPEN'
  | 'JOURNEY_REPLAY'
  | 'TOUR_START'
  | 'TOUR_SKIP';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly endpoint = `${environment.backendUrl}v1/analytics/events`;
  private readonly visitorId = this.getOrCreateId('localStorage', 'analytics-visitor-id');
  private readonly initialSession = this.getSessionId();
  private sessionId = this.initialSession.id;
  private currentPage: string | null = null;
  private currentProfileName: string | undefined;
  private currentPageStartedAt = 0;
  private currentTheme: 'light' | 'dark' = 'light';
  private themeInitialized = false;
  private themeRecorded = false;
  private hasWarnedAboutFailure = false;
  private started = false;
  private sessionStarted = this.initialSession.existing;
  private pageExitRecorded = false;
  private readonly onPageHide = () => this.closeCurrentPage(true);
  private readonly onPageShow = () => this.onNavigation(this.router.url);

  start(): void {
    if (this.started) return;
    this.started = true;

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.onNavigation(event.urlAfterRedirects));
    window.addEventListener('pagehide', this.onPageHide);
    window.addEventListener('pageshow', this.onPageShow);

    if (this.router.navigated) {
      this.onNavigation(this.router.url);
    }
  }

  setTheme(isDark: boolean): void {
    const theme = isDark ? 'dark' : 'light';
    this.currentTheme = theme;
    this.themeInitialized = true;
    if (this.currentPage) {
      this.record(this.themeRecorded ? 'THEME_CHANGE' : 'THEME_SET');
      this.themeRecorded = true;
    }
  }

  track(
    type: AnalyticsEventType,
    details: { song?: string; durationSeconds?: number; profileName?: string } = {},
  ): void {
    this.record(type, details);
  }

  private onNavigation(url: string): void {
    const page = this.getPageName(url);
    if (!page) {
      if (url.split(/[?#]/, 1)[0].split('/').filter(Boolean)[0] === 'admin') {
        this.closeCurrentPage();
      }
      return;
    }
    const profileName = this.getProfileName(url, page);
    if (page === this.currentPage && profileName === this.currentProfileName) return;

    this.closeCurrentPage();

    this.currentPage = page;
    this.currentProfileName = profileName;
    this.currentPageStartedAt = Date.now();
    this.pageExitRecorded = false;
    if (!this.sessionStarted) {
      this.record('SESSION_START');
      this.sessionStarted = true;
    }
    this.record('PAGE_VIEW', { profileName: this.currentProfileName });
    if (this.themeInitialized && !this.themeRecorded) {
      this.record('THEME_SET');
      this.themeRecorded = true;
    }
  }

  private getProfileName(url: string, page: string): string | undefined {
    if (page !== 'greeting' && page !== 'timeline' && page !== 'thank-you') return undefined;
    const encodedName = url.split(/[?#]/, 1)[0].split('/').filter(Boolean)[1];
    if (!encodedName) return undefined;

    try {
      return decodeURIComponent(encodedName).slice(0, 80);
    } catch (error) {
      console.warn('Could not decode the selected profile name for analytics.', error);
      return undefined;
    }
  }

  private closeCurrentPage(useBeacon = false): void {
    if (!this.currentPage) return;

    const details = {
      durationSeconds: Math.min(
        86_400,
        Math.max(0, Math.floor((Date.now() - this.currentPageStartedAt) / 1000)),
      ),
    };
    if (useBeacon) {
      this.sendBeacon('PAGE_LEAVE', details);
    } else {
      this.record('PAGE_LEAVE', details);
    }
    this.currentPage = null;
    this.currentProfileName = undefined;
  }

  private getPageName(url: string): string | null {
    const firstSegment = url.split(/[?#]/, 1)[0].split('/').filter(Boolean)[0];
    if (!firstSegment) return 'home';
    if (firstSegment === 'admin') return null;
    if (
      firstSegment === 'greeting' ||
      firstSegment === 'timeline' ||
      firstSegment === 'thank-you' ||
      firstSegment === 'open-when'
    ) {
      return firstSegment;
    }
    if (['home', 'birthday-celebration', 'user-selection'].includes(firstSegment)) {
      return firstSegment;
    }
    return null;
  }

  private record(
    type: AnalyticsEventType,
    details: { song?: string; durationSeconds?: number; profileName?: string } = {},
  ): void {
    if (!this.currentPage) return;

    this.ensureFreshSession();
    if (type !== 'SESSION_START' && !this.sessionStarted) {
      this.sendEvent('SESSION_START', {});
      this.sessionStarted = true;
    }

    this.sendEvent(type, details);
    if (type === 'SESSION_START') {
      this.sessionStarted = true;
    }
  }

  private sendEvent(
    type: AnalyticsEventType,
    details: { song?: string; durationSeconds?: number; profileName?: string },
  ): void {
    const event = this.createPayload(type, details);
    this.touchSession();
    this.http.post(this.endpoint, event).subscribe({
      error: (error: unknown) => this.warnOnFailure(error),
    });
  }

  private sendBeacon(
    type: AnalyticsEventType,
    details: { song?: string; durationSeconds?: number; profileName?: string } = {},
  ): void {
    if (!this.currentPage || this.pageExitRecorded) return;
    this.pageExitRecorded = true;
    this.ensureFreshSession();
    if (!this.sessionStarted) {
      this.sendBeaconEvent('SESSION_START', {});
      this.sessionStarted = true;
    }
    this.sendBeaconEvent(type, details);
  }

  private sendBeaconEvent(
    type: AnalyticsEventType,
    details: { song?: string; durationSeconds?: number; profileName?: string },
  ): void {
    const event = this.createPayload(type, details);
    this.touchSession();
    const body = new Blob([JSON.stringify(event)], { type: 'application/json' });
    if (!navigator.sendBeacon(this.endpoint, body)) {
      void fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        keepalive: true,
      }).catch((error: unknown) => this.warnOnFailure(error));
    }
  }

  private ensureFreshSession(): void {
    try {
      const lastActivity = Number(window.sessionStorage.getItem('analytics-session-last-activity'));
      if (Date.now() - lastActivity < 30 * 60 * 1000) return;

      this.sessionId = this.createUuid();
      this.sessionStarted = false;
      window.sessionStorage.setItem('analytics-session-id', this.sessionId);
      window.sessionStorage.setItem('analytics-session-last-activity', String(Date.now()));
    } catch (error) {
      console.warn('Analytics session could not be rotated after inactivity.', error);
    }
  }

  private createPayload(
    type: AnalyticsEventType,
    details: { song?: string; durationSeconds?: number; profileName?: string },
  ) {
    return {
      visitorId: this.visitorId,
      sessionId: this.sessionId,
      type,
      page: this.currentPage,
      theme: this.currentTheme,
      song: details.song,
      profileName: details.profileName,
      durationSeconds: details.durationSeconds,
    };
  }

  private touchSession(): void {
    try {
      window.sessionStorage.setItem('analytics-session-last-activity', String(Date.now()));
    } catch (error) {
      console.warn('Analytics session activity could not be saved.', error);
    }
  }

  private getSessionId(): { id: string; existing: boolean } {
    try {
      const storage = window.sessionStorage;
      const id = storage.getItem('analytics-session-id');
      const lastActivity = Number(storage.getItem('analytics-session-last-activity'));
      if (id && this.isUuid(id) && Date.now() - lastActivity < 30 * 60 * 1000) {
        return { id, existing: true };
      }

      const newId = this.createUuid();
      storage.setItem('analytics-session-id', newId);
      storage.setItem('analytics-session-last-activity', String(Date.now()));
      return { id: newId, existing: false };
    } catch (error) {
      console.warn('Analytics session storage is unavailable; using a temporary session.', error);
      return { id: this.createUuid(), existing: false };
    }
  }

  private warnOnFailure(error: unknown): void {
    if (!this.hasWarnedAboutFailure) {
      this.hasWarnedAboutFailure = true;
      console.warn('Anonymous analytics could not be recorded.', error);
    }
  }

  private getOrCreateId(storageName: 'localStorage' | 'sessionStorage', key: string): string {
    try {
      const storage = storageName === 'localStorage' ? window.localStorage : window.sessionStorage;
      const storedId = storage.getItem(key);
      if (storedId && this.isUuid(storedId)) return storedId;

      const id = this.createUuid();
      storage.setItem(key, id);
      return id;
    } catch (error) {
      console.warn(`Analytics ${storageName} is unavailable; using a temporary identifier.`, error);
      return this.createUuid();
    }
  }

  private createUuid(): string {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }
}

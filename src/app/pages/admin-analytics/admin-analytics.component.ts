import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnalyticsSummary, AnalyticsVisitor } from '../../models/Analytics';
import { AdminAnalyticsService } from '../../services/admin-analytics.service';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-analytics.component.html',
  styleUrl: './admin-analytics.component.scss',
})
export class AdminAnalyticsComponent implements OnInit {
  private readonly adminAnalytics = inject(AdminAnalyticsService);

  summary: AnalyticsSummary | null = null;
  days = 30;
  loading = false;
  error = '';
  expandedVisitorId: string | null = null;
  visitorDetailsSupported = true;
  search = '';
  lastRefreshedAt: Date | null = null;

  ngOnInit(): void {
    const restoredSession = this.adminAnalytics.restoreSession(this.days);
    if (!restoredSession) return;

    this.loading = true;
    restoredSession.subscribe({
      next: (summary) => {
        this.setSummary(summary);
        this.lastRefreshedAt = new Date();
        this.loading = false;
      },
      error: () => {
        this.error = 'Your remembered admin session has expired. Please sign in again.';
        this.loading = false;
      },
    });
  }

  changeRange(value: string): void {
    this.days = value === 'all' ? 0 : Number(value);
    if (!this.summary) return;

    this.refresh();
  }

  refresh(): void {
    if (!this.summary) return;

    this.loading = true;
    this.error = '';
    this.adminAnalytics.getSummary(this.days).subscribe({
      next: (summary) => {
        this.setSummary(summary);
        this.lastRefreshedAt = new Date();
        this.loading = false;
      },
      error: () => {
        this.error = 'Analytics could not be loaded. Please try again.';
        this.loading = false;
      },
    });
  }

  toggleVisitor(visitor: AnalyticsVisitor): void {
    this.expandedVisitorId =
      this.expandedVisitorId === visitor.visitorId ? null : visitor.visitorId;
  }

  get visitors(): AnalyticsVisitor[] {
    const query = this.search.trim().toLocaleLowerCase();
    const visitors = this.summary?.visitorDetails ?? [];
    if (!query) return visitors;

    return visitors.filter((visitor) => {
      const visitorFields = [visitor.visitorId, visitor.device, visitor.browser];
      const sessionFields = visitor.sessions.flatMap((session) => [
        session.sessionId,
        ...session.songs.map((item) => item.name),
        ...session.selections.map((item) => item.name),
        ...session.greetings.map((item) => item.name),
        ...session.timelines.map((item) => item.name),
        ...session.activity.flatMap((item) => [
          item.type,
          item.page ?? '',
          item.song ?? '',
          item.profileName ?? '',
          item.theme ?? '',
        ]),
      ]);
      return [...visitorFields, ...sessionFields].some((value) =>
        value.toLocaleLowerCase().includes(query),
      );
    });
  }

  get totalVisitorCount(): number {
    return this.summary?.visitorDetails?.length ?? 0;
  }

  private setSummary(summary: AnalyticsSummary): void {
    this.visitorDetailsSupported = Array.isArray(summary.visitorDetails);
    this.summary = {
      ...summary,
      visitorDetails: Array.isArray(summary.visitorDetails)
        ? summary.visitorDetails.map((visitor) => ({
            ...visitor,
            sessions: (visitor.sessions ?? []).map((session) => ({
              ...session,
              songs: session.songs ?? [],
              selections: session.selections ?? [],
              greetings: session.greetings ?? [],
              timelines: session.timelines ?? [],
              otherEvents: session.otherEvents ?? [],
              activity: session.activity ?? [],
              pageViews: session.pageViews ?? {},
            })),
          }))
        : [],
    };
  }

  visitorLabel(visitorId: string): string {
    return `Visitor · ${visitorId.slice(0, 8)}`;
  }

  onRangeChange(event: Event): void {
    this.changeRange((event.target as HTMLSelectElement).value);
  }

  pageLabel(page: string): string {
    const labels: Record<string, string> = {
      home: 'Home',
      'birthday-celebration': 'Birthday',
      'user-selection': 'Selection',
      greeting: 'Greeting',
      timeline: 'Timeline',
      'thank-you': 'Thank You',
      'open-when': 'Open When',
    };
    return labels[page] ?? page;
  }

  eventLabel(type: string): string {
    const labels: Record<string, string> = {
      OPEN_WHEN_NOTE_OPEN: 'Open When note opened',
      JOURNEY_REPLAY: 'Journey replayed',
    };
    return labels[type] ?? type.replaceAll('_', ' ').toLocaleLowerCase();
  }

  maxCount(items: readonly { count: number }[]): number {
    return Math.max(1, ...items.map((item) => item.count));
  }

  barWidth(count: number, items: readonly { count: number }[]): number {
    return Math.max(3, (count / this.maxCount(items)) * 100);
  }

  formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  exportCsv(): void {
    const rows = [
      ['Visitor ID', 'Session ID', 'Device', 'Browser', 'Timestamp', 'Event', 'Page', 'Theme', 'Song', 'Profile', 'Duration (seconds)'],
    ];
    for (const visitor of this.summary?.visitorDetails ?? []) {
      for (const session of visitor.sessions) {
        for (const activity of session.activity) {
          rows.push([
            visitor.visitorId,
            session.sessionId,
            visitor.device,
            visitor.browser,
            activity.recordedAt,
            activity.type,
            activity.page ?? '',
            activity.theme ?? '',
            activity.song ?? '',
            activity.profileName ?? '',
            activity.durationSeconds?.toString() ?? '',
          ]);
        }
      }
    }

    const csv = rows.map((row) =>
      row.map((value) => {
        const safeValue = /^[=+\-@]/.test(value) ? `'${value}` : value;
        return `"${safeValue.replaceAll('"', '""')}"`;
      }).join(','),
    ).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${this.days === 0 ? 'all-time' : `${this.days}-days`}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export interface AnalyticsCount {
  name: string;
  count: number;
}

export interface AnalyticsDailyCount {
  date: string;
  count: number;
}

export interface AnalyticsSession {
  sessionId: string;
  startedAt: string;
  lastSeen: string;
  pageViews: Record<string, number>;
  songs: AnalyticsCount[];
  selections: AnalyticsCount[];
  greetings: AnalyticsCount[];
  timelines: AnalyticsCount[];
  otherEvents: AnalyticsCount[];
  activity: AnalyticsActivity[];
}

export interface AnalyticsActivity {
  recordedAt: string;
  type: string;
  page: string | null;
  theme: string | null;
  song: string | null;
  profileName: string | null;
  durationSeconds: number | null;
}

export interface AnalyticsVisitor {
  visitorId: string;
  device: string;
  browser: string;
  lastSeen: string;
  sessions: AnalyticsSession[];
}

export interface AnalyticsSummary {
  days: number;
  uniqueVisitors: number;
  sessions: number;
  pageViews: number;
  averagePageDurationSeconds: number;
  topPages: AnalyticsCount[];
  themes: AnalyticsCount[];
  browsers: AnalyticsCount[];
  devices: AnalyticsCount[];
  topSongs: AnalyticsCount[];
  dailyPageViews: AnalyticsDailyCount[];
  events: AnalyticsCount[];
  visitorDetails: AnalyticsVisitor[];
}

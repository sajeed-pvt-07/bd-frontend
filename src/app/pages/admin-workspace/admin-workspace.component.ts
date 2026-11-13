import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AnalyticsSummary } from '../../models/Analytics';
import { Config } from '../../models/Config';
import { Greeting } from '../../models/Greeting';
import { Song } from '../../models/Song';
import { ChatSpeaker, MediaType, TimelineItem } from '../../models/TimelineItem';
import { User } from '../../models/User';
import { AdminAnalyticsComponent } from '../admin-analytics/admin-analytics.component';
import { AdminAnalyticsService } from '../../services/admin-analytics.service';
import { AdminContentService } from '../../services/admin-content.service';

type AdminTab = 'analytics' | 'configs' | 'users' | 'greetings' | 'timeline' | 'songs';

@Component({
  selector: 'app-admin-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminAnalyticsComponent],
  templateUrl: './admin-workspace.component.html',
  styleUrl: './admin-workspace.component.scss',
})
export class AdminWorkspaceComponent implements OnInit {
  private readonly analyticsService = inject(AdminAnalyticsService);
  private readonly contentService = inject(AdminContentService);

  readonly tabs: { id: AdminTab; label: string }[] = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'configs', label: 'Configs' },
    { id: 'users', label: 'Users' },
    { id: 'greetings', label: 'Greetings' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'songs', label: 'Songs' },
  ];
  activeTab: AdminTab = 'analytics';
  authorized = false;
  authLoading = false;
  contentLoading = false;
  saving = false;
  error = '';
  success = '';
  configs: Config[] = [];
  users: User[] = [];
  greetings: Greeting[] = [];
  timelineItems: TimelineItem[] = [];
  songs: Song[] = [];

  configDraft: Config = { key: '', value: '' };
  editingConfig = false;
  userDraft: User = this.emptyUser();
  greetingDraft: Greeting = this.emptyGreeting();
  timelineDraft: TimelineItem = this.emptyTimelineItem();
  songDraft: Song = this.emptySong();

  readonly mediaTypes: MediaType[] = ['IMAGE', 'VIDEO', 'AUDIO', 'LINK'];
  readonly chatSpeakers: ChatSpeaker[] = ['ME', 'YOU'];
  readonly songTypes = ['bgm', 'cover'];

  ngOnInit(): void {
    const restoredSession = this.analyticsService.restoreSession();
    if (!restoredSession) return;

    this.authLoading = true;
    restoredSession.subscribe({
      next: () => {
        this.authorized = true;
        this.authLoading = false;
        this.loadContent();
      },
      error: () => {
        this.analyticsService.logout();
        this.error = 'Your admin session has expired. Please sign in again.';
        this.authLoading = false;
      },
    });
  }

  login(username: string, password: string): void {
    this.error = '';
    this.authLoading = true;
    this.analyticsService.authenticate(username.trim(), password, 30).subscribe({
      next: (_summary: AnalyticsSummary) => {
        this.authorized = true;
        this.authLoading = false;
        this.loadContent();
      },
      error: () => {
        this.error = 'Could not sign in. Check that these are admin credentials.';
        this.authLoading = false;
      },
    });
  }

  logout(): void {
    this.analyticsService.logout();
    this.authorized = false;
    this.configs = [];
    this.users = [];
    this.greetings = [];
    this.timelineItems = [];
    this.songs = [];
    this.error = '';
    this.success = '';
  }

  selectTab(tab: AdminTab): void {
    this.activeTab = tab;
    this.error = '';
    this.success = '';
  }

  newConfig(): void {
    this.configDraft = { key: '', value: '' };
    this.editingConfig = false;
  }

  editConfig(config: Config): void {
    this.configDraft = { ...config };
    this.editingConfig = true;
  }

  saveConfig(): void {
    this.runMutation(
      this.contentService.saveConfig(this.configDraft),
      'Config saved.',
      () => {
        this.newConfig();
        this.loadContent();
      },
    );
  }

  deleteConfig(config: Config): void {
    if (!window.confirm(`Permanently delete config "${config.key}"?`)) return;
    this.runMutation(
      this.contentService.deleteConfig(config.key),
      'Config deleted.',
      () => {
        if (this.configDraft.key === config.key) this.newConfig();
        this.loadContent();
      },
    );
  }

  newUser(): void {
    this.userDraft = this.emptyUser();
  }

  editUser(user: User): void {
    this.userDraft = { ...user };
  }

  saveUser(): void {
    const draft = { ...this.userDraft };
    const request = draft.id
      ? this.contentService.updateUser(draft.id, draft)
      : this.contentService.createUser(draft);
    this.runMutation(request, 'User saved.', () => {
      this.newUser();
      this.loadContent();
    });
  }

  toggleUserArchive(user: User): void {
    if (user.active === false) {
      this.runMutation(
        this.contentService.updateUser(user.id!, { ...user, active: true }),
        'User and associated content restored.',
        () => this.loadContent(),
      );
      return;
    }
    if (!window.confirm(`Archive ${user.name} and hide their greetings and timeline items from the public app?`)) return;
    this.runMutation(
      this.contentService.archiveUser(user.id!),
      'User and associated content archived.',
      () => {
        if (this.userDraft.id === user.id) this.newUser();
        this.loadContent();
      },
    );
  }

  newGreeting(): void {
    this.greetingDraft = this.emptyGreeting();
  }

  editGreeting(greeting: Greeting): void {
    this.greetingDraft = { ...greeting };
  }

  saveGreeting(): void {
    const draft = { ...this.greetingDraft };
    const request = draft.id
      ? this.contentService.updateGreeting(draft.id, draft)
      : this.contentService.createGreeting(draft);
    this.runMutation(request, 'Greeting saved.', () => {
      this.newGreeting();
      this.loadContent();
    });
  }

  toggleGreetingArchive(greeting: Greeting): void {
    if (greeting.active === false) {
      this.runMutation(
        this.contentService.updateGreeting(greeting.id!, { ...greeting, active: true }),
        'Greeting restored.',
        () => this.loadContent(),
      );
      return;
    }
    if (!window.confirm('Archive this greeting?')) return;
    this.runMutation(
      this.contentService.archiveGreeting(greeting.id!),
      'Greeting archived.',
      () => this.loadContent(),
    );
  }

  newTimelineItem(): void {
    this.timelineDraft = this.emptyTimelineItem();
  }

  editTimelineItem(item: TimelineItem): void {
    this.timelineDraft = {
      ...item,
      eventDate: item.eventDate?.slice(0, 10),
      media: item.media?.map((media) => ({ ...media })) ?? [],
      chats: item.chats?.map((chat) => ({ ...chat })) ?? [],
    };
  }

  addMedia(): void {
    this.timelineDraft.media = [
      ...(this.timelineDraft.media ?? []),
      { type: 'LINK', url: '', caption: '' },
    ];
  }

  removeMedia(index: number): void {
    this.timelineDraft.media = (this.timelineDraft.media ?? []).filter((_, i) => i !== index);
  }

  addChat(): void {
    this.timelineDraft.chats = [
      ...(this.timelineDraft.chats ?? []),
      { speaker: 'ME', message: '' },
    ];
  }

  removeChat(index: number): void {
    this.timelineDraft.chats = (this.timelineDraft.chats ?? []).filter((_, i) => i !== index);
  }

  saveTimelineItem(): void {
    const draft = {
      ...this.timelineDraft,
      eventDate: this.timelineDraft.eventDate || undefined,
      media: this.timelineDraft.media?.filter((item) => item.url.trim()),
      chats: this.timelineDraft.chats?.filter((chat) => chat.message.trim()),
    };
    const request = draft.id
      ? this.contentService.updateTimelineItem(draft.id, draft)
      : this.contentService.createTimelineItem(draft);
    this.runMutation(request, 'Timeline item saved.', () => {
      this.newTimelineItem();
      this.loadContent();
    });
  }

  toggleTimelineArchive(item: TimelineItem): void {
    if (item.active === false) {
      this.runMutation(
        this.contentService.updateTimelineItem(item.id!, { ...item, active: true }),
        'Timeline item restored.',
        () => this.loadContent(),
      );
      return;
    }
    if (!window.confirm(`Archive "${item.title}"?`)) return;
    this.runMutation(
      this.contentService.archiveTimelineItem(item.id!),
      'Timeline item archived.',
      () => this.loadContent(),
    );
  }

  newSong(): void {
    this.songDraft = this.emptySong();
  }

  editSong(song: Song): void {
    this.songDraft = { ...song };
  }

  saveSong(): void {
    const draft = { ...this.songDraft };
    const request = draft.id
      ? this.contentService.updateSong(draft.id, draft)
      : this.contentService.createSong(draft);
    this.runMutation(request, 'Song saved.', () => {
      this.newSong();
      this.loadContent();
    });
  }

  toggleSongArchive(song: Song): void {
    if (song.active === false) {
      this.runMutation(
        this.contentService.updateSong(song.id!, { ...song, active: true }),
        'Song restored.',
        () => this.loadContent(),
      );
      return;
    }
    if (!window.confirm(`Archive "${song.name}"?`)) return;
    this.runMutation(
      this.contentService.archiveSong(song.id!),
      'Song archived.',
      () => this.loadContent(),
    );
  }

  isActive(value: boolean | undefined): boolean {
    return value !== false;
  }

  userName(userId: string): string {
    return this.users.find((user) => user.id === userId)?.name ?? 'Unknown profile';
  }

  private loadContent(): void {
    this.contentLoading = true;
    this.error = '';
    forkJoin({
      configs: this.contentService.getConfigs(),
      users: this.contentService.getUsers(),
      greetings: this.contentService.getGreetings(),
      timelineItems: this.contentService.getTimelineItems(),
      songs: this.contentService.getSongs(),
    }).subscribe({
      next: (content) => {
        this.configs = content.configs;
        this.users = content.users;
        this.greetings = content.greetings;
        this.timelineItems = content.timelineItems;
        this.songs = content.songs;
        this.contentLoading = false;
      },
      error: () => {
        this.error = 'Could not load app content. Check the admin session and try refreshing.';
        this.contentLoading = false;
      },
    });
  }

  private runMutation<T>(request: import('rxjs').Observable<T>, success: string, afterSave: () => void): void {
    this.saving = true;
    this.error = '';
    this.success = '';
    request.subscribe({
      next: () => {
        this.saving = false;
        this.success = success;
        afterSave();
      },
      error: () => {
        this.saving = false;
        this.error = 'The change could not be saved. Check required fields and try again.';
      },
    });
  }

  private emptyUser(): User {
    return { name: '', dp: '', background: '', precedence: 0, active: true };
  }

  private emptyGreeting(): Greeting {
    return { userId: '', message: '', active: true };
  }

  private emptyTimelineItem(): TimelineItem {
    return {
      userId: '',
      title: '',
      description: '',
      takeaway: '',
      eventDate: '',
      special: false,
      active: true,
      media: [],
      chats: [],
    };
  }

  private emptySong(): Song {
    return { name: '', r2Url: '', type: 'bgm', priority: 0, active: true };
  }
}

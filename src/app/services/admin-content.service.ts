import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Config } from '../models/Config';
import { Greeting } from '../models/Greeting';
import { Song } from '../models/Song';
import { TimelineItem } from '../models/TimelineItem';
import { User } from '../models/User';
import { AdminAuthService } from './admin-auth.service';

@Injectable({ providedIn: 'root' })
export class AdminContentService {
  private readonly http = inject(HttpClient);
  private readonly adminAuth = inject(AdminAuthService);
  private readonly endpoint = `${environment.backendUrl}v1`;
  private get options() {
    return { headers: this.adminAuth.getHeaders() };
  }

  getConfigs() {
    return this.http.get<Config[]>(`${this.endpoint}/admin/content/configs`, this.options);
  }

  saveConfig(config: Config) {
    return this.http.post<Config>(`${this.endpoint}/config`, config, this.options);
  }

  deleteConfig(key: string) {
    return this.http.delete<void>(`${this.endpoint}/config/${encodeURIComponent(key)}`, this.options);
  }

  getUsers() {
    return this.http.get<User[]>(`${this.endpoint}/admin/content/users`, this.options);
  }

  createUser(user: User) {
    return this.http.post<User>(`${this.endpoint}/user`, user, this.options);
  }

  updateUser(id: string, user: User) {
    return this.http.put<User>(`${this.endpoint}/user/${id}`, user, this.options);
  }

  archiveUser(id: string) {
    return this.http.delete<void>(`${this.endpoint}/user/${id}`, this.options);
  }

  getGreetings() {
    return this.http.get<Greeting[]>(`${this.endpoint}/admin/content/greetings`, this.options);
  }

  createGreeting(greeting: Greeting) {
    return this.http.post<Greeting>(`${this.endpoint}/greetings`, greeting, this.options);
  }

  updateGreeting(id: string, greeting: Greeting) {
    return this.http.put<Greeting>(`${this.endpoint}/greetings/${id}`, greeting, this.options);
  }

  archiveGreeting(id: string) {
    return this.http.delete<void>(`${this.endpoint}/greetings/${id}`, this.options);
  }

  getTimelineItems() {
    return this.http.get<TimelineItem[]>(`${this.endpoint}/admin/content/timeline-items`, this.options);
  }

  createTimelineItem(item: TimelineItem) {
    return this.http.post<TimelineItem>(`${this.endpoint}/timeline-items`, item, this.options);
  }

  updateTimelineItem(id: string, item: TimelineItem) {
    return this.http.put<TimelineItem>(`${this.endpoint}/timeline-items/${id}`, item, this.options);
  }

  archiveTimelineItem(id: string) {
    return this.http.delete<void>(`${this.endpoint}/timeline-items/${id}`, this.options);
  }

  getSongs() {
    return this.http.get<Song[]>(`${this.endpoint}/admin/content/songs`, this.options);
  }

  createSong(song: Song) {
    return this.http.post<Song>(`${this.endpoint}/songs`, song, this.options);
  }

  updateSong(id: string, song: Song) {
    return this.http.put<Song>(`${this.endpoint}/songs/${id}`, song, this.options);
  }

  archiveSong(id: string) {
    return this.http.delete<void>(`${this.endpoint}/songs/${id}`, this.options);
  }
}

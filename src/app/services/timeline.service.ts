import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TimelineItem } from '../models/TimelineItem';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {

  private backendUrl = environment.backendUrl;

  constructor(private http: HttpClient) { }

  getTimelineItemsByUserId(userId: string) {
    return this.http.get<TimelineItem[]>(`${this.backendUrl}v1/timeline-items/user/${userId}`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Song } from '../models/Song';

@Injectable({
  providedIn: 'root',
})
export class SongService {
  private readonly backendUrl = environment.backendUrl;

  constructor(private http: HttpClient) {}

  getSongs() {
    return this.http.get<Song[]>(`${this.backendUrl}v1/songs`).pipe(
      map((songs) =>
        [...songs].sort((first, second) => first.priority - second.priority)
      )
    );
  }
}

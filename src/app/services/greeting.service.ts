import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Greeting } from '../models/Greeting';

@Injectable({
  providedIn: 'root'
})
export class GreetingService {

  private backendUrl = environment.backendUrl;

  constructor(private http: HttpClient) { }

  getGreetings() {
    return this.http.get<Greeting[]>(`${this.backendUrl}v1/greetings`);
  }

  getGreetingById(id: string) {
    return this.http.get<Greeting>(`${this.backendUrl}v1/greetings/${id}`);
  }

  getGreetingByUserId(userId: string) {
    return this.http.get<Greeting>(`${this.backendUrl}v1/greetings/user/${userId}`);
  }

  createGreeting(greeting: Greeting) {
    return this.http.post<Greeting>(`${this.backendUrl}v1/greetings`, greeting);
  }

  createGreetings(greetings: Greeting[]) {
    return this.http.post<Greeting[]>(`${this.backendUrl}v1/greetings/batch`, greetings);
  }

  updateGreeting(id: string, greeting: Greeting) {
    return this.http.put<Greeting>(`${this.backendUrl}v1/greetings/${id}`, greeting);
  }

  deleteGreeting(id: string) {
    return this.http.delete<void>(`${this.backendUrl}v1/greetings/${id}`);
  }
}

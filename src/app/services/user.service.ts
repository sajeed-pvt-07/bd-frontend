import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { User } from '../models/User';
import { BehaviorSubject, finalize, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  backendUrl = environment.backendUrl;
  usersSubject: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  selectedUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(private http:HttpClient) { }


  getAllUsers(){
    this.loadingSubject.next(true);
    return this.http.get<User[]>(this.backendUrl + 'v1/user/all').pipe(
      tap((response) => {
        this.setUsers(response);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }


  private setUsers(users: User[]) {
    this.usersSubject.next(users);
  }

  public getUsers() {
    return this.usersSubject.asObservable();
  }

  public setSelectedUser(user: User) {
    this.selectedUserSubject.next(user);
  }

  public getSelectedUser() {
    return this.selectedUserSubject.asObservable();
  }

  public getLoading() {
    return this.loadingSubject.asObservable();
  }
}

import { routes } from './../../app.routes';
import { Observable } from 'rxjs';
import { UserService } from './../../services/user.service';
import { Component } from '@angular/core';
import { UserProfileComponent } from '../../components/user-profile/user-profile.component';
import { AsyncPipe, NgIf } from '@angular/common';
import { User } from '../../models/User';
import { Router } from '@angular/router';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  standalone: true,
  selector: 'app-user-selection',
  imports: [UserProfileComponent, AsyncPipe, NgIf, LoadingIndicatorComponent],
  templateUrl: './user-selection.component.html',
  styleUrl: './user-selection.component.scss'
})
export class UserSelectionComponent {

  users$: Observable<User[]>=new Observable();
  loading$: Observable<boolean> = new Observable();
  selectedUser?: User;

  constructor(
    private UserService: UserService,
    private router: Router,
    private analyticsService: AnalyticsService,
  ) { }

  ngOnInit() {
    this.users$ = this.UserService.getUsers();
    this.loading$ = this.UserService.getLoading();
  } 

  onUserSelected(user: User) {
    this.selectedUser = user;
    this.UserService.setSelectedUser(user);
    this.analyticsService.track('PROFILE_SELECT', { profileName: user.name });
  }


  goToTimeline() { 
    if(this.selectedUser){
      this.router.navigate(['/greeting', this.selectedUser.name], {
        state: { userId: this.selectedUser.id }
      });
    }
  }

}

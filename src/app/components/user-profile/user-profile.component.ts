import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { User } from '../../models/User';

@Component({
  standalone: true,
  selector: 'app-user-profile',
  imports: [NgIf],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {

  @Input() user!: User;
  @Input() selected = false;
  @Output() userSelected = new EventEmitter<User>();

  selectUser() {
    this.userSelected.emit(this.user);
  }
}
import { Component } from '@angular/core';
import { WelcomeComponent } from '../../components/welcome/welcome.component';


@Component({
  selector: 'app-home',
  imports: [WelcomeComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}

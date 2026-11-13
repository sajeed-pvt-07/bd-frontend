import { Component } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import confetti from "canvas-confetti";
import { Router } from '@angular/router';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';


@Component({
  selector: 'app-welcome',
  imports: [AsyncPipe, LoadingIndicatorComponent],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {

  config$:Observable<Map<string,string>>=new Observable();
  loading$: Observable<boolean> = new Observable();
  public constructor(private configService:ConfigService, private router:Router){}

  ngOnInit() {
    this.config$ = this.configService.getConfigs();
    this.loading$ = this.configService.getLoading();
  }

  celebrate() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.router.navigate(['/birthday-celebration']);
      return;
    }

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });


    setTimeout(() => {
      this.router.navigate(['/birthday-celebration']);
    }, 1500);
  }



}

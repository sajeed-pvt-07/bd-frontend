import { AsyncPipe, NgIf } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfigService } from './services/config.service';
import { ThemeService } from './services/theme.service';
import { UserService } from './services/user.service';
import { TourService } from './services/tour.service';
import { Location } from '@angular/common';
import { MusicPlayerComponent } from './components/music-player/music-player.component';
import { AnalyticsService } from './services/analytics.service';




@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    AsyncPipe,
    LucideAngularModule,
    RouterOutlet,
    MusicPlayerComponent,
    NgIf,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly configService = inject(ConfigService);
  private readonly themeService = inject(ThemeService);
  private readonly userService = inject(UserService);
  private readonly tourService = inject(TourService);
  private readonly analyticsService = inject(AnalyticsService);
  private readonly destroyRef = inject(DestroyRef);

  isAdminPage = false;

  constructor(public router: Router, private location: Location) {
    this.updateAdminRouteState();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.updateAdminRouteState());
  }

  title = 'emi-ka-budday';
  isDark$ = this.themeService.isDark$;

  ngOnInit() {
    this.themeService.isDark$.subscribe((isDark) => this.analyticsService.setTheme(isDark));
    this.analyticsService.start();
    this.configService.getAllConfigs().subscribe();
    this.userService.getAllUsers().subscribe();
    
    // Show welcome tour on first visit
    const hasVisited = localStorage.getItem('app_first_visit_tour_shown');
    if (!this.isAdminPage && !hasVisited) {
      setTimeout(() => {
        this.tourService.startWelcomeTour();
        localStorage.setItem('app_first_visit_tour_shown', 'true');
      }, 800);
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  startTour() {
    this.tourService.startTour();
  }

  get isHomePage() {
    return this.router.url === '/home';
  }

  private updateAdminRouteState(): void {
    this.isAdminPage =
      this.router.url.split(/[?#]/, 1)[0].split('/').filter(Boolean)[0] === 'admin';
  }

  navigateBack() {
      this.location.back();
  }
}

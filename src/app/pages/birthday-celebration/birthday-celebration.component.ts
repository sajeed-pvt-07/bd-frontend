import { AsyncPipe } from '@angular/common';
import { Component, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import confetti from 'canvas-confetti';
import { Observable } from 'rxjs';
import { ConfigService } from '../../services/config.service';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { AnalyticsService } from '../../services/analytics.service';

type CelebrationPhase = 'balloons' | 'candles' | 'blown-out' | 'cake-cut' | 'complete';

@Component({
  selector: 'app-birthday-celebration',
  standalone: true,
  imports: [AsyncPipe, LoadingIndicatorComponent],
  templateUrl: './birthday-celebration.component.html',
  styleUrl: './birthday-celebration.component.scss',
})
export class BirthdayCelebrationComponent implements OnDestroy {
  readonly configs$: Observable<Map<string, string>>;
  readonly loading$: Observable<boolean>;
  readonly balloons = [
    { id: 0, color: '#ff8fab' },
    { id: 1, color: '#8ecae6' },
    { id: 2, color: '#ffd166' },
  ];
  poppedBalloons = new Set<number>();
  phase: CelebrationPhase = 'balloons';
  private readonly timers: number[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly router: Router,
    private readonly analyticsService: AnalyticsService,
  ) {
    this.configs$ = this.configService.getConfigs();
    this.loading$ = this.configService.getLoading();
  }

  popBalloon(id: number): void {
    if (this.phase !== 'balloons' || this.poppedBalloons.has(id)) {
      return;
    }

    this.poppedBalloons = new Set([...this.poppedBalloons, id]);
    this.analyticsService.track('BIRTHDAY_BALLOON_POP');

    if (this.poppedBalloons.size === this.balloons.length) {
      this.beginCakeCelebration();
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (
      this.phase !== 'balloons' ||
      event.repeat ||
      event.key === 'Tab' ||
      event.key === 'Enter' ||
      event.key === ' ' ||
      event.key === 'Shift' ||
      event.key === 'Control' ||
      event.key === 'Alt' ||
      event.key === 'Meta' ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey
    ) {
      return;
    }

    const nextBalloon = this.balloons.find(
      (balloon) => !this.poppedBalloons.has(balloon.id),
    );
    if (nextBalloon) {
      this.popBalloon(nextBalloon.id);
    }
  }

  continueToUserSelection(): void {
    this.analyticsService.track('BIRTHDAY_COMPLETE');
    this.router.navigate(['/user-selection']);
  }

  ngOnDestroy(): void {
    this.timers.forEach((timerId) => window.clearTimeout(timerId));
  }

  private beginCakeCelebration(): void {
    this.phase = 'candles';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.phase = 'complete';
      return;
    }

    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.62 },
      colors: ['#ff8fab', '#8ecae6', '#ffd166', '#b8a1ff'],
    });

    this.timers.push(
      window.setTimeout(() => {
        this.phase = 'blown-out';
      }, 4000),
      window.setTimeout(() => {
        this.phase = 'cake-cut';
      }, 5600),
      window.setTimeout(() => {
        this.phase = 'complete';
      }, 6900),
    );
  }
}

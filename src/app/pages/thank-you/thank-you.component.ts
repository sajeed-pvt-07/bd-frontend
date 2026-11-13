import { AsyncPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, inject } from '@angular/core';
import { combineLatest, map, of, shareReplay, timer } from 'rxjs';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { ConfigService } from '../../services/config.service';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [AsyncPipe, DecimalPipe, LoadingIndicatorComponent, RouterLink],
  templateUrl: './thank-you.component.html',
  styleUrl: './thank-you.component.scss',
})
export class ThankYouComponent {
  private readonly configService = inject(ConfigService);
  private readonly analyticsService = inject(AnalyticsService);
  private pinnedPhrase: string | null = null;

  readonly loading$ = this.configService.getLoading();
  hoveredPhrase: string | null = null;
  private readonly phraseSequence$ =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? of(99)
      : timer(0, 360);
  readonly viewModel$ = combineLatest([
    this.configService.getConfigs(),
    this.phraseSequence$,
  ]).pipe(
    map(([configs, tick]) => {
      const phrases = (configs.get('thank-you-phrases') ?? '')
        .split(/\r?\n/)
        .map((phrase) => phrase.trim())
        .filter(Boolean)
        .slice(0, 100);

      return {
        heading: configs.get('thank-you-heading') ?? '',
        phrases,
        shownCount: Math.min(tick + 1, 100),
        activeIndex: Math.min(tick, 99),
        progress: `${Math.min(tick + 1, 100) * 3.6}deg`,
      };
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  phraseAngle(index: number): string {
    return `${(index * 360) / 100}deg`;
  }

  phraseFlips(index: number): boolean {
    const textAngle = ((index * 360) / 100 - 90 + 360) % 360;
    return textAngle > 90 && textAngle < 270;
  }

  phraseTextAngle(index: number): string {
    return this.phraseFlips(index) ? '90deg' : '-90deg';
  }

  showPhraseDetails(phrase: string): void {
    this.hoveredPhrase = phrase;
  }

  hidePhraseDetails(phrase: string): void {
    if (this.pinnedPhrase !== phrase) {
      this.hoveredPhrase = null;
    }
  }

  togglePhraseDetails(phrase: string): void {
    if (window.matchMedia('(hover: none)').matches) {
      this.pinnedPhrase = this.pinnedPhrase === phrase ? null : phrase;
      this.hoveredPhrase = this.pinnedPhrase;
    }
  }

  replayJourney(): void {
    this.analyticsService.track('JOURNEY_REPLAY');
  }
}

import { AsyncPipe } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import confetti from 'canvas-confetti';
import { LucideAngularModule } from 'lucide-angular';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  of,
  shareReplay,
  switchMap,
  take,
  timer,
} from 'rxjs';
import { Greeting } from '../../models/Greeting';
import { User } from '../../models/User';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { GreetingService } from '../../services/greeting.service';
import { UserService } from '../../services/user.service';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-greeting',
  imports: [AsyncPipe, LucideAngularModule, LoadingIndicatorComponent],
  templateUrl: './greeting.component.html',
  styleUrl: './greeting.component.scss',
})
export class GreetingComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly greetingService = inject(GreetingService);
  private readonly userService = inject(UserService);
  private readonly analyticsService = inject(AnalyticsService);
  private readonly navigationUserId = this.router.getCurrentNavigation()?.extras
    .state?.['userId'] as string | undefined;
  public greetingMessage: string = '';

  readonly hasError$ = new BehaviorSubject(false);
  readonly usersLoading$ = this.userService.getLoading();

  @ViewChild('greetingCard')
  set greetingCard(card: ElementRef<HTMLElement> | undefined) {
    if (!card) {
      return;
    }

    setTimeout(() => {
      card.nativeElement.focus({ preventScroll: true });
      card.nativeElement.scrollIntoView({ block: 'center', inline: 'nearest' });
    });
  }

  readonly username$ = this.activatedRoute.paramMap.pipe(
    map((params) => params.get('username') ?? ''),
  );

  readonly selectedUser$ = combineLatest([
    this.username$,
    this.userService.getUsers(),
  ]).pipe(
    map(
      ([username, users]) =>
        users.find((user) => user.name === username) ?? null,
    ),
    shareReplay(1),
  );

  readonly greeting$ = this.selectedUser$.pipe(
    switchMap((user) => {
      const userId = this.navigationUserId ?? user?.id ?? '';

      if (!userId) {
        this.hasError$.next(true);
        return of(null);
      }

      return this.greetingService
        .getGreetingByUserId(userId)
        .pipe(
          catchError(() => {
            this.hasError$.next(true);
            return of(this.getFallbackGreeting(user));
          }),
        )
    }),
    shareReplay(1),
  );

  readonly typedGreeting$ = this.greeting$.pipe(
    switchMap((greeting) => {
      if (!greeting) {
        return of({ text: '', isTyping: false });
      }

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return of({ text: greeting.message, isTyping: false });
      }

      return timer(0, 24).pipe(
        take(greeting.message.length + 1),
        map((characterCount) => ({
          text: greeting.message.slice(0, characterCount),
          isTyping: characterCount < greeting.message.length,
        })),
      );
    }),
    shareReplay(1),
  );

  continueToTimeline(user: User | null) {
    if (!user) {
      this.router.navigate(['/user-selection']);
      return;
    }

    this.analyticsService.track('GREETING_CONTINUE');
    const continueToTimeline = () => {
      this.router.navigate(['/timeline', user.name], {
        state: { userId: user.id, greeted: true },
      });
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      continueToTimeline();
      return;
    }

    this.launchConfetti();
    setTimeout(continueToTimeline, 700);
  }

  private getFallbackGreeting(user: User | null): Greeting {
    const name = user?.name ?? 'friend';

    return {
      id: '',
      userId: user?.id ?? '',
      title: `Hey ${name}`,
      message:
        'This greeting is waiting to be written, but today still belongs to you. Step into the memories and let the celebration begin.',
      signature: 'Always cheering for you',
    };
  }

  private launchConfetti() {
    confetti({
      particleCount: 120,
      spread: 72,
      origin: { y: 0.72 },
      colors: ['#A6E3E9', '#3282B8', '#0F4C75', '#DBE2EF'],
    });
  }
}

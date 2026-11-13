import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NgxTimelineComponent,
  NgxTimelineEvent,
  NgxTimelineEventChangeSide,
  NgxTimelineEventGroup,
  NgxTimelineItem,
} from '@frxjs/ngx-timeline';
import { BehaviorSubject, catchError, combineLatest, map, of, shareReplay, switchMap } from 'rxjs';
import { TimelineItem } from '../../models/TimelineItem';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { TimelineService } from '../../services/timeline.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-timeline',
  imports: [AsyncPipe, DatePipe, NgClass, NgFor, NgIf, NgTemplateOutlet, NgxTimelineComponent, LoadingIndicatorComponent],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss'
})
export class TimelineComponent {

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly timelineService = inject(TimelineService);
  private readonly userService = inject(UserService);
  private readonly navigationUserId = this.router.getCurrentNavigation()?.extras.state?.['userId'] as string | undefined;

  readonly timelineGroup = NgxTimelineEventGroup.MONTH_YEAR;
  readonly timelineChangeSide = NgxTimelineEventChangeSide.ON_DIFFERENT_DAY_IN_GROUP;
  readonly hasError$ = new BehaviorSubject(false);

  readonly username$ = this.activatedRoute.paramMap.pipe(
    map(params => params.get('username') ?? '')
  );

  readonly selectedUser$ = combineLatest([this.username$, this.userService.getUsers()]).pipe(
    map(([username, users]) => users.find(user => user.name === username) ?? null),
    shareReplay(1)
  );

  readonly userId$ = this.selectedUser$.pipe(
    map(user => this.navigationUserId ?? user?.id ?? '')
  );

  readonly timelineItems$ = this.userId$.pipe(
    switchMap(userId => this.timelineService.getTimelineItemsByUserId(userId).pipe(
      catchError(() => {
        this.hasError$.next(true);
        return of([]);
      })
    )),
    shareReplay(1)
  );

  readonly specialItems$ = this.timelineItems$.pipe(
    map(items => items.filter(item => item.special && !item.eventDate))
  );

  readonly undatedItems$ = this.timelineItems$.pipe(
    map(items => items.filter(item => !item.special && !item.eventDate))
  );

  readonly timelineEvents$ = this.timelineItems$.pipe(
    map(items => items
      .filter(item => item.eventDate)
      .map(item => this.toTimelineEvent(item))
    )
  );

  readonly viewModel$ = combineLatest([
    this.specialItems$,
    this.undatedItems$,
    this.timelineEvents$,
  ]).pipe(
    map(([specialItems, undatedItems, timelineEvents]) => ({ specialItems, undatedItems, timelineEvents }))
  );

  getItem(event: NgxTimelineItem): TimelineItem | null {
    return (event.eventInfo?.id as TimelineItem) ?? null;
  }

  continueToThankYou(): void {
    this.router.navigate(['/thank-you']);
  }

  private toTimelineEvent(item: TimelineItem): NgxTimelineEvent {
    return {
      timestamp: new Date(`${item.eventDate}T00:00:00`),
      title: item.title,
      description: item.description,
      id: item,
    };
  }
}

import { Injectable, NgZone, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import {
  BIRTHDAY_CELEBRATION_TOUR_STEPS,
  WELCOME_TOUR_STEPS,
  USER_SELECTION_TOUR_STEPS,
  GREETING_TOUR_STEPS,
  TIMELINE_TOUR_STEPS,
} from '../config/tour-config';
import { filter } from 'rxjs/operators';
import { PopoverDOM } from 'driver.js';
import { AnalyticsService } from './analytics.service';

@Injectable({
  providedIn: 'root',
})
export class TourService {
  private driverInstance: any = null;
  private toursCompleted: Set<string> = new Set();
  private readonly analyticsService = inject(AnalyticsService);
  private readonly labelSkipTour = (popover: PopoverDOM): void => {
    popover.closeButton.textContent = 'Skip tour';
    popover.closeButton.setAttribute('aria-label', 'Skip tour');
    popover.closeButton.classList.add('driver-popover-skip-button');
    popover.title.style.paddingRight = '84px';
  };

  constructor(
    private ngZone: NgZone,
    private router: Router
  ) {
    this.initializePageSpecificTours();
  }

  /**
   * Initialize automatic page-specific tours on navigation
   */
  private initializePageSpecificTours(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        filter((event: any) => !this.toursCompleted.has(event.urlAfterRedirects))
      )
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        this.showPageSpecificTour(url);
      });
  }

  /**
   * Show tour based on current page
   */
  private showPageSpecificTour(url: string): void {
    // Delay to ensure page is rendered
    setTimeout(() => {
      if (url.includes('/home') || url === '/') {
        this.startWelcomeTour();
        this.toursCompleted.add(url);
      } else if (url.includes('/birthday-celebration')) {
        this.startBirthdayCelebrationTour();
        this.toursCompleted.add(url);
      } else if (url.includes('/user-selection')) {
        this.startUserSelectionTour();
        this.toursCompleted.add(url);
      } else if (url.includes('/greeting')) {
        this.startGreetingTour();
        this.toursCompleted.add(url);
      } else if (url.includes('/timeline')) {
        this.startTimelineTour();
        this.toursCompleted.add(url);
      }
    }, 500);
  }

  /**
   * Start welcome tour (shown on first visit)
   */
  startWelcomeTour(): void {
    this.runTour(WELCOME_TOUR_STEPS);
  }

  /**
   * Initialize and start the website tour (route-aware)
   */
  startTour(): void {
    const currentRoute = this.router.url;
    let tourSteps: any[] = WELCOME_TOUR_STEPS;

    if (currentRoute.includes('user-selection')) {
      tourSteps = USER_SELECTION_TOUR_STEPS;
    } else if (currentRoute.includes('birthday-celebration')) {
      tourSteps = BIRTHDAY_CELEBRATION_TOUR_STEPS;
    } else if (currentRoute.includes('greeting')) {
      tourSteps = GREETING_TOUR_STEPS;
    } else if (currentRoute.includes('timeline')) {
      tourSteps = TIMELINE_TOUR_STEPS;
    }

    this.runTour(tourSteps);
  }

  startBirthdayCelebrationTour(): void {
    this.ngZone.runOutsideAngular(() => {
      if (document.querySelector('.balloon-field')) {
        this.runTour(BIRTHDAY_CELEBRATION_TOUR_STEPS);
      }
    });
  }

  /**
   * Start user selection page tour
   */
  startUserSelectionTour(): void {
    this.ngZone.runOutsideAngular(() => {
      // Check if .users element exists
      if (document.querySelector('.users')) {
        this.runTour(USER_SELECTION_TOUR_STEPS);
      }
    });
  }

  /**
   * Start greeting page tour
   */
  startGreetingTour(): void {
    this.ngZone.runOutsideAngular(() => {
      if (document.querySelector('.greeting-card')) {
        this.runTour(GREETING_TOUR_STEPS);
      }
    });
  }

  /**
   * Start timeline page tour
   */
  startTimelineTour(): void {
    this.ngZone.runOutsideAngular(() => {
      // Check if timeline page elements exist
      if (document.querySelector('.timeline-page')) {
        this.runTour(TIMELINE_TOUR_STEPS);
      }
    });
  }

  /**
   * Start custom tour with specified steps
   */
  startCustomTour(steps: any[]): void {
    this.runTour(steps);
  }

  private runTour(steps: any[]): void {
    this.analyticsService.track('TOUR_START');
    this.ngZone.runOutsideAngular(() => {
      const driverObj = driver({
        allowClose: true,
        showButtons: ['next', 'previous', 'close'],
        onPopoverRender: this.labelSkipTour,
        overlayOpacity: 0.5,
        smoothScroll: true,
        animate: true,
        showProgress: true,
        steps,
        onCloseClick: () => {
          this.analyticsService.track('TOUR_SKIP');
          this.endTour();
        },
        onDestroyed: () => {
          this.driverInstance = null;
        },
      });

      this.driverInstance = driverObj;
      driverObj.drive();
    });
  }

  /**
   * End the current tour
   */
  endTour(): void {
    if (this.driverInstance) {
      this.driverInstance.destroy();
      this.driverInstance = null;
    }
  }

  /**
   * Reset tour to the first step
   */
  resetTour(): void {
    if (this.driverInstance) {
      this.driverInstance.drive();
    }
  }

  /**
   * Reset completed tours - call this to re-show page-specific tours
   */
  resetCompletedTours(): void {
    this.toursCompleted.clear();
  }

  /**
   * Mark a specific page tour as completed
   */
  markTourAsCompleted(url: string): void {
    this.toursCompleted.add(url);
  }
}

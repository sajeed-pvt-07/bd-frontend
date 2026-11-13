# Website Tour Guide using Driver.js

This guide explains how to use and customize the website tour feature powered by **driver.js**.

## Installation

driver.js is already installed. To verify, check your `package.json`:

```json
"driver.js": "latest"
```

## How to Use

### Starting the Tour

Users can start the tour in several ways:

1. **Click the Info Button**: The info button (with an info icon) in the top-right corner of the page starts the tour.
2. **Programmatically**: Call `tourService.startTour()` in your component.

### Tour Service Methods

The `TourService` provides several methods:

```typescript
import { TourService } from './services/tour.service';

export class MyComponent {
  constructor(private tourService: TourService) {}

  // Start the default tour
  startDefaultTour() {
    this.tourService.startTour();
  }

  // Start a custom tour with specific steps
  startCustomTour() {
    const customSteps = [
      {
        element: '#my-element',
        popover: {
          title: '🎯 Element Title',
          description: 'Description of what this element does.',
          side: 'bottom',
          align: 'center',
        },
      },
    ];
    this.tourService.startCustomTour(customSteps);
  }

  // End the current tour
  endTour() {
    this.tourService.endTour();
  }

  // Reset tour to first step
  resetTour() {
    this.tourService.resetTour();
  }
}
```

## Customizing Tour Steps

### Location of Tour Configuration

The main tour steps are defined in [src/app/config/tour-config.ts](./config/tour-config.ts).

### Available Tour Configurations

1. **TOUR_STEPS** - Default tour covering main features
2. **MUSIC_PLAYER_TOUR_STEPS** - Focused tour on the music player

### Popover Configuration Options

Each step has a `popover` object with the following properties:

```typescript
{
  element: '.selector',  // CSS selector for the element to highlight
  popover: {
    title: 'Step Title',  // Title of the popover
    description: 'Step description',  // Description text
    side: 'top|bottom|left|right',  // Position of popover
    align: 'start|center|end',  // Alignment relative to element
  },
}
```

### Driver Configuration Options

The main driver configuration is in [src/app/services/tour.service.ts](./services/tour.service.ts).

Common options:

```typescript
{
  allowClose: true,           // Allow closing the tour
  overlayOpacity: 0.5,        // Overlay darkness (0-1)
  smoothScroll: true,         // Smooth scrolling to elements
  animate: true,              // Animate transitions
  showProgress: true,         // Show step progress
  showButtons: ['next', 'previous', 'close'],
  nextBtnText: 'Next →',
  prevBtnText: '← Previous',
  doneBtnText: 'Done',
}
```

## Examples

### Using the Default Tour

```typescript
// In your app.component.ts or any component
startTour() {
  this.tourService.startTour();
}
```

### Creating a Custom Tour

```typescript
import { MUSIC_PLAYER_TOUR_STEPS } from './config/tour-config';

// Use existing configuration
this.tourService.startCustomTour(MUSIC_PLAYER_TOUR_STEPS);

// Or create a new one
const myTourSteps = [
  {
    element: '#feature-1',
    popover: {
      title: 'Feature 1',
      description: 'This is an important feature',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#feature-2',
    popover: {
      title: 'Feature 2',
      description: 'Another cool feature',
      side: 'right',
      align: 'center',
    },
  },
];

this.tourService.startCustomTour(myTourSteps);
```

### Starting Tour on First Visit

You can use local storage to show the tour on first visit:

```typescript
export class AppComponent implements OnInit {
  constructor(private tourService: TourService) {}

  ngOnInit() {
    const hasVisited = localStorage.getItem('tour_visited');
    if (!hasVisited) {
      this.tourService.startTour();
      localStorage.setItem('tour_visited', 'true');
    }
  }
}
```

## Styling

The tour uses driver.js's default CSS which is imported in the service:

```typescript
import 'driver.js/dist/driver.css';
```

You can customize driver.js styles by adding custom CSS:

```scss
// In your global styles.scss
.driver-popover {
  background: var(--surface);
  color: var(--text);
  border-radius: 8px;
}

.driver-popover-title {
  font-weight: 600;
  font-size: 16px;
}

.driver-popover-description {
  font-size: 14px;
  margin-top: 8px;
}
```

## Tips and Best Practices

1. **Use Clear Descriptions**: Write concise, user-friendly descriptions.
2. **Include Emojis**: Adding emojis to titles makes the tour more engaging.
3. **Group Related Steps**: Create different tour configurations for different features.
4. **Test on Mobile**: Use the browser's mobile view to ensure the tour works on small screens.
5. **Update Regularly**: Keep tour steps updated when UI changes.

## Troubleshooting

### Tour doesn't start

- Make sure the element selector exists and is visible
- Check browser console for errors
- Verify the TourService is properly injected

### Popover appears in wrong position

- Adjust the `side` and `align` properties
- Try different side values: 'top', 'bottom', 'left', 'right'

### Tour button doesn't appear

- Check that the tour button was added to `app.component.html`
- Verify z-index in `app.component.scss` doesn't conflict with other elements

---

For more information, visit the [driver.js documentation](https://driverjs.com).

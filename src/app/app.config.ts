import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import { icons } from 'lucide-angular';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider(icons)
    },
    provideHttpClient() // Add the function here

  ]
};

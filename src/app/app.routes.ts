import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UserSelectionComponent } from './pages/user-selection/user-selection.component';
import { TimelineComponent } from './pages/timeline/timeline.component';
import { userSelectionGuardGuard } from './guards/user-selection-guard.guard';
import { GreetingComponent } from './pages/greeting/greeting.component';
import { BirthdayCelebrationComponent } from './pages/birthday-celebration/birthday-celebration.component';
import { ThankYouComponent } from './pages/thank-you/thank-you.component';
import { OpenWhenComponent } from './pages/open-when/open-when.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'birthday-celebration', component: BirthdayCelebrationComponent },
  { path: 'user-selection', component: UserSelectionComponent },
  { path: 'greeting/:username', component: GreetingComponent, canActivate: [userSelectionGuardGuard] },
  { path: 'timeline/:username', component: TimelineComponent, canActivate: [userSelectionGuardGuard] },
  { path: 'thank-you', component: ThankYouComponent },
  { path: 'thank-you/:username', redirectTo: 'thank-you' },
  { path: 'open-when', component: OpenWhenComponent },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin-workspace/admin-workspace.component').then(
        (module) => module.AdminWorkspaceComponent,
      ),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];

import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { map, take } from 'rxjs/operators';

export const userSelectionGuardGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const userService = inject(UserService);

  const selectedUsername = route.params['username'];
  const requiresGreeting = route.routeConfig?.path === 'timeline/:username';
  const greeted = router.getCurrentNavigation()?.extras.state?.['greeted'] === true;

  return userService.getAllUsers().pipe(
    take(1),
    map((users) => {
      const selectedUser = users.find((user) => user.name === selectedUsername);
      if (!selectedUsername || !selectedUser) {
        router.navigate(['/user-selection']);
        return false;
      }
      if (requiresGreeting && !greeted) {
        router.navigate(['/greeting', selectedUsername], {
          state: { userId: selectedUser.id }
        });
        return false;
      }
      return true;
    }),
  );
};

import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { userSelectionGuardGuard } from './user-selection-guard.guard';

describe('userSelectionGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => userSelectionGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

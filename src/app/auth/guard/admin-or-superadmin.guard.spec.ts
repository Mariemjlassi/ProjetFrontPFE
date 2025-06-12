import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { adminOrSuperadminGuard } from './admin-or-superadmin.guard';

describe('adminOrSuperadminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => adminOrSuperadminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { inject } from '@angular/core';

export const adminOrSuperadminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authS = inject(AuthService);

  if (!authS.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const role = authS.getUserRole();

  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    return true;
  }

  router.navigate(['/dashboard']); 
  return false;
};

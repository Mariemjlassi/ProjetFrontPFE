import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authS = inject(AuthService);

  if (!authS.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (authS.getUserRole() !== 'ADMIN') {
    return false;
  }

  return true;
};

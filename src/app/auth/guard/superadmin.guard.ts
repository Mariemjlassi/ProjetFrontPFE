import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const superadminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
    const authS = inject(AuthService);
  
    if (!authS.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (authS.getUserRole() !== 'SUPER_ADMIN') {
    router.navigate(['/dashboard']); 
    return false;
  }
  
    return false;
  };
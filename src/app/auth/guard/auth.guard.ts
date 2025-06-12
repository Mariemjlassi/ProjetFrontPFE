import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authS = inject(AuthService);
  if(authS.isAuthenticated()){
    return true;
  }else{
    router.navigate(['/login']);
    return false;
  }
};

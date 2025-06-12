import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { inject } from '@angular/core';

export const guardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authS = inject(AuthService);
  if(authS.isAuthenticated() && authS.getUserRole() === 'RH'){
    return true;
  } else { if(!authS.isAuthenticated()){
      router.navigate(['/login']);}
      else{if(!(authS.getUserRole() === 'RH')){return false;}}
      return false;
    }
};

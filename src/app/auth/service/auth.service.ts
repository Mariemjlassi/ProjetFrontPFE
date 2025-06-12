import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from '../../../auth.config';
import { LoginRequest } from '../model/login-request';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:9090/';

  constructor(private http: HttpClient, private router: Router) {}

  registerRH(SignupRequest: any): Observable<any> {
    SignupRequest.role = 'RH';
    const url = this.baseUrl + 'signup/rh';
    const headers = this.createAuthorizationHeader();
    return this.http.post(url, SignupRequest, {headers});
  }

  registerDirecteur(SignupRequest: any): Observable<any> {
    SignupRequest.role = 'DIRECTEUR';
    const url = this.baseUrl + 'signup/directeur';
    const headers = this.createAuthorizationHeader();
    return this.http.post(url, SignupRequest, {headers});
  }

  registerResponsable(SignupRequest: any): Observable<any> {
    SignupRequest.role = 'RESPONSABLE';
    const url = this.baseUrl + 'signup/responsable';
    const headers = this.createAuthorizationHeader();
    return this.http.post(url, SignupRequest, {headers});
  }

  registerAdmin(SignupRequest: any): Observable<any> {
    SignupRequest.role = 'ADMIN';
    const url = this.baseUrl + 'signup/admin';
    const headers = this.createAuthorizationHeader();
    return this.http.post(url, SignupRequest, {headers});
  }

  login(loginRequest: LoginRequest): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'login', loginRequest).pipe(
      map((response) => {
        if (response && response.jwt) {
          localStorage.setItem('jwt', response.jwt);
          localStorage.setItem('userId', response.utilisateurId);
          localStorage.setItem('userRole', response.role);
        }
        return response;
      })
    );
  }

  requestPasswordReset(email: string): Observable<any> {
    const url = `${this.baseUrl}password-reset/request`;
    return this.http.post(url, { email }, { responseType: 'text' });
  }

  resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<any> {
    const url = `${this.baseUrl}password-reset/reset`;
    const body = { token, newPassword, confirmPassword };
    return this.http.post(url, body);
  }

  saveTokenAndRole(token: string, roles: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', roles);
  }

  // Dans AuthService
getUserRole(): string | null {
    const role = localStorage.getItem('userRole');
    console.log('Rôle récupéré:', role);
    return role;
}

  // Ajouter la méthode pour vérifier le rôle
isSuperAdmin(): boolean {
  return this.getUserRole() === 'SUPER_ADMIN';
}

  createAuthorizationHeader(): HttpHeaders {
    const jwtToken = localStorage.getItem('jwt');
    if (jwtToken) {
      console.log('JWT token found in local storage', jwtToken);
      return new HttpHeaders().set('Authorization', 'Bearer ' + jwtToken);
    } else {
      console.log('JWT token not found in local storage');
      return new HttpHeaders();
    }
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('jwt') != null;
  }

  logout(): void {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    console.log('Déconnexion réussie. Tous les tokens ont été supprimés.');

    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  }

  
  isLoggedIn(): boolean {
    const isLoggedIn = !!localStorage.getItem('jwt');
    if (isLoggedIn) {
    }
    return isLoggedIn;
  }

  
}

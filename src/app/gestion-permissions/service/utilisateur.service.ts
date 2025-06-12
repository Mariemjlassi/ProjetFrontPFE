import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:9090/utilisateurs';

  headers : any;
    constructor(private http: HttpClient, private authservice: AuthService) {
      this.headers = this.authservice.createAuthorizationHeader();
    }
 
  getAllUtilisateurs(): Observable<any> {
    return this.http.get(`${this.apiUrl}`,{headers:this.headers});
  }

  
}
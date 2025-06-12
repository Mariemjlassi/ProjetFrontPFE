import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class JournalActionService {
  private apiUrl = 'http://localhost:9090/utilisateurs';

  headers : any;
    constructor(private http: HttpClient, private authservice: AuthService) {
      this.headers = this.authservice.createAuthorizationHeader();
    }

  getUserActions(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}/journal`, {headers : this.headers});
  }

  getActionsSinceLastLogin(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}/journal-last-login`, {headers : this.headers});
  }

  getAllJournalActions():Observable<any[]>{
    return this.http.get<any[]>(`${this.apiUrl}/journal/all`, {headers : this.headers});
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = 'http://localhost:9090/notifications';

  headers: any;

  constructor(private http: HttpClient, private authservice: AuthService) {
    this.headers = this.authservice.createAuthorizationHeader();
  }

  getNotifications(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/utilisateur/${userId}`, { headers: this.headers });
  }

  markAsRead(userId: number): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/utilisateur/${userId}/lire`, 
      {}, 
      { headers: this.headers }
    );
  }
}

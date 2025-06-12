
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur } from '../model/utilisateur';

@Injectable({
  providedIn: 'root'
})
export class EmergencyService {
  private apiUrl = 'http://localhost:9090/api/emergency';

  constructor(private http: HttpClient) { }

  restoreAdminPermissions(emergencyToken: string, adminId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/restore-admin-permissions`, null, {
      params: {
        emergencyToken,
        adminId: adminId.toString()
      }
    });
  }

  getAdminUsers(emergencyToken: string): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.apiUrl}/admin-users`, {
      params: { emergencyToken }
    });
  }

  
}
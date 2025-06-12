import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private apiUrl = 'http://localhost:9090/permissions';

  headers: any;

  constructor(private http: HttpClient, private authservice: AuthService) {
    this.headers = this.authservice.createAuthorizationHeader();
  }
  

  
  createPermission(name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, { name }, {headers : this.headers});
  }

  
  getAllPermissions(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, {headers : this.headers});
  }

  
  assignPermission(userId: number, permissionName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/assign`, { userId, permissionName }, {headers : this.headers});
  }

  
  removePermission(userId: number, permissionName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/remove`, { userId, permissionName }, {headers : this.headers});
  }
}
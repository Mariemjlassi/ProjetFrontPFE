import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeReportingService {
  private apiUrl = `http://localhost:9090/api/reporting/employes`
  headers : any;
          constructor(private http: HttpClient, private authservice: AuthService) {
            this.headers = this.authservice.createAuthorizationHeader();
          }
  getEmployeReporting(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {headers : this.headers});
  }
}

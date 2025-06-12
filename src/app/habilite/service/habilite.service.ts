import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeHabilitationDto } from '../model/employe-habilitation-dto';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class HabiliteService {
  private apiUrl = 'http://localhost:9090/api/employes/habilitations-proches'; 

  headers : any;
  constructor(private http: HttpClient, private authService: AuthService) {
    this.headers = this.authService.createAuthorizationHeader();
  }

  getEmployesAvecPostesHabilitesProches(): Observable<EmployeHabilitationDto[]> {
    return this.http.get<EmployeHabilitationDto[]>(this.apiUrl, { headers : this.headers});
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class StageService {

  private apiUrl = 'http://localhost:9090/stages'; 

  headers : any;
  constructor(private http: HttpClient, private authservice: AuthService) {
    this.headers = this.authservice.createAuthorizationHeader();
  }

  
  getStagesByEmployeId(employeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${employeId}/stages`, { headers: this.headers });
  }

  
  addStageToEmploye(employeId: number, stage: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${employeId}`, stage, { headers: this.headers });
  }

  
  removeStageFromEmploye(employeId: number, stageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${employeId}/stages/${stageId}`, { headers: this.headers });
  }

  
  updateStage(stageId: number, updatedStage: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${stageId}`, updatedStage, { headers: this.headers });
  }
}
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { Discipline } from '../model/Discipline';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DisciplineService {
  private apiUrl = 'http://localhost:9090';

  headers : any;
  constructor(private http: HttpClient, private authservice: AuthService) {
    this.headers = this.authservice.createAuthorizationHeader();
  }

  addDisciplineToEmploye(employeId: number, discipline: Discipline): Observable<Discipline> {
      return this.http.post<Discipline>(`${this.apiUrl}/disciplines/${employeId}/disciplines`, discipline, { headers: this.headers });
    }
  
    getDisciplinesByEmployeId(employeId: number): Observable<Discipline[]> {
    return this.http.get<Discipline[]>(`${this.apiUrl}/disciplines/${employeId}/disciplines`, { headers: this.headers });
  }
    removeDisciplineFromEmploye(employeId: number, disciplineId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/disciplines/${employeId}/disciplines/${disciplineId}`, { headers: this.headers });
    }

    updateDiscipline(disciplineId: number, updatedDiscipline: Discipline): Observable<Discipline> {
      return this.http.put<Discipline>(`${this.apiUrl}/disciplines/disciplines/${disciplineId}`, updatedDiscipline, { headers: this.headers });
    }
}
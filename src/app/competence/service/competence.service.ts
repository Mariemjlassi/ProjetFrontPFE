import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Competence } from '../model/competence';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CompetenceService {
  private apiUrl = 'http://localhost:9090/api/competences';

  headers : any;
  
    constructor(private http: HttpClient, private authservice: AuthService) {
      this.headers = this.authservice.createAuthorizationHeader();
    }
  

  getAll(): Observable<Competence[]> {
    return this.http.get<Competence[]>(this.apiUrl, {headers : this.headers});
  }

  create(competence: Competence): Observable<Competence> {
    return this.http.post<Competence>(this.apiUrl, competence, {headers : this.headers});
  }

  update(id: number, competence: Competence): Observable<Competence> {
    return this.http.put<Competence>(`${this.apiUrl}/${id}`, competence, {headers : this.headers});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {headers : this.headers});
  }
  // Dans votre CompetenceService (ou un nouveau service si préférez)
getEmployesWithCompetence(competenceId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/${competenceId}/employes`, {headers : this.headers});
}
}

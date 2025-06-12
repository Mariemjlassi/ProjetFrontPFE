import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeCompetence } from '../model/employecompetence';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeCompetenceService {

  private baseUrl = 'http://localhost:9090/employecompetences'; // Base URL pour l'API

  headers : any;
    
      constructor(private http: HttpClient, private authservice: AuthService) {
        this.headers = this.authservice.createAuthorizationHeader();
      }

  // Récupérer les compétences d'un employé
  getByEmployeId(employeId: number): Observable<EmployeCompetence[]> {
    return this.http.get<EmployeCompetence[]>(`${this.baseUrl}/employes/${employeId}/competences`, {headers : this.headers});
  }

  // Ajouter une compétence à un employé
  addCompetenceToEmploye(employeId: number, data: { competenceId: number; niveau: string }): Observable<EmployeCompetence> {
    return this.http.post<EmployeCompetence>(`${this.baseUrl}/employes/${employeId}/competences`, data, {headers : this.headers});
  }

  // Mettre à jour le niveau d'une compétence pour un employé
  updateNiveau(employeCompetenceId: number, data: { niveau: string }): Observable<EmployeCompetence> {
    return this.http.put<EmployeCompetence>(`${this.baseUrl}/employe-competences/${employeCompetenceId}`, data, {headers : this.headers});
  }

  // Supprimer une compétence d'un employé
  delete(employeCompetenceId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/employe-competences/${employeCompetenceId}`, {headers : this.headers});
  }
}

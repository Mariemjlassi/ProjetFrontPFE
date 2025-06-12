import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {

  private baseUrl = 'http://localhost:9090/api/experiences'; // URL de l'API

  headers : any;
  constructor(private http: HttpClient, private authservice: AuthService) {
    this.headers = this.authservice.createAuthorizationHeader();
  }

  // Ajouter une expérience antérieure
  addExperienceAnterieure(employeId: number, experience: any): Observable<any> {
    console.log('Envoi de l\'expérience Assad:', experience);
    return this.http.post<any>(`${this.baseUrl}/anterieure/${employeId}`, experience, { headers: this.headers });
    
    
  }

  // Ajouter une expérience Assad
  addExperienceAssad(employeId: number, experience: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/assad/${employeId}`, experience, { headers: this.headers });
  }

  // Modifier une expérience Assad
  modifyExperienceAssad(id: number, experience: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/assad/${id}`, experience, { headers: this.headers });
  }

  // Modifier une expérience antérieure
  modifyExperienceAnterieure(id: number, experience: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/anterieure/${id}`, experience, { headers: this.headers });
  }

  // Récupérer les expériences Assad pour un employé
  getExperiencesAssad(employeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/assad/${employeId}`, { headers: this.headers });
  }

  // Récupérer les expériences antérieures pour un employé
  getExperiencesAnterieure(employeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/anterieure/${employeId}`, { headers: this.headers });
  }
  deleteExperienceAssad(employeId: number, experienceId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/experienceAssad/${employeId}/${experienceId}`, { headers: this.headers });
  }
  
  deleteExperienceAnterieure(employeId: number, experienceId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/experienceAnterieure/${employeId}/${experienceId}`, { headers: this.headers });
  }
  



}

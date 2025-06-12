import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class FormationPosteService {
  private apiUrl = 'http://localhost:9090/api/formation-poste'; // URL de l'API Spring Boot

  headers : any;
  constructor(private http: HttpClient, private authService: AuthService) {
    this.headers = this.authService.createAuthorizationHeader();
  }

  // Ajouter une paire
  addPair(formationId: number, posteId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}?formationId=${formationId}&posteId=${posteId}`, 
      {}, 
      { headers: this.headers }
    );
  }

  // Récupérer toutes les paires
  getAllPairs(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { headers: this.headers });
  }

  // Supprimer une paire par IDaddPair
  deletePair(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.headers });
  }

  // Récupérer une paire par ID
  getPairById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.headers });
  }

  updatePosteForFormation(formationId: number, newPosteId: number): Observable<any> {
    const url = `${this.apiUrl}/formation/${formationId}`;
    return this.http.put(url, newPosteId, { headers: this.headers });
  }

  getPosteIdByFormationId(formationId: number): Observable<number> {
    const url = `${this.apiUrl}/poste-by-formation/${formationId}`;
    return this.http.get<number>(url, { headers: this.headers });
  }

  getPosteByFormationId(formationId: number): Observable<any> {
    const url = `${this.apiUrl}/poste-by-formationid/${formationId}`;
    return this.http.get<any>(url, { headers: this.headers });
  }
  
  
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/service/auth.service';

export interface CompetencePoste {
  id?: number;
  nom: string;
  description: string;
  postes?: any[]; // Adaptez selon vos besoins
}

@Injectable({
  providedIn: 'root'
})
export class CompetencePosteService {
  private apiUrl = `http://localhost:9090/competences_poste`;

  headers : any;

  constructor(private http: HttpClient, private authservice: AuthService) {
    this.headers = this.authservice.createAuthorizationHeader();
  }

  // Créer une nouvelle compétence
  create(competence: CompetencePoste): Observable<CompetencePoste> {
    return this.http.post<CompetencePoste>(this.apiUrl, competence, { headers: this.headers });
  }

  // Mettre à jour une compétence existante
  update(id: number, competence: CompetencePoste): Observable<CompetencePoste> {
    return this.http.put<CompetencePoste>(`${this.apiUrl}/${id}`, competence, { headers: this.headers });
  }

  // Supprimer une compétence
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.headers });
  }

  // Récupérer une compétence par son ID
  getById(id: number): Observable<CompetencePoste> {
    return this.http.get<CompetencePoste>(`${this.apiUrl}/${id}`, { headers: this.headers });
  }

  // Récupérer toutes les compétences
  getAllCompetences(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.headers });
  }

  getPostesByCompetenceId(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/postes`, { headers: this.headers });
  }

  
}
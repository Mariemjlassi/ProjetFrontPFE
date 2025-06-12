import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Poste } from '../model/poste';
import { PosteDTO } from '../model/PosteDTO';
import { AuthService } from '../../auth/service/auth.service';


@Injectable({
  providedIn: 'root'
})
export class PosteService {
  private apiUrl = `http://localhost:9090/recrutement/postes`; // Remplace `apiUrl` par l'URL de ton backend

  private headers: any;

  constructor(private http: HttpClient, private authservice: AuthService) {
    this.headers = this.authservice.createAuthorizationHeader();
  }
  ajouterPoste(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/ajouter`, formData, { headers: this.headers });
  }

  getAllPostes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.headers });
  }

  getPosteById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.headers });
  }

  updatePoste(id: number, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData, { headers: this.headers });
  }

  getAllPostesnonArchives(): Observable<Poste[]> {
    return this.http.get<Poste[]>(`${this.apiUrl}/getAllPostesnonArchives`, {
      headers: this.headers,
      responseType: 'json'
    }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des postes:', error);
        return throwError(() => new Error('Erreur de chargement des postes'));
      })
    );
  }

  getAllPostesArchives(): Observable<Poste[]> {
    return this.http.get<Poste[]>(`${this.apiUrl}/liste-Postes-archives`, { headers: this.headers });
  }

  archiverPoste(id: number): Observable<Poste> {
    return this.http.put<Poste>(`${this.apiUrl}/${id}/archiver`, {}, { headers: this.headers });
  }

  desarchiverPoste(id: number): Observable<Poste> {
    return this.http.put<Poste>(`${this.apiUrl}/${id}/desarchiver`, {}, { headers: this.headers });
  }

  updatePostee(id: number, posteDto: PosteDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, posteDto, { headers: this.headers });
  }

  getDirectionsByPosteId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/directions`, { headers: this.headers });
  }

  getCompetencesByPosteId(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/competences`, { headers: this.headers });
  }

}
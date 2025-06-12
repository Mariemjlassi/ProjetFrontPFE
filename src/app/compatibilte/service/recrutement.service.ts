import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Candidat } from '../model/candidat';
import { Poste } from '../model/poste';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RecrutementService {

  private apiUrlPostes = 'http://localhost:9090/recrutement/postes';
  private apiUrlCandidats = 'http://localhost:9090/recrutement/candidats';
  private apiUrlSuggereCandidats = 'http://localhost:9090/recrutement/suggere'; 

  headers : any;
  constructor(private http: HttpClient, private authservice: AuthService) {
    this.headers = this.authservice.createAuthorizationHeader();
  }

  getCandidats(): Observable<Candidat[]> {
    return this.http.get<Candidat[]>(this.apiUrlCandidats, { headers: this.headers });
  }

  
  getPostes(): Observable<Poste[]> {
    return this.http.get<Poste[]>(this.apiUrlPostes, { headers: this.headers });
  }

  
  getPosteById(posteId: number): Observable<Poste> {
    return this.http.get<Poste>(`${this.apiUrlPostes}/${posteId}`, { headers: this.headers });
  }

  
  suggererCandidats(posteId: number): Observable<Candidat[]> {
    return this.http.get<Candidat[]>(`${this.apiUrlSuggereCandidats}/${posteId}`, { headers: this.headers });
  }
}

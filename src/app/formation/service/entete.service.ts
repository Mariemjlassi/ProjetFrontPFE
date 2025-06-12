import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entete } from '../model/Entete';
import { AuthService } from '../../auth/service/auth.service';


@Injectable({
  providedIn: 'root'
})
export class EnteteService {

  private apiUrl = 'http://localhost:9090/api/entetes'; // à adapter selon ton backend

  headers : any;
        constructor(private http: HttpClient, private authservice: AuthService) {
          this.headers = this.authservice.createAuthorizationHeader();
        }

  getAllEntetes(): Observable<Entete[]> {
    return this.http.get<Entete[]>(this.apiUrl, {headers : this.headers});
  }

  createEntete(entete: Entete): Observable<Entete> {
    return this.http.post<Entete>(this.apiUrl, entete, {headers : this.headers});
  }

  updateEntete(id: number, entete: Entete): Observable<Entete> {
    return this.http.put<Entete>(`${this.apiUrl}/${id}`, entete, {headers : this.headers});
  }

  deleteEntete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {headers : this.headers});
  }





}
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TypeDiplome } from '../model/type-diplome';
import { catchError, Observable } from 'rxjs';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TypeDiplomeService {
  private apiUrl = 'http://localhost:9090/typediplomes';
  headers : any;
  constructor(private http: HttpClient, private authservice: AuthService) {
    this.headers = this.authservice.createAuthorizationHeader();
  }

  getTypeDiplomeById(id: number): Observable<TypeDiplome> {
    return this.http.get<TypeDiplome>(`${this.apiUrl}/${id}`, { headers: this.headers });
  }

  addTypeDiplome(typeDiplome: TypeDiplome): Observable<TypeDiplome> {
    return this.http.post<TypeDiplome>(`${this.apiUrl}/add`, typeDiplome, { headers: this.headers });
  }
  
  updateTypeDiplome(id: number, typeDiplome: TypeDiplome): Observable<TypeDiplome> {
  return this.http.put<TypeDiplome>(`${this.apiUrl}/${id}`, typeDiplome, { headers: this.headers }).pipe(
    catchError((error) => {
      // Transformer l'erreur pour avoir un message clair
      if (error.error && typeof error.error === 'string') {
        throw new Error(error.error);
      }
      throw new Error("Une erreur est survenue lors de la mise à jour");
    })
  );
}
  archiverTypeDiplome(id: number): Observable<TypeDiplome> {
    return this.http.put<TypeDiplome>(`${this.apiUrl}/archiver/${id}`, {}, { headers: this.headers });
  }
  getAllTypeDiplomeNonArchives(): Observable<TypeDiplome[]> {
    return this.http.get<TypeDiplome[]>(`${this.apiUrl}`, { headers: this.headers });
  }

  // Méthode pour récupérer tous les TypeDiplome archivés
  getAllTypeDiplomeArchives(): Observable<TypeDiplome[]> {
    return this.http.get<TypeDiplome[]>(`${this.apiUrl}/getallTypeDiplomeArchives`, { headers: this.headers });
  }

  // Méthode pour désarchiver un TypeDiplome
  desarchiverTypeDiplome(id: number): Observable<TypeDiplome> {
    return this.http.put<TypeDiplome>(`${this.apiUrl}/desarchiver/${id}`, {}, { headers: this.headers });
  }


}

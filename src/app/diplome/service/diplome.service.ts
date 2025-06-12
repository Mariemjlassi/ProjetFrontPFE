import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { Diplome } from '../model/diplome';
import { DiplomeRequest } from '../model/diplome-request';
import { AuthService } from '../../auth/service/auth.service';
import { TypeDiplome } from '../model/type-diplome';

@Injectable({
  providedIn: 'root'
})
export class DiplomeService {
  private apiUrl = 'http://localhost:9090/diplomes';
  private typeDiplomeUrl = 'http://localhost:9090/typediplomes';
  headers : any;
  constructor(private http: HttpClient, private authservice: AuthService) {
    this.headers = this.authservice.createAuthorizationHeader();
  }
  
  getDiplomesByEmploye(employeId: number): Observable<Diplome[]> {
    return this.http.get<Diplome[]>(`${this.apiUrl}/employe/${employeId}`, { headers: this.headers });
  }

  addDiplomeEmploye(employeId: number, libelle: string, typeDiplomeId: number, dateObtention: Date): Observable<Diplome> {
    return this.http.post<Diplome>(`${this.apiUrl}/add`, { employeId, libelle, typeDiplomeId, dateObtention }, { headers: this.headers });
  }  

  updateDiplomeEmploye(diplomeId: number, employeId: number, libelle: string, typeDiplomeId: number, dateObtention: Date): Observable<Diplome> {
    return this.http.put<Diplome>(`${this.apiUrl}/update/${diplomeId}`, { employeId, libelle, typeDiplomeId, dateObtention }, { headers: this.headers });
  }
  

  deleteDiplomeEmploye(diplomeId: number, employeId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${diplomeId}/${employeId}`, { headers: this.headers });
  }

  deleteDiplome(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.headers }).pipe(
        catchError(error => {
            let errorMessage = "Une erreur est survenue lors de la suppression";
            if (error.error) {
                errorMessage = error.error;
            }
            throw new Error(errorMessage);
        })
    );
}
  

  getTypeDiplomes(): Observable<TypeDiplome[]> {
    return this.http.get<TypeDiplome[]>(`${this.typeDiplomeUrl}`, { headers: this.headers });
  }
  getAllDiplomes(): Observable<Diplome[]> {
    return this.http.get<Diplome[]>(`${this.apiUrl}/all`, { headers: this.headers });
  }

  // Modifier la méthode addDiplome pour envoyer un DiplomeRequest


  getDiplomeById(id: number): Observable<Diplome> {
    return this.http.get<Diplome>(`${this.apiUrl}/${id}`, { headers: this.headers });
  }

  // Modifiez ces méthodes dans votre service
addDiplome(idType: number, libelleTypeDiplome: string, libelle: string): Observable<Diplome> {
  const request: DiplomeRequest = {
    idType: idType,
    libelleTypeDiplome: libelleTypeDiplome,
    libelle: libelle
  };
  return this.http.post<Diplome>(`${this.apiUrl}/${idType}`, request, { headers: this.headers });
}

updateDiplome(id: number, diplomeRequest: DiplomeRequest): Observable<Diplome> {
  return this.http.put<Diplome>(`${this.apiUrl}/${id}`, diplomeRequest, { headers: this.headers });
}

  assignDiplomeToEmploye(employeId: number, diplomeId: number, dateObtention: Date): Observable<Diplome> {
    // Corriger le décalage de fuseau horaire
    const dateStr = this.formatDateForBackend(dateObtention);
    
    return this.http.post<Diplome>(
        `${this.apiUrl}/assign/${employeId}/${diplomeId}?dateObtention=${dateStr}`,
        null,
        { headers: this.headers }
    );
}

updateDiplomeAssignment(diplomeId: number, employeId: number, newDiplomeId: number, dateObtention: Date): Observable<Diplome> {
    // Corriger le décalage de fuseau horaire
    const dateStr = this.formatDateForBackend(dateObtention);
    
    return this.http.put<Diplome>(
        `${this.apiUrl}/update-assignment/${diplomeId}/${employeId}/${newDiplomeId}?dateObtention=${dateStr}`,
        null,
        { headers: this.headers }
    );
}

private formatDateForBackend(date: Date): string {
    // Créer une date locale sans l'information de fuseau horaire
    const localDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
    return localDate.toISOString().split('T')[0];
}

  

  
}

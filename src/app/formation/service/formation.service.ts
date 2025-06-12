import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { FormationDto } from '../model/FormationDto.model';
import { PosteAvecDatesDTO } from '../../employe/model/PosteAvecDatesDTO';
import { FormationDto_Resultat } from '../model/FormationDto_Resultat';
import { ApiResponse } from '../model/ApiResponse';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private apiUrl = 'http://localhost:9090/formations';
  private apiUrll = 'http://localhost:9090/api/employes';
  headers : any;
      constructor(private http: HttpClient, private authservice: AuthService) {
        this.headers = this.authservice.createAuthorizationHeader();
      }

 // Modifier le type de retour pour Observable<number>
 creerFormation(formData: FormData): Observable<number> {
  return this.http.post<number>(`${this.apiUrl}`, formData, {headers : this.headers});
}
  getFormationsParRH(rhId: number): Observable<FormationDto[]> {
    return this.http.get<FormationDto[]>(`${this.apiUrl}/${rhId}`, {headers : this.headers});
  }

  getFormationsParResponsable(responsableId: number): Observable<FormationDto[]> {
    return this.http.get<FormationDto[]>(`${this.apiUrl}/responsable/${responsableId}`, {headers : this.headers});
  }
  modifierDocumentEmployeFormation(formationId: number, employeId: number, fichierPdf: File): Observable<string> {
    const formData = new FormData();
    formData.append('fichierPdf', fichierPdf);
  
    const url = `${this.apiUrl}/${formationId}/employes/${employeId}/document`;
  
    return this.http.put(url, formData, { responseType: 'text', headers : this.headers});
  }

  validerFormation(formationId: number): Observable<{ success: boolean, message: string }> {
    const url = `${this.apiUrl}/${formationId}/valider`;
    return this.http.put(url, {}, { 
      responseType: 'text',
      headers: this.headers 
    }).pipe(
      map((response: string) => ({
        success: true,
        message: response
      })),
      catchError(this.handleError)
    );
  }

  modifierFormation(id: number, formData: FormData): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}`, formData, {
      responseType: 'text',
      headers: this.headers
    });
  }
  
  
  

  // Gestion des erreurs HTTP
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur inattendue s\'est produite.';
    if (error.status === 404) {
      errorMessage = error.error || 'Formation non trouvée.';
    } else if (error.status === 400) {
      errorMessage = error.error || 'Requête invalide.';
    } else if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur : ${error.status}\nMessage : ${error.error}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

 ajouterResultatFormation(
  formationId: number,
  employeId: number,
  resultat: string,
  habilite: boolean // <-- nouveau paramètre
): Observable<string> {
  const url = `${this.apiUrl}/${formationId}/employes/${employeId}/resultat`;

  const params = new HttpParams()
    .set('resultat', resultat)
    .set('habilite', habilite ? 'true' : 'false'); // <-- conversion explicite en string

  return this.http.put(url, null, {
    params,
    responseType: 'text',
    headers: this.headers
  }).pipe(
    catchError(this.handleError)
  );
}

  getResultatFormation(formationId: number, employeId: number): Observable<{ resultat: string, res: boolean }> {
    const url = `${this.apiUrl}/${formationId}/employes/${employeId}/resultat`;
    return this.http.get<{ resultat: string, res: boolean }>(url, { headers: this.headers }).pipe(
      catchError((error) => of({ resultat: 'Aucun résultat disponible', res: false }))
    );
  }

  changerPosteEmploye(
    employeId: number,
    nouveauPosteId: number,
    directionId: number,
    siteId: number
  ): Observable<PosteAvecDatesDTO> {
    const params = new HttpParams()
      .set('employeId', employeId.toString())
      .set('nouveauPosteId', nouveauPosteId.toString())
      .set('directionId', directionId.toString())
      .set('siteId', siteId.toString());

    return this.http.post<PosteAvecDatesDTO>(
      `${this.apiUrll}/changer-poste`,
      null,
      { params, headers: this.headers }
    ).pipe(
      catchError(error => throwError(error))
    );
  }


creerFormationAvecResultat(formationDto: FormationDto_Resultat, rhId: number): Observable<FormationDto> {
    const url = `${this.apiUrl}/${rhId}/creerAvecResultat`;
    return this.http.post<FormationDto>(url, formationDto, { headers: this.headers }).pipe(
      catchError(this.handleError)
    );
  }
// Dans votre FormationService

modifierFormationAvecResultat(
    formationDto: FormationDto_Resultat,
    rhId: number,
    formationId: number
  ): Observable<FormationDto> {
    const url = `${this.apiUrl}/${rhId}/modifierAvecResultat/${formationId}`;
    return this.http.put<FormationDto>(url, formationDto, { headers: this.headers }).pipe(
      catchError(this.handleError)
    );
  }

  getFormationsWithDetailsByEmploye(employeId: number): Observable<ApiResponse[]> {
    return this.http.get<ApiResponse[]>(`${this.apiUrl}/employe/${employeId}/details`, { headers: this.headers }).pipe(
      catchError(this.handleError)
    );
  }


ajouterDateRappel(formationId: number, dateRappel: string): Observable<string> {
    const url = `${this.apiUrl}/formations/${formationId}/date-rappel`;
    return this.http.post(url, `"${dateRappel}"`, { 
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.headers.get('Authorization')
      }),
      responseType: 'text'
    }).pipe(
      catchError(this.handleError)
    );
  }
modifierDateRappel(formationId: number, dateRappel: string): Observable<string> {
    if (!formationId) {
      return throwError(() => new Error('ID de formation requis'));
    }

    if (!dateRappel || !/^\d{4}-\d{2}-\d{2}$/.test(dateRappel)) {
      return throwError(() => new Error('Format de date invalide. Utilisez YYYY-MM-DD'));
    }

    const url = `${this.apiUrl}/formations/${formationId}/date-rappel`;
    const body = JSON.stringify(dateRappel);

    return this.http.put(url, body, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.headers.get('Authorization')
      }),
      responseType: 'text'
    }).pipe(
      catchError(this.handleErrorr)
    );
  }

  getDateRappel(formationId: number): Observable<string | null> {
    if (!formationId || isNaN(formationId)) {
      return throwError(() => new Error('ID de formation invalide'));
    }

    const url = `${this.apiUrl}/formations/${formationId}/date-rappel`;
    
    return this.http.get(url, {
      responseType: 'text',
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Authorization': this.headers.get('Authorization')
      })
    }).pipe(
      map(response => {
        const date = response.replace(/^"|"$/g, '');
        return this.validateDate(date) ? date : null;
      }),
      catchError(this.handleErrorr)
    );
  }
private handleErrorr(error: HttpErrorResponse) {
  let errorMessage = 'Erreur inconnue';
  if (error.error instanceof ErrorEvent) {
    // Erreur côté client
    errorMessage = `Erreur: ${error.error.message}`;
  } else {
    // Erreur côté serveur
    errorMessage = `Code: ${error.status}\nMessage: ${error.message}`;
    if (error.error) {
      try {
        const errorObj = JSON.parse(error.error);
        errorMessage += `\nDétails: ${errorObj.message || error.error}`;
      } catch (e) {
        errorMessage += `\nDétails: ${error.error}`;
      }
    }
  }
  console.error(errorMessage);
  return throwError(() => new Error(errorMessage));
}


private validateDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

signalerProbleme(formationId: number, commentaire: string): Observable<any> {
    const url = `${this.apiUrl}/${formationId}/probleme`;
    const body = JSON.stringify(commentaire);

    return this.http.put(url, body, {
      headers: this.headers,
      responseType: 'json'
    }).pipe(
      catchError(this.handleError)
    );
  }








annulerFormation(id: number): Observable<FormationDto> {
  return this.http.put<FormationDto>(
    `${this.apiUrl}/${id}/annuler`, 
    {} , {headers : this.headers} // body vide
  );
}

/** Réactive la formation (met annuler = false + supprime dateAnnulation) */
reactiverFormation(id: number): Observable<FormationDto> {
  return this.http.put<FormationDto>(
    `${this.apiUrl}/${id}/reactiver`,
    {}, {headers : this.headers}
  );
}




}

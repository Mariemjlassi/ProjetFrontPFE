import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Employe } from '../model/employe';
import { catchError, Observable, throwError } from 'rxjs';
import { EmployeExistant } from '../model/EmployeExistant';
import { Site } from '../../site/model/site';
import { Discipline } from '../model/Discipline';
import { ExperienceAssad } from '../model/ExperienceAssad';
import { ExperienceAnterieure } from '../model/ExperienceAnterieure';
import { Poste } from '../model/Poste';
import { EmployePoste } from '../model/EmployePoste';
import { PosteAvecDatesDTO } from '../model/PosteAvecDatesDTO';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class EmoloyeService {
  private apiUrl = 'http://localhost:9090/api/employes';

  private apiUrl2 = 'http://localhost:9090/api/sites';
  headers: any;
  
  constructor(private http: HttpClient, private authservice: AuthService) {
    this.headers = this.authservice.createAuthorizationHeader();
  }

  addEmploye(employe: Employe): Observable<Employe> {
    return this.http.post<Employe>(this.apiUrl, employe, { headers: this.headers });
  }
 getNomDirectionPosteActuel(employeId: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/${employeId}/poste-actuel/direction`,
       { responseType: 'text', headers: this.headers });
  }
  getAllEmployes(): Observable<EmployeExistant[]> {
    return this.http.get<EmployeExistant[]>(
      `${this.apiUrl}/employes-without-poste`,{ headers: this.headers }
    );
  }
  getAllSites(): Observable<Site[]> {
    return this.http.get<Site[]>(this.apiUrl2,{ headers: this.headers });
  }

  ajouterEmploye(
    employe: Employe,
    posteId: number,
    dateDebut: string,
    dateFin: string
  ): Observable<Employe> {
    return this.http.post<Employe>(
      `${this.apiUrl}/ajouterAvecPoste?posteId=${posteId}&dateDebut=${dateDebut}&dateFin=${dateFin}`,
      employe,
      { headers: this.headers }
    );
  }

  getEmployesWithDirectionAndSite(): Observable<any> {
    return this.http.get<any>(this.apiUrl,{ headers: this.headers });
  }
  getDisciplines(employeId: number): Observable<Discipline[]> {
    return this.http.get<Discipline[]>(
      `${this.apiUrl}/${employeId}/disciplines`,{ headers: this.headers }
    );
  }

  getExperiencesAssad(employeId: number): Observable<ExperienceAssad[]> {
    return this.http.get<ExperienceAssad[]>(
      `${this.apiUrl}/employes/${employeId}/experiences/assad`,{ headers: this.headers }
    );
  }

  // Appel pour obtenir les expériences antérieures d'un employé
  getExperiencesAnterieures(
    employeId: number
  ): Observable<ExperienceAnterieure[]> {
    return this.http.get<ExperienceAnterieure[]>(
      `${this.apiUrl}/employes/${employeId}/experiences/anterieures`,{ headers: this.headers }
    );
  }
  getPostesByEmploye(employeId: number): Observable<PosteAvecDatesDTO[]> {
    return this.http.get<PosteAvecDatesDTO[]>(
      `${this.apiUrl}/postes/${employeId}`,{ headers: this.headers }
    );
  }
  ajouterPosteAEmploye(
    employeId: number,
    posteId: number,
    directionId: number,
    siteId: number,
    dateDebut: string,
    dateFin: string
  ): Observable<PosteAvecDatesDTO> {
    console.log('employeId:', employeId);
    console.log('posteId:', posteId);
    console.log('directionId:', directionId);
    console.log('siteId:', siteId);
    console.log('dateDebut:', dateDebut);
    console.log('dateFin:', dateFin);

    const url = `${this.apiUrl}/ajouterAvecPoste`;
    const params = new HttpParams()
      .set('employeId', employeId.toString())
      .set('posteId', posteId.toString())
      .set('directionId', directionId.toString())
      .set('siteId', siteId.toString())
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);

    return this.http.post<PosteAvecDatesDTO>(url, null, { params, headers : this.headers });
  }

  getPosteDetails(
    employeId: number,
    posteId: number
  ): Observable<EmployePoste> {
    const params = new HttpParams()
      .set('employeId', employeId.toString())
      .set('posteId', posteId.toString());

    return this.http.get<EmployePoste>(`${this.apiUrl}/details`, { 
      params: params,
      headers: this.headers 
    });
  }

  getPosteDetailsById(employePosteId: number): Observable<EmployePoste> {
    return this.http.get<EmployePoste>(
      `${this.apiUrl}/details/${employePosteId}`,
      { headers: this.headers }
    );
  }

  supprimerPostePourEmploye(
    employeId: number,
    posteId: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('employeId', employeId.toString())
      .set('posteId', posteId.toString());

    return this.http.delete(`${this.apiUrl}/delete`, { 
      params, 
      headers: this.headers 
    });
  }
  ajouterEmployeAvecPoste(
    posteId: number,
    directionId: number,
    siteId: number,
    employe: any,
    dateDebut: string,
    dateFin: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('posteId', posteId.toString())
      .set('directionId', directionId.toString())
      .set('siteId', siteId.toString())
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);

    return this.http.post<any>(`${this.apiUrl}/ajouter`, employe, {
      params: params,
      headers: this.headers
    });
  }

  modifierEmploye(
    id: number,
    posteId: number | null,
    directionId: number | null,
    siteId: number | null,
    employe: Employe,
    dateDebut: string | null,
    dateFin: string | null
  ): Observable<Employe> {
    let params = new HttpParams();
    if (posteId !== null && posteId !== undefined) {
      params = params.set('posteId', posteId.toString());
    }
    if (directionId !== null && directionId !== undefined) {
      params = params.set('directionId', directionId.toString());
    }
    if (siteId !== null && siteId !== undefined) {
      params = params.set('siteId', siteId.toString());
    }
    if (dateDebut !== null && dateDebut !== undefined) {
      params = params.set('dateDebut', dateDebut);
    }
    if (dateFin !== null && dateFin !== undefined) {
      params = params.set('dateFin', dateFin);
    }

    return this.http.put<Employe>(`${this.apiUrl}/${id}`, employe, { 
      params, 
      headers: this.headers 
    });
  }

  modifierPosteAEmployeParId(
    employePosteId: number,
    posteId: number | null,
    directionId: number,
    siteId: number,
    dateDebut: string,
    dateFin: string | null
  ): Observable<PosteAvecDatesDTO> {
    const url = `${this.apiUrl}/poste/${employePosteId}`;
    let params = new HttpParams()
      .set('directionId', directionId.toString())
      .set('siteId', siteId.toString())
      .set('dateDebut', dateDebut);

    if (posteId) {
      params = params.set('posteId', posteId.toString());
    }
    if (dateFin) {
      params = params.set('dateFin', dateFin);
    }

    return this.http.put<PosteAvecDatesDTO>(url, null, { 
      params,
      headers: this.headers
    });
  }

   modifierPosteComplet(
    employePosteId: number,
    posteId: number | undefined,
    directionId: number,
    siteId: number,
    dateDebut: string,
    dateFin: string | null
  ): Observable<PosteAvecDatesDTO> {
    const url = `${this.apiUrl}/poste/${employePosteId}`;
    let params = new HttpParams()
      .set('directionId', directionId.toString())
      .set('siteId', siteId.toString())
      .set('dateDebut', dateDebut);

    if (posteId) {
      params = params.set('posteId', posteId.toString());
    }
    if (dateFin) {
      params = params.set('dateFin', dateFin);
    }

    return this.http.put<PosteAvecDatesDTO>(url, null, { 
      params,
      headers: this.headers
    });
  }
  private formatDateToISO(date: Date): string {
      if (!date) return '';
      return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  }
  private isValidDate(dateString: string): boolean {
      return !isNaN(Date.parse(dateString));
  }
  

  getDocumentByEmployeIdAndFormationId(
    employeId: number,
    formationId: number
  ): Observable<Blob> {
    const url = `${this.apiUrl}/document?employeId=${employeId}&formationId=${formationId}`;
    return this.http.get(url, { 
      responseType: 'blob',
      headers: this.headers 
    });
  }
  supprimerPosteParId(employePosteId: number): Observable<any> {
    const url = `${this.apiUrl}/poste/${employePosteId}`;
    return this.http.delete(url, { headers: this.headers });
  }
}
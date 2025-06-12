import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Direction } from '../model/Direction';
import { DirectionDTO } from '../model/DirectionDTO';
import { Site } from '../../site/model/site';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DirectionService {
  private apiUrl = 'http://localhost:9090/api/directions'; 
  headers : any;
    constructor(private http: HttpClient, private authservice: AuthService) {
      this.headers = this.authservice.createAuthorizationHeader();
    }


  addDirection(directionDTO: DirectionDTO): Observable<any> {
    return this.http.post<any>(this.apiUrl, directionDTO, { headers: this.headers });
  }

   getAllDirections(): Observable<Direction[]> {
      return this.http.get<Direction[]>(this.apiUrl, { headers: this.headers });
    }


    getAllDirectionsArchivés(): Observable<Direction[]> {
      return this.http.get<Direction[]>(`${this.apiUrl}/liste-directions-archivés`, { headers: this.headers });
    }


    desarchiverDirection(id: number): Observable<Direction> {
      const requestBody = { id: id };
      return this.http.put<Direction>(`${this.apiUrl}/desarchiver`, requestBody, { headers: this.headers });
    }
  
    
    archiverDirection(id: number): Observable<Direction> {
      // Préparez le corps de la requête avec un objet contenant l'ID
      const requestBody = { id: id };
  
      // Faites une requête PUT à l'API pour archiver la direction
      return this.http.put<Direction>(`${this.apiUrl}/archiver`, requestBody, { headers: this.headers });
    }
  

    updateDirection(directionDTO: DirectionDTO): Observable<Direction> {
      return this.http.put<Direction>(this.apiUrl, directionDTO, { headers: this.headers });  // Envoie de la requête PUT avec DirectionDTO dans le corps
    }



    getSitesByDirection(directionId: number): Observable<Site[]> {
      return this.http.get<Site[]>(`${this.apiUrl}/${directionId}/sites`, { headers: this.headers })
        .pipe(
          map((response: any) => {
            // Convertir Set en Array si nécessaire
            return Array.isArray(response) ? response : Array.from(response);
          })
        );
    }

}
import { Injectable } from '@angular/core';


import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  private apiUrl = 'http://localhost:9090/api/pdf/checkWords'; 

  headers : any;
          constructor(private http: HttpClient, private authservice: AuthService) {
            this.headers = this.authservice.createAuthorizationHeader();
          }

  checkWords(file: File, word1: string, word2: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('word1', word1);
    formData.append('word2', word2);

    return this.http.post<any>(this.apiUrl, formData, {headers : this.headers});
  }
}

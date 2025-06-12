  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';
  import { Message } from '../model/message';
  import { MessageDto } from '../model/message-dto';
import { AuthService } from '../../auth/service/auth.service';

  @Injectable({ providedIn: 'root' })
  export class MessageService {
    private baseUrl = 'http://localhost:9090/messages';

    headers: any; // Propriété ajoutée

  constructor(private http: HttpClient, private authservice: AuthService) { 
    this.headers = this.authservice.createAuthorizationHeader(); // Initialisation des headers
  }

    envoyer(message: Message): Observable<Message> {
    console.log("Données envoyées : ", message);
    return this.http.post<Message>(`${this.baseUrl}/envoyer`, message, { headers: this.headers });
  }

  getRecus(userId: number): Observable<MessageDto[]> {
    return this.http.get<MessageDto[]>(`${this.baseUrl}/recus/${userId}`, { headers: this.headers });
  }

  getEnvoyes(userId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/envoyes/${userId}`, { headers: this.headers });
  }

  marquerCommeLu(messageId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/lu/${messageId}`, {}, { headers: this.headers });
  }

  getFilDiscussion(messageId: number): Observable<MessageDto[]> {
    return this.http.get<MessageDto[]>(`${this.baseUrl}/thread/${messageId}`, { headers: this.headers });
  }

  repondreMessage(messageDto: Message): Observable<any> {
    return this.http.post(`${this.baseUrl}/repondre`, messageDto, { headers: this.headers });
  }
    
  }

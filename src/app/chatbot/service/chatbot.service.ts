import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
export interface RasaResponse {
  recipient_id: string;
  text?: string;
}
@Injectable({
  providedIn: 'root'
})

export class ChatbotService {
 private rasaUrl = 'http://localhost:5005/webhooks/rest/webhook'; // Change si besoin

  constructor(private http: HttpClient) {}

  sendMessage(message: string, sender: string = 'user'): Observable<any> {
    return this.http.post(this.rasaUrl, {
      sender,
      message
    });
  }
saveMessageToBackend(sender: string, message: string, sessionId: string): void {
  this.http.post('http://localhost:9090/api/chat/save', {
    sender,
    message,
    sessionId
  }).subscribe();
}
getAllConversations(): Observable<string[]> {
  return this.http.get<string[]>('http://localhost:9090/api/chat/conversations');
}

getConversation(sessionId: string): Observable<any[]> {
  return this.http.get<any[]>(`http://localhost:9090/api/chat/conversations/${sessionId}`);
}

deleteConversation(sessionId: string): Observable<void> {
  return this.http.delete<void>(`http://localhost:9090/api/chat/conversations/${sessionId}`);
}











}

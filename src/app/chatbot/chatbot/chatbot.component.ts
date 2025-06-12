import { Component } from '@angular/core';
import { ChatbotService } from '../service/chatbot.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
 imports: [
    CommonModule, // pour *ngFor, ngClass, date pipe
    FormsModule   // pour ngModel
  ]
})
export class ChatbotComponent {
 messages: { from: 'user' | 'bot', text: string, time: Date }[] = [];
  userInput: string = '';
  sessionId: string;
  filteredConversations: any[] = [];
searchTerm: string = '';
activeSessionId: string = '';
conversations: { sessionId: string, title: string }[] = [];

  constructor(private chatService: ChatbotService) {
    this.sessionId = this.generateSessionId();
    this.addBotMessage("Bonjour ! Je peux vérifier les qualifications des employés et leur éligibilité aux postes. Comment puis-je vous aider aujourd’hui ?");
    this.loadConversations();

  }

  generateSessionId(): string {
    return crypto.randomUUID(); 
  }

  send(): void {
    const userMessage = this.userInput.trim();
    if (!userMessage) return;

    this.addUserMessage(userMessage);
    this.chatService.saveMessageToBackend('user', userMessage, this.sessionId);

    this.chatService.sendMessage(userMessage).subscribe(responses => {
      responses.forEach((response: any) => {
        const botText = response.text || '[Pas de réponse]';
        this.addBotMessage(botText);
        this.chatService.saveMessageToBackend('bot', botText, this.sessionId);
      });
    });

    this.userInput = '';
  }

  useExample(example: string): void {
    this.userInput = example;
    
  }

  private addUserMessage(text: string): void {
    this.messages.push({ from: 'user', text, time: new Date() });
  }

  private addBotMessage(text: string): void {
    this.messages.push({ from: 'bot', text, time: new Date() });
  }

loadConversations(): void {
  this.chatService.getAllConversations().subscribe((sessionIds: string[]) => {
    // Réinitialise la liste
    this.conversations = [];

    sessionIds.forEach(sessionId => {
      this.chatService.getConversation(sessionId).subscribe(messages => {
        let title = 'Nouvelle conversation';

        if (messages.length > 0) {
          const firstMessage = messages[0];
          const date = new Date(firstMessage.timestamp);
          const formattedDate = date.toLocaleDateString();
          const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          title = `${firstMessage.message.slice(0, 30)}... - ${formattedDate} ${time}`;
        }

        this.conversations.push({ sessionId, title });
      });
    });
  });
}


  loadConversation(sessionId: string): void {
    this.chatService.getConversation(sessionId).subscribe(data => {
      this.sessionId = sessionId;
      this.messages = data.map(msg => ({
        from: msg.sender === 'user' ? 'user' : 'bot',
        text: msg.message,
        time: new Date(msg.timestamp)
      }));
    });
  }

  deleteConversation(sessionId: string): void {
    this.chatService.deleteConversation(sessionId).subscribe(() => {
      this.loadConversations();
      if (this.sessionId === sessionId) this.messages = [];
    });
  }









}
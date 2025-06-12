import { Component, OnInit } from '@angular/core';
import { MessageDto } from '../model/message-dto';
import { MessageService } from '../service/message.service';
import { AuthService } from '../../auth/service/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-messages',
  standalone:true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit {
  messagesRecus: MessageDto[] = [];
  filteredMessages: MessageDto[] = [];
  userId!: number;
  activeCategory: 'recus' | 'envoyes' = 'recus';
  searchTerm: string = '';
  showFilters: boolean = false;
  filterUnread: boolean = false;
  filterImportant: boolean = false;
  unreadCount: number = 0;
  private searchSubject = new Subject<string>();

  constructor(
    private messageService: MessageService,
    private authService: AuthService 
  ) {}

  ngOnInit() {
    const id = this.authService.getUserId();
    if (id !== null) {
      this.userId = id;
      this.loadMessages();
      
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.applyFilters();
      });
    }
  }
  
  changerCategorie(categorie: 'recus' | 'envoyes') {
    this.activeCategory = categorie;
    this.loadMessages();
  }
  
  refreshMessages() {
    this.loadMessages();
  }

  

  applyFilters() {
    let filtered = [...this.messagesRecus];
    
    // Filtre de recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(msg => 
        (msg.sujet && msg.sujet.toLowerCase().includes(term)) ||
        (msg.contenu && msg.contenu.toLowerCase().includes(term)) ||
        (msg.expediteur?.nom && msg.expediteur.nom.toLowerCase().includes(term)) ||
        (msg.expediteur?.prenom && msg.expediteur.prenom.toLowerCase().includes(term))
      );
    }
    
    // Filtre non lus
    if (this.filterUnread) {
      filtered = filtered.filter(msg => !msg.lu);
    }
    
    // Filtre importants
    
    this.filteredMessages = filtered;
  }

  toggleStar(event: Event, messageId: number) {
    event.stopPropagation();
    const message = this.messagesRecus.find(m => m.id === messageId);
    if (message) {
      
      this.applyFilters();
    }
  }

  

  trackByMessageId(index: number, message: MessageDto): number {
    return message.id!;
  }

messagesEnvoyes: MessageDto[] = [];

getDisplayedUserName(msg: MessageDto): string {
  if (this.activeCategory === 'recus') {
    return `${msg.expediteur?.nom || ''} ${msg.expediteur?.prenom || ''}`;
  } else {
    return `${msg.destinataire?.nom || ''} ${msg.destinataire?.prenom || ''}`;
  }
}

getDisplayedUserId(msg: MessageDto): number {
  if (this.activeCategory === 'recus') {
    return msg.expediteur?.id || 0;
  } else {
    return msg.destinataire?.id || 0;
  }
}

getInitialsFromMessage(msg: MessageDto): string {
  const nom = this.activeCategory === 'recus' ? msg.expediteur?.nom : msg.destinataire?.nom;
  const prenom = this.activeCategory === 'recus' ? msg.expediteur?.prenom : msg.destinataire?.prenom;
  return this.getInitials(nom, prenom);
}

getCategoryTitle(): string {
  switch (this.activeCategory) {
    case 'recus':
      return 'Messages reçus';
    case 'envoyes':
      return 'Messages envoyés';
    default:
      return 'Messages';
  }
}



loadMessages() {
  if (this.activeCategory === 'recus') {
    this.messageService.getRecus(this.userId).subscribe(res => {
      this.messagesRecus = res.sort((a, b) => new Date(b.dateEnvoi).getTime() - new Date(a.dateEnvoi).getTime());
      this.filteredMessages = [...this.messagesRecus];
      this.calculateUnreadCount(); // utile pour afficher le badge des non lus
    });
  } else if (this.activeCategory === 'envoyes') {
    this.messageService.getEnvoyes(this.userId).subscribe(res => {
      this.messagesRecus = (res as unknown as MessageDto[])
        .sort((a, b) => new Date(b.dateEnvoi).getTime() - new Date(a.dateEnvoi).getTime());
      this.filteredMessages = [...this.messagesRecus];
    });
  }
}
calculateUnreadCount() {
  this.unreadCount = this.messagesRecus.filter(m => !m.lu).length;
}


getInitials(nom: string, prenom: string): string {
  return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
}

getAvatarClass(userId: number): string {
  // S'assurer que l'ID est un nombre valide
  const id = userId || 0; // Valeur par défaut si userId est null/undefined
  return `avatar-${Math.abs(id) % 6}`;
}

  onSearch() {
    this.searchSubject.next(this.searchTerm.trim().toLowerCase());
  }

  filterMessages(searchTerm: string) {
    if (!searchTerm) {
      this.filteredMessages = [...this.messagesRecus];
      return;
    }
  
    this.filteredMessages = this.messagesRecus.filter(msg => {
      // Convertir la date en string pour la recherche
      const dateStr = msg.dateEnvoi ? new Date(msg.dateEnvoi).toLocaleDateString() : '';
      
      // Vérifier tous les champs pertinents
      return (
        (msg.sujet && msg.sujet.toLowerCase().includes(searchTerm)) ||
        (msg.contenu && msg.contenu.toLowerCase().includes(searchTerm)) ||
        (msg.expediteur?.nom && msg.expediteur.nom.toLowerCase().includes(searchTerm)) ||
        (msg.expediteur?.prenom && msg.expediteur.prenom.toLowerCase().includes(searchTerm)) ||
        dateStr.includes(searchTerm)
      );
    });
  }

  groupMessagesByDate(messages: MessageDto[]): { label: string, messages: MessageDto[] }[] {
    const grouped: { [key: string]: MessageDto[] } = {};
  
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
  
    for (let msg of messages) {
      const date = new Date(msg.dateEnvoi);
      let label: string;
  
      if (this.isSameDate(date, today)) {
        label = 'Aujourd’hui';
      } else if (this.isSameDate(date, yesterday)) {
        label = 'Hier';
      } else if (this.isSameWeek(date, today)) {
        label = this.getWeekdayLabel(date); // Lundi, Mardi...
      } else {
        label = formatDate(date, 'dd MMMM yyyy', 'en-US');

      }
  
      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(msg);
    }
  
    // Retourne une liste triée par date décroissante
    return Object.entries(grouped)
      .map(([label, messages]) => ({ label, messages }))
      .sort((a, b) => {
        const dateA = new Date(a.messages[0].dateEnvoi);
        const dateB = new Date(b.messages[0].dateEnvoi);
        return dateB.getTime() - dateA.getTime();
      });
  }
  
  isSameDate(d1: Date, d2: Date): boolean {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  }
  
  isSameWeek(date1: Date, date2: Date): boolean {
    const onejan = new Date(date1.getFullYear(), 0, 1);
    const week1 = Math.floor((((date1.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    const week2 = Math.floor((((date2.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    return week1 === week2 && date1.getFullYear() === date2.getFullYear();
  }
  
  getWeekdayLabel(date: Date): string {
    return formatDate(date, 'EEEE', 'en-US');
    // Lundi, Mardi, ...
  }

  // Ajoutez cette méthode à votre composant
isToday(dateString: string): boolean {
  const today = new Date();
  const date = new Date(dateString);
  return date.getDate() === today.getDate() && 
         date.getMonth() === today.getMonth() && 
         date.getFullYear() === today.getFullYear();
}

getAvatarColor(userIdOrName:any) {
  let hash = 0;
  for (let i = 0; i < userIdOrName.length; i++) {
    hash = userIdOrName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const h = Math.abs(hash) % 360; // Teinte entre 0-359
  return `hsl(${h}, 70%, 45%)`; // Retourne une couleur HSL
}
}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/service/auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule,RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  userRole: string | null = null;
  userId: number | null = null;

  welcomeMessages = {
    RH: 'Gestion des ressources humaines et du développement des compétences',
    ADMIN: 'Administration complète du système RH',
    DIRECTEUR: 'Tableau de bord stratégique et indicateurs clés',
    RESPONSABLE: 'Gestion de votre équipe et suivi des formations'
  };

  roleSpecificFeatures = {
    RH: [
      { path: '/list-employe-existants', icon: 'pi pi-users', label: 'Employés' },
      { path: '/formations', icon: 'pi pi-book', label: 'Formations' },
      { path: '/gestion-conges', icon: 'pi pi-calendar', label: 'Congés' },
      { path: '/evaluations', icon: 'pi pi-chart-line', label: 'Évaluations' }
    ],
    ADMIN: [
      { path: '/list-utilisateurs', icon: 'pi pi-cog', label: 'Utilisateurs' },
      { path: '/gestion-permissions', icon: 'pi pi-shield', label: 'Audit' },
      { path: '/messages', icon: 'pi pi-envelope', label: 'Messagerie' }
    ],
    DIRECTEUR: [
      { path: '/dashboard', icon: 'pi pi-chart-bar', label: 'Tableau de bord' },
      { path: '/strategie', icon: 'pi pi-map', label: 'Stratégie RH' },
      { path: '/reporting', icon: 'pi pi-file-pdf', label: 'Reporting' }
    ],
    RESPONSABLE: [
      { path: '/mon-equipe', icon: 'pi pi-users', label: 'Mon équipe' },
      { path: '/planning', icon: 'pi pi-calendar-plus', label: 'Planning' },
      { path: '/suivi-objectifs', icon: 'pi pi-check-circle', label: 'Objectifs' }
    ]
  };

  getWelcomeMessage(): string {
    return this.welcomeMessages[this.userRole as keyof typeof this.welcomeMessages] || 
           'Bienvenue sur votre plateforme RH';
  }

  getRoleSpecificFeatures() {
    return this.roleSpecificFeatures[this.userRole as keyof typeof this.roleSpecificFeatures] || 
           this.quickLinks; // Retourne les liens par défaut si rôle non reconnu
  }

  constructor(
      private authService: AuthService
    ) {}

    ngOnInit(): void {
      this.userRole = this.authService.getUserRole();
      this.userId = Number(localStorage.getItem('userId'));
      
    }

    isRH(): boolean {
     
      return this.userRole === 'RH';
    }
    
  
    isAdmin(): boolean {
      
      return this.userRole === 'ADMIN';
    }
  
    isDirecteur(): boolean {
      return this.userRole === 'DIRECTEUR';
    }
  
    isResponsable(): boolean {
      return this.userRole === 'RESPONSABLE';
    }
  recentUpdates = [
    {
      message: '3 nouvelles formations planifiées pour Juin',
      time: new Date('2023-05-28'),
      type: 'formation',
      icon: 'pi pi-book'
    },
    {
      message: 'Validation des diplômes en attente',
      time: new Date('2023-05-27'),
      type: 'diplome',
      icon: 'pi pi-graduation-cap'
    },
    {
      message: '5 nouveaux messages non lus',
      time: new Date('2023-05-26'),
      type: 'message',
      icon: 'pi pi-envelope'
    }
  ];

  quickLinks = [
    { path: '/list-employe-existants', icon: 'pi pi-users', label: 'Employés' },
    { path: '/formations', icon: 'pi pi-book', label: 'Formations' },
    { path: '/list-Poste', icon: 'pi pi-briefcase', label: 'Postes' },
    { path: '/messages', icon: 'pi pi-envelope', label: 'Messagerie' },
    { path: '/notifications', icon: 'pi pi-bell', label: 'Notifications' },
    { path: '/chart', icon: 'pi pi-chart-bar', label: 'Statistiques' }
  ];
}

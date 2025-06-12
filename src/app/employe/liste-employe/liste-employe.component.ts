import { Component, OnInit , ViewChild, ElementRef } from '@angular/core';
import { EmoloyeService } from '../service/emoloye.service';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';

import { InputTextModule } from 'primeng/inputtext';

import { FormsModule } from '@angular/forms';  // Ajoutez ceci

import { CardModule } from 'primeng/card';  // Import du CardModule
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { formatDate } from '@angular/common';
import { ExperienceAssad } from '../model/ExperienceAssad';
import { ExperienceAnterieure } from '../model/ExperienceAnterieure';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PosteAvecDatesDTO } from '../model/PosteAvecDatesDTO';
import { StageService } from '../service/stage.service';
import { DiplomeService } from '../../diplome/service/diplome.service';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FormationService } from '../../formation/service/formation.service';
@Component({
  selector: 'app-liste-employe',
  imports: [InputTextModule,TableModule,FormsModule, TagModule,CommonModule,CardModule,DialogModule,TooltipModule,BadgeModule,ProgressBarModule , ButtonModule],
  templateUrl: './liste-employe.component.html',
  styleUrl: './liste-employe.component.css'
})
export class ListeEmployeComponent  implements OnInit{
  employes: any[] = [];
  loading: boolean = true;
  selectedEmploye: any;
  displayProfile: boolean = false;
  today: string = new Date().toISOString().split('T')[0];  // Date actuelle au format 'YYYY-MM-DD'
  experiencesAssad: ExperienceAssad[] = [];
  experiencesAnterieures: ExperienceAnterieure[] = [];
  postes: PosteAvecDatesDTO[] = []; 
  stages: any[] = [];
  diplomes: any[] = []; 
  searchTerm: string = '';
  globalFilter: string = '';
  formations: any[] = []; // Ou créez une interface Formation si vous en avez une
  @ViewChild('contentToPrint') contentToPrint!: ElementRef;
  filterEmployes() {
    return this.employes.filter(employe =>
      employe.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      employe.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      employe.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  imprimerProfil() {
    const content = this.contentToPrint.nativeElement;

    html2canvas(content).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('profil_employe.pdf'); // Generated PDF file name
    });
  }
  constructor(private employeService: EmoloyeService, private router: Router,private stageService: StageService,private diplomeService: DiplomeService, private  Formationservice: FormationService) {}

  ngOnInit(): void {
    this.fetchEmployes();
   
  }
  loadFormations(employeId: number): void {
    this.Formationservice.getFormationsWithDetailsByEmploye(employeId).subscribe({
      next: (formations) => {
        // Filtrer pour ne garder que les formations réussies
        this.formations = formations.filter(f => 
          f.formation !== null && 
          f.resultat === 'REUSSI' // Seulement les formations réussies
        );
        
        console.log('Formations réussies:', this.formations);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des formations:', err);
        this.formations = [];
      }
    });
}
  loadDiplomes(employeId: number): void {
    this.diplomeService.getDiplomesByEmploye(employeId).subscribe({
      next: (diplomes) => {
        this.diplomes = diplomes; // Remplir la liste des diplômes
        console.log('Diplômes récupérés:', diplomes);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des diplômes:', err);
      }
    });
  }
  loadStages(employeId: number): void {
    this.stageService.getStagesByEmployeId(employeId).subscribe({
      next: (stages) => {
        this.stages = stages; // Remplir la liste des stages
        console.log('Stages récupérés:', stages);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des stages:', err);
      }
    });
  }

// Méthode pour afficher les postes d'un employé
loadPostesByEmploye(employeId: number): void {
  this.employeService.getPostesByEmploye(employeId).subscribe({
    next: (postes) => {
      this.postes = postes; // Remplir la liste des postes
    },
    error: (err) => {
      console.error('Erreur lors de la récupération des postes:', err);
    }
  });
}
  get progressValue(): number {
    if (this.experienceCount > 8) {
      return 100; // Barre pleine (vert)
    } else if (this.experienceCount <= 8 && this.experienceCount >= 2) {
      return (this.experienceCount / 8) * 100; // Progression entre 0 et 100
    } else if (this.experienceCount === 1) {
      return 10; // Si une seule expérience, barre remplie à 10%
    } else {
      return 0; // Si aucune expérience, pas de progression
    }
  }

  // Déterminer la couleur de la barre
  get progressBarColor(): string {
    if (this.experienceCount > 8) {
      return 'progress-bar-green'; // Utilise une classe CSS personnalisée pour le vert
    } else if (this.experienceCount <= 8 && this.experienceCount >= 2) {
      return 'progress-bar-orange'; // Utilise une classe CSS personnalisée pour l'orange
    } else if (this.experienceCount === 1) {
      return 'progress-bar-red'; // Utilise une classe CSS personnalisée pour le rouge
    } else {
      return 'progress-bar-grey'; // Utilise une classe CSS personnalisée pour le gris
    }
  }
  

  get experienceCount(): number {
    return this.experiencesAssad.length;
  }
  loadExperiencesAssad(): void {
    this.employeService.getExperiencesAssad(this.selectedEmploye?.id).subscribe({
      next: (experiences) => {
        console.log('Expériences Assad:', experiences);  // Debugging
        this.experiencesAssad = experiences;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des expériences Assad:', err);
      }
    });
  }



  // Méthode pour calculer le niveau d'expérience pour les expériences antérieures
  getExperienceLevelAnterieure(experience: ExperienceAnterieure): string {
  const maxExperienceYears = 10; // Supposons que 10 années d'expérience donnent le niveau maximal
  const experienceDuration = this.calculateExperienceDuration(experience.dateDebut, experience.dateFin);
  
  // Logique pour déterminer le niveau d'expérience
  if (experienceDuration > 7) {
    return 'Expert';
  } else if (experienceDuration > 4) {
    return 'Intermédiaire';
  } else {
    return 'Débutant';
  }
}

// Calcul de la durée de l'expérience
calculateExperienceDuration(dateDebut: string, dateFin: string): number {
  const startDate = new Date(dateDebut);
  const endDate = new Date(dateFin);
  const duration = (endDate.getFullYear() - startDate.getFullYear());
  return duration;
}

  
  loadExperiencesAnterieures(): void {
    this.employeService.getExperiencesAnterieures(this.selectedEmploye?.id).subscribe({
      next: (experiences) => {
        console.log('Expériences Antérieures:', experiences);  // Vérifier la structure des données
        this.experiencesAnterieures = experiences;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des expériences antérieures:', err);
      }
    });
  }
  getExperienceLevel(employe: any): number {
    const maxExperiences = 5;  // Définir un maximum d'expériences (par exemple 5)
    const currentExperiences = employe.experiences.length; // Nombre d'expériences de l'employé
    return (currentExperiences / maxExperiences) * 100; // Renvoie un pourcentage de progression
  }
  

 

  onRowSelect(employe: any) {
    this.selectedEmploye = employe;
    this.fetchDisciplines(employe.id);
    this.loadExperiencesAssad();
  this.loadExperiencesAnterieures(); 
  this.loadPostesByEmploye(employe.id);
  this.loadStages(employe.id);
  this.loadDiplomes(employe.id);
  this.loadFormations(employe.id); 
    this.displayProfile = true; // Afficher la fenêtre modale
  }
 // 🟢 Formatage de la date en texte lisible
formatDate(date: Date): string {
  if (!date) return 'N/A';
  return formatDate(date, 'dd MMMM yyyy', 'fr');
}

// 🔥 Déterminer le badge d'ancienneté
getAncienneteBadge(dateRecrutement: Date): string {
  if (!dateRecrutement) return 'N/A';
  const anneeRecrutement = new Date(dateRecrutement).getFullYear();
  const anneeActuelle = new Date().getFullYear();
  const anciennete = anneeActuelle - anneeRecrutement;

  if (anciennete < 2) return 'Nouveau';
  if (anciennete < 5) return 'Expérimenté';
  return 'Senior';
}

// 🎨 Couleur du badge selon l'ancienneté
getAncienneteColor(dateRecrutement: Date): "success" | "info" | "warn" | "danger" | "help" | "primary" | "secondary" | "contrast" {
  if (!dateRecrutement) return "secondary";  // ✅ Assure qu'on retourne bien un type valide
  
  const anciennete = new Date().getFullYear() - new Date(dateRecrutement).getFullYear();

  if (anciennete < 2) return "info";       // ✅ Bleu clair pour "Nouveau"
  if (anciennete < 5) return "warn";       // ✅ Orange pour "Expérimenté"
  return "success";                        // ✅ Vert pour "Senior"
}

goToEditEmployee(employe: any) {
  employe.ajout = employe.ajout !== undefined ? employe.ajout : false;
  localStorage.setItem('employe', JSON.stringify(employe));
  this.router.navigate(['/add-employe']);
}
  fetchEmployes(): void {
    this.employeService.getEmployesWithDirectionAndSite().subscribe(
      (data) => {
        this.employes = data;
        this.loading = false;
        console.log('Employés récupérés:', this.employes);
      },
      (error) => {
        console.error('Erreur lors de la récupération des employés:', error);
        this.loading = false;
      }
    );
  }

  searchText: string = '';
  onGlobalFilter(event: Event, table: any) {
    const input = event.target as HTMLInputElement;
    table.filterGlobal(input.value, 'contains');
  }

  getPhotoUrl(employe: any): string {
    return employe.photo ? employe.photo : (employe.sexe === 'Femme' ? 'i.png' : 'i.png');
  }
  
  fetchDisciplines(employeId: number): void {
    this.employeService.getDisciplines(employeId).subscribe(
      (data) => {
        this.selectedEmploye.disciplines = data; // Ajouter les disciplines à l'employé sélectionné
      },
      (error) => {
        console.error('Erreur lors de la récupération des disciplines:', error);
      }
    );
  }
  
  getSeverity(etat: boolean): "success" | "danger"  | undefined {
    return etat ? "success" : "danger"; // Ajuste en fonction de ton besoin
  }
  
  getStageSeverity(statut: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    switch(statut.toLowerCase()) {
        case 'terminé':
        case 'termine': return 'success';
        case 'annulé':
        case 'annule': return 'danger';
        case 'en cours': return 'warn'; // Note: 'warn' instead of 'warning'
        default: return 'info';
    }
}

}

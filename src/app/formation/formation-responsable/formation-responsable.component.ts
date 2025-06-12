import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, OnInit, Output ,AfterViewInit, SecurityContext } from '@angular/core';
import { FormationService } from '../service/formation.service';
import { FormationDto } from '../model/FormationDto.model';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog'; 
import { EmoloyeService } from '../../employe/service/emoloye.service';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import * as pdfjsLib from 'pdfjs-dist';
import { ChangeDetectorRef } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import PSPDFKit from 'pspdfkit';
import { FullCalendarModule } from '@fullcalendar/angular'; // Importez FullCalendarModule

import dayGridPlugin from '@fullcalendar/daygrid'; // Plugin pour la vue mensuelle
import timeGridPlugin from '@fullcalendar/timegrid'; // Plugin pour la vue hebdomadaire/jour
import interactionPlugin from '@fullcalendar/interaction'; // Plugin pour les interactions
import { CalendarOptions } from '@fullcalendar/core'; // Options du calendrier
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PdfService } from '../service/pdf-service.service';



@Component({
  selector: 'app-formation-responsable',
  imports: [CardModule,
    TagModule,
    TabViewModule,
    TableModule,
    ButtonModule,
    PaginatorModule,
    InputTextModule,
    CommonModule,
    DialogModule,
    ToastModule,
    PdfViewerModule,
    TooltipModule,
    FormsModule ,
    FullCalendarModule




    

  ],
  templateUrl: './formation-responsable.component.html',
  styleUrl: './formation-responsable.component.css',
  providers: [MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FormationResponsableComponent implements OnInit, AfterViewInit{
// Variables existantes...
showSignaturePad: boolean = false;
pspdfkitInstance: any;
formations: FormationDto[] = [];
selectedFormation: any;
displayDialog: boolean = false;
displayPdfDialog: boolean = false;
  pdfUrl: SafeResourceUrl | null = null;
  pdfUrls: { [key: string]: SafeResourceUrl } = {};
  participantsMap: { [key: number]: number } = {}; 
  pdfDialogVisible: boolean = false;
  selectedPdfUrl: SafeUrl | null = null;
  signatureDataUrl: string | null = null;
  signatureImage: string | null = null; // Pour stocker l'image de la signature
  signaturePosition = { x: 0, y: 0 }; // Position de la signature sur le PDF
  pdfBytes: Uint8Array | null = null;
  selectedEmploye: any;
  allEmployeesEvaluated: boolean = false;
  formationsValidees: FormationDto[] = [];
  formationsNonValidees: FormationDto[] = [];
  formationsNoncorrige: FormationDto[] = [];
  showTempMatricule: boolean = false;
  pdfLoading: boolean = false;
  loading: boolean = false; 
tempMatriculePosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor(
    private formationservice : FormationService,
     private Emoloyeservice: EmoloyeService,
     private sanitizer: DomSanitizer,
     private messageService: MessageService,
     private router: Router,
     private cdr: ChangeDetectorRef,
    private pdfService: PdfService){
     }

    
     displayEventDialog: boolean = false;
     selectedEvent: any = null;
     displayCalendarDialog: boolean = false; // Pour afficher/masquer le dialogue du calendrier
     calendarEvents: any[] = []; // Événements du calendrier
     calendarOptions: CalendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: [],
      eventClick: this.handleEventClick.bind(this),
      eventDisplay: 'block', // Assure un bon affichage
      height: 'auto' // Ajuste la hauteur automatiquement
    };
   
     // Méthode pour gérer le clic sur un événement du calendrier
     handleEventClick(info: any): void {
      // Récupérer les détails de la formation cliquée
      const formation = this.formations.find(f => f.titre === info.event.title);
    
      if (formation) {
        // Afficher les détails de la formation dans le dialogue
        this.selectedEvent = {
          title: formation.titre,
          start: formation.dateDebutPrevue,
          end: formation.dateFinPrevue,
          description: formation.description,
          typeFormation: formation.typeFormation,
          sousTypeFormation: formation.sousTypeFormation,
          responsableEvaluation: formation.responsableEvaluation,
          responsableEvaluationExterne: formation.responsableEvaluationExterne,
          valide: formation.valide,
        };
        this.displayEventDialog = true; // Afficher le dialogue
      } else {
        console.error('Formation non trouvée.');
      }
    }
    today: Date = new Date();

openCalendar(formation: any) {
  // Tu peux afficher le calendrier ici en le rendant visible via une logique
  const calendar = document.querySelector(`#calendar-${formation.id}`) as HTMLElement;

  if (calendar) {
    calendar.style.display = 'block';
  }
}

verifierDateRappel(formation: any) {
  if (formation.dateRappel && formation.dateRappel > new Date(formation.dateFinPrevue)) {
    // Réinitialiser ou afficher une alerte
    formation.dateRappel = null;
    alert("La date de rappel doit être avant la date de fin !");
  }
}

   
     // Méthode pour ouvrir le dialogue du calendrier
     openCalendarDialog() {
       this.displayCalendarDialog = true;
       this.loadCalendarEvents();
     }
   
     // Méthode pour charger les événements du calendrier
   // Ajoutez cette méthode pour transformer les dates de manière fiable
private transformToFormationDto(data: any): FormationDto {
  return {
    id: data.id,
    titre: data.titre,
    commentaire: data.commentaire,
    probleme: data.probleme,
    description: data.description,
    typeFormation: data.typeFormation,
    sousTypeFormation: data.sousTypeFormation,
    dateDebutPrevue: this.formatDateForCalendar(data.dateDebutPrevue),
    dateFinPrevue: this.formatDateForCalendar(data.dateFinPrevue),
                                                 
    responsableEvaluationId: data.responsableEvaluationId,
    responsableEvaluationExterne: data.responsableEvaluationExterne,
    employeIds: data.employeIds || [],
    responsableEvaluation: data.responsableEvaluation,
    employes: data.employes,
    fichierPdf: data.fichierPdf,
    organisateurId: data.organisateurId,
    titrePoste: data.titrePoste,
    valide: data.valide,
    annuler: data.annuler
  };
}
calendarState: { [key: number]: boolean } = {};
toggleCalendar(formationId: number) {
  this.calendarState[formationId] = !this.calendarState[formationId];
}

// Vérifie si le calendrier doit être affiché pour cette formation
isCalendarVisible(formationId: number): boolean {
  return !!this.calendarState[formationId];
}
loadExistingRappelDates() {
  this.formations.forEach(formation => {
    this.formationservice.getDateRappel(formation.id!).subscribe({
      next: (date) => {
        if (date) formation.dateRappel = date;
        // Calculer la date par défaut si non définie
        if (!formation.dateRappel) {
          this.setDefaultRappelDate(formation);
        }
      },
      error: (err) => console.error(err)
    });
  });
}
// Fonction pour ajouter/soustraire des jours à une date
addDays(days: number, date?: Date): Date {
  const result = date ? new Date(date) : new Date();
  result.setDate(result.getDate() + days);
  return result;
}
// Dans votre composant
getDefaultRappelDate(dateFinPrevu: Date | null | undefined): Date | null {
  if (!dateFinPrevu) return null;
  const date = new Date(dateFinPrevu);
  date.setDate(date.getDate() - 2);
  return date;
}
// Dans votre template, vous pourriez l'utiliser comme ceci :
// (formation.dateFinPrevu | date: 'dd/MM/yyyy' : addDays(-2))

setDefaultRappelDate(formation: any) {
  if (formation.dateFinPrevu) {
    const dateFin = new Date(formation.dateFinPrevu);
    dateFin.setDate(dateFin.getDate() - 2); // 2 jours avant la fin
    formation.dateRappelDefault = dateFin.toISOString().split('T')[0];
  }
}
loadingDates: { [key: number]: boolean } = {};

onDateSelect(formation: any) {
  if (formation.dateRappel) {
    this.loadingDates[formation.id] = true;
    
    this.formationservice.modifierDateRappel(formation.id, formation.dateRappel)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Date de rappel mise à jour'
          });
          this.loadingDates[formation.id] = false;
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec de la mise à jour'
          });
          this.loadingDates[formation.id] = false;
        }
      });
  }
}

resetToDefault(formation: any) {
  if (formation.dateRappelDefault) {
    formation.dateRappel = formation.dateRappelDefault;
    this.onDateSelect(formation);
  }
}

private formatDateForCalendar(dateInput: any): string {
  if (!dateInput) return new Date().toISOString();
  
  // Si c'est déjà une string ISO valide
  if (typeof dateInput === 'string' && this.isValidISODate(dateInput)) {
    return dateInput;
  }
  
  // Convertir en Date
  const date = this.convertToDate(dateInput);
  return date ? date.toISOString() : new Date().toISOString();
}

private isValidISODate(dateString: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/.test(dateString);
}

private convertToDate(dateInput: any): Date | null {
  if (!dateInput) return null;
  
  // Si c'est déjà une Date valide
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput;
  }
  
  // Si c'est un timestamp
  if (typeof dateInput === 'number') {
    return new Date(dateInput);
  }
  
  // Si c'est une string
  if (typeof dateInput === 'string') {
    // Essayez le parsing direct
    const date = new Date(dateInput);
    if (!isNaN(date.getTime())) return date;
    
    // Format "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      return new Date(dateInput + 'T00:00:00');
    }
    
    // Format "DD/MM/YYYY"
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
      const [d, m, y] = dateInput.split('/');
      return new Date(`${y}-${m}-${d}`);
    }
  }
  
  console.warn(`Format de date non supporté:`, dateInput);
  return null;
}

// Modifiez loadCalendarEvents comme suit :
loadCalendarEvents() {
  const responsableID = localStorage.getItem('RESPONSABLEID');
  if (!responsableID) {
    console.error("Impossible de récupérer l'ID du responsable !");
    return;
  }

  this.formationservice.getFormationsParResponsable(Number(responsableID)).subscribe(
    (data) => {
      this.calendarEvents = data.map(item => {
        const formation = this.transformToFormationDto(item);
        
        // Palette professionnelle bleu/orange
        const style = formation.valide 
          ? { // Événement confirmé - Thème bleu
              bgColor: '#e8f4fc',
              borderColor: '#4a89dc',
              textColor: '#2c3e50',
              dotColor: '#4a89dc'
            }
          : { // Événement temporaire - Thème orange
              bgColor: '#fff7ed',
              borderColor: '#f97316',
              textColor: '#9a3412',
              dotColor: '#f97316'
            };

        return {
          title: formation.titre,
          start: formation.dateDebutPrevue,
          end: formation.dateFinPrevue,
          color: style.bgColor,
          borderColor: style.borderColor,
          textColor: style.textColor,
          extendedProps: {
            description: formation.description,
            type: formation.typeFormation,
            valide: formation.valide
          },
          className: formation.valide ? 'event-confirmed' : 'event-tentative'
        };
      });

      this.updateCalendar();
    },
    (error) => {
      console.error('Erreur:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors du chargement du calendrier'
      });
    }
  );
}

private updateCalendar(): void {
  this.calendarOptions = {
    ...this.calendarOptions,
    events: [...this.calendarEvents]
  };
  
  // Si vous utilisez ViewChild pour accéder au calendrier
  
}
   
ngAfterViewInit() {
  console.log("La vue a été initialisée !");
  // Tu peux ici effectuer des actions sur la vue, comme récupérer des éléments DOM ou activer des animations.
}
     isFormationEnCours(dateFin: string | Date): boolean {
      const dateFinPrevue = new Date(dateFin);
      const today = new Date();
      return dateFinPrevue >= today;
    }
    


  ngOnInit(): void {
    const responsableID = localStorage.getItem('RESPONSABLEID');
    if (!responsableID) {
      console.error("Impossible de récupérer l'ID du RH !");
      return;
    }else{
     
        this.formationservice.getFormationsParResponsable(Number(responsableID)).subscribe(
          (data) => {
            console.log("hiiiiii",data );
            this.formations = data;
            this.formationsValidees = this.formations.filter((f) => f.valide);
            this.formationsNonValidees = this.formations.filter((f) => !f.valide && !f.annuler);
            this.formationsNoncorrige = this.formations.filter((f) => f.probleme === true);
          console.log('non corrigé : ',this.formationsNoncorrige)
            
          },
          (error) => {
            console.error('Erreur lors de la récupération des formations', error);
            
          }
        );
      
    }
    this.initializeSelectedPdfUrl();
  }

  getStatusSeverity(dateFin: Date): "success" | "danger" | "warn" | undefined {
    const today = new Date();
    if (new Date(dateFin) < today) {
      return 'danger'; // Terminée
    } else {
      return 'success'; // En cours
    }
  }
  

  getFormationStatus(dateFin: Date): string {
    const today = new Date();
    if (new Date(dateFin) < today) {
      return 'Terminée';
    } else {
      return 'En cours';
    }
  }





  private hasOpenedBefore: boolean = false;
  private allEmployeesValidated: boolean = false;

  showParticipants(formation: any) { 
    console.log("Formation sélectionnée :", formation);
  
    this.selectedFormation = formation;
    this.displayDialog = true;
    this.participantsMap = {};
    this.pdfUrls = {};
    this.allEmployeesValidated = false; // Reset au début

    if (!formation.id) {
      console.error("⚠️ ID de la formation est indéfini !");
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'ID de la formation est indéfini !' });
      return;
    }

    let documentsCount = 0;
    formation.employes.forEach((employe: any) => {
      this.participantsMap[employe.id] = formation.id;

      this.Emoloyeservice.getDocumentByEmployeIdAndFormationId(employe.id, formation.id).subscribe({
        next: (response: Blob) => {
          const fileURL = URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
          this.pdfUrls[employe.id] = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
          
          documentsCount++;
          if (documentsCount === formation.employes.length) {
            this.checkAllEmployeesEvaluated(formation);
          }
        }
      });
    });
}

private checkAllEmployeesEvaluated(formation: any) {
  const allEvaluated = formation.employes.every((employe: any) => this.pdfUrls[employe.id]);



  this.hasOpenedBefore = true; // Marquer que la première ouverture est passée
}


getFormattedComment(comment: string): string {
  if (!comment) return '';

  // Remplacer les \n par des sauts de ligne HTML et les - par des puces
  return comment
    .replace(/\\n/g, '\n') // Convertir \n en vrais sauts de ligne
    .replace(/^- /gm, '• ') // Remplacer les - en début de ligne par des puces
    .trim();
}

// Ajoutez ces propriétés
selectedFileFromParticipants: File | null = null;
selectedFileFromPdfViewer: File | null = null;

isDocumentCompatible: boolean = false;
verifierCompatibilite() {
  console.log('Vérification de compatibilité déclenchée');
this.isDocumentCompatible = false;
  // Déterminez quel fichier utiliser selon le contexte
  const fileToCheck = this.selectedFileFromPdfViewer || this.selectedFileFromParticipants;
  
  if (!fileToCheck) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Aucun fichier',
      detail: 'Veuillez sélectionner un fichier PDF avant de vérifier la compatibilité.'
    });
    return;
  }

  const matricule = this.selectedEmploye?.matricule || '';
  const libelle = this.selectedFormation?.entete?.libelle || '';
  const nomEmploye = this.selectedEmploye?.nom || ''; // Ajout du nom de l'employé
  
  if (!matricule || !libelle) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Données manquantes',
      detail: 'Matricule ou libellé de formation introuvable.'
    });
    return;
  }

  this.pdfService.checkWords(fileToCheck, matricule, libelle).subscribe({
    next: (response) => {
      console.log('Réponse du serveur:', response);
      
      // Extraction des résultats de la vérification
      const word1Found = response.word1Found || false;
      const word2Found = response.word2Found || false;
      
      console.log(`Résultats - word1Found: ${word1Found}, word2Found: ${word2Found}`);
      
      if (!word1Found && word2Found) {
        // Cas 1: word1Found false, word2Found true
        console.log('Document non compatible - mauvais employé');
        this.messageService.add({
          severity: 'error',
          summary: 'Document incompatible',
          detail: `Le document sélectionné n'est pas pour cet employé (${nomEmploye} - ${matricule}). Veuillez vérifier.`
        });
      } else if (word1Found && !word2Found) {
        // Cas 2: word1Found true, word2Found false
        console.log('Document partiellement compatible - problème de formation ou format');
        this.messageService.add({
          severity: 'warn',
          summary: 'Problème de formation',
          detail: 'Cette fiche est bien pour cet employé mais ne correspond pas à cette formation ou il y a un problème de format. Veuillez vérifier.'
        });
      } else if (!word1Found && !word2Found) {
        // Cas 3: word1Found false, word2Found false
        console.log('Document totalement incompatible');
        this.messageService.add({
          severity: 'error',
          summary: 'Document incorrect',
          detail: 'Attention: Ce document est totalement incompatible. Veuillez vérifier.'
        });
      } else {
        // Cas 4: word1Found true, word2Found true
        console.log('Document compatible');
        this.isDocumentCompatible = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Document compatible',
          detail: 'Le PDF est compatible pour cet employé et cette formation. Vous devez maintenant vérifier les notes des formateurs.'
        });
      }
    },
    error: (error) => {
      console.error('Erreur lors de la vérification:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur serveur',
        detail: 'Une erreur est survenue lors de la vérification.'
      });
    }
  });
}
  onConfirmValidation() {
    this.displayValidationConfirmDialog = false;
    
    this.formationservice.validerFormation(this.selectedFormation.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.allEmployeesEvaluated = true;
          this.selectedFormation.valide = true;
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Succès', 
            detail: 'Tous les employés ont été validés avec succès',
            life: 3000
          });
  
          setTimeout(() => {
            this.hideDialog();
          }, 1000);
  
          this.loadFormationsData();
        }
      },
      error: (err) => {
        console.error('Erreur lors de la validation de la formation :', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erreur', 
          detail: 'Erreur lors de la validation finale' 
        });
      }
    });
  }
   shouldDisplayValidationDialog(): boolean {
    return this.displayValidationConfirmDialog && !this.selectedFormation?.valide;
  }
  onRejectValidation() {
    this.displayValidationConfirmDialog = false;
  }
  areAllEmployeesEvaluated(): boolean {
    if (!this.selectedFormation || !this.selectedFormation.employes) {
      return false;
    }
  
    return this.selectedFormation.employes.every(
      (employe: any) => this.pdfUrls[employe.id]
    );
  }
  

  hideDialog() {
    this.displayDialog = false;
    this.pdfUrls = {};
    this.allEmployeesEvaluated = false;
    
    // Libérer les URLs
    Object.values(this.pdfUrls).forEach(url => {
      const unsafeUrl = this.sanitizer.sanitize(4, url);
      if (unsafeUrl) URL.revokeObjectURL(unsafeUrl);
    });
  
    if (this.selectedPdfUrl) {
      const oldUrl = this.sanitizer.sanitize(4, this.selectedPdfUrl);
      if (oldUrl) URL.revokeObjectURL(oldUrl);
    }
  }
  selectedPosition: { x: number; y: number } | null = null;




  

  initializeSelectedPdfUrl() {
    this.selectedPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  async loadPdf() {
    try {
      this.pspdfkitInstance = await PSPDFKit.load({
        baseUrl: location.protocol + '//' + location.host + '/assets/',
        document: '/assets/example.pdf', // Chemin vers votre PDF
        container: '#pspdfkit-container',
      });

      // Activer le mode d'édition de texte
      this.pspdfkitInstance.setViewState((viewState: any) =>
        viewState.set('interactionMode', PSPDFKit.InteractionMode.CONTENT_EDITOR)
      );

      console.log('PSPDFKit chargé avec succès.');
    } catch (error) {
      console.error('Erreur lors du chargement de PSPDFKit :', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger le PDF.',
      });
    }
  }
  spacing: number[] = []; // Tableau des espacements entre les périodes

  spacingDialogVisible = false;
  periodSpacings: { value: number }[] = [];

  openSpacingSettings() {
    // Initialiser les espacements
    if (this.selectedFormation?.periodes?.length > 0) {
      const numSpacings = this.selectedFormation.periodes.length - 1;
      this.periodSpacings = Array(numSpacings).fill(0).map(() => ({ value: 40 })); // Valeur par défaut
    }
    this.spacingDialogVisible = true;
  }
  validateNumberInput(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (allowedKeys.includes(event.key) || 
        (event.key >= '0' && event.key <= '9')) {
      return; // Autoriser
    }
    event.preventDefault(); // Bloquer
  }
  // Méthode pour appliquer les réglages
  async applySpacingSettings() {
    try {
      this.spacingDialogVisible = false;
      await new Promise(resolve => setTimeout(resolve, 100));
  
      if (!this.selectedPdfUrl || !this.selectedEmploye) {
        throw new Error('Données manquantes');
      }
  
      // Récupérer le PDF original
      const pdfResponse = await fetch(this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.selectedPdfUrl) || '');
      const pdfBlob = await pdfResponse.blob();
      
      // Fermer le dialogue actuel
      this.pdfDialogVisible = false;
      this.selectedPdfUrl = null;
      this.cdr.detectChanges();
  
      // Réouvrir avec les nouveaux paramètres
      setTimeout(async () => {
        const newBlobUrl = URL.createObjectURL(pdfBlob);
        const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(newBlobUrl);
        await this.openPdfDialog(safeUrl, this.selectedEmploye);
      }, 200);
  
    } catch (error) {
      console.error('Erreur:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Problème lors de l\'application des réglages'
      });
    }
  }

onPdfDialogHide() {
  // Libérez les ressources lorsque le dialogue est fermé
  if (this.selectedPdfUrl) {
    const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.selectedPdfUrl);
    if (url) URL.revokeObjectURL(url);
    this.selectedPdfUrl = null;
  }
}
//genere pdf specifique
navigateToPdfReport(employe: any) {
  console.log('Selected Formation:', this.selectedFormation);
  console.log('Selected Employee:', employe);
  if (!this.selectedFormation || !employe) {
    console.error('Données manquantes pour générer le PDF');
    return;
  }

  // Créer l'objet de données à passer
  const pdfData = {
    employee: {
      id: employe.id,
      nom: employe.nom,
      prenom: employe.prenom,
      matricule: employe.matricule,
      email: employe.email,
      poste: employe.poste?.titre || 'Non spécifié'
    },
    formation: this.selectedFormation
    
  };

  // Convertir en base64 pour passage dans l'URL
  const encodedData = btoa(unescape(encodeURIComponent(JSON.stringify(pdfData))));

  
  // Navigation vers la route PDF
  this.router.navigate(['/pdf', encodedData]);
}
  async openPdfDialog(pdfUrl: SafeUrl | null, employe: any) {
    if (this.pdfDialogVisible) {
      // Fermez d'abord le dialogue existant
      this.pdfDialogVisible = false;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!pdfUrl || !employe) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Aucun PDF ou employé sélectionné.',
      });
      return;
    }
  
    if (this.selectedPdfUrl) {
      const oldUrl = this.sanitizer.sanitize(4, this.selectedPdfUrl);
      if (oldUrl) {
        URL.revokeObjectURL(oldUrl);
      }
    }
  
    this.selectedEmploye = employe;
  
    try {
      const url = this.sanitizer.sanitize(4, pdfUrl);
      if (!url) return;
  
      const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
  
      const pageHeight = pages[0].getHeight();
      console.log('Hauteur de la page PDF:', pageHeight);
      const totalHeight = pages.reduce((acc, page) => acc + page.getHeight(), 0);
      console.log('Hauteur totale du PDF (toutes les pages) :', totalHeight);
      
      const pageWidth = pages[0].getWidth();
  
      const formation = this.selectedFormation;
  
      const matriculeText = `${employe.matricule}`;
      const nomPrenomText = `${employe.nom} ${employe.prenom}`.toLowerCase();
      const titrePosteText = formation?.titrePoste || '';
      const dateDebutPrevue = formation?.dateDebutPrevue || '';
      const dateFinPrevue = formation?.dateFinPrevue || '';
      const responsableEvaluationnom = formation?.responsableEvaluation?.nom || '';
      const responsableEvaluationprenom = formation?.responsableEvaluation?.prenom || '';
  /*
      // --- Dessin de l'en-tête ---
      const page = pages[0];
      page.drawText(matriculeText, { x: 130, y: 630, size: 12, color: rgb(0, 0, 0) });
      page.drawText(nomPrenomText, { x: 160, y: 652, size: 14, color: rgb(0, 0, 0) });
      page.drawText(titrePosteText, { x: 150, y: 590, size: 12, color: rgb(0, 0, 0) });
      page.drawText(dateDebutPrevue, { x: 211, y: 570, size: 10, color: rgb(0, 0, 0) });
      page.drawText(dateFinPrevue, { x: 280, y: 570, size: 10, color: rgb(0, 0, 0) });
      page.drawText(responsableEvaluationnom, { x: 185, y: 550, size: 10, color: rgb(0, 0, 0) });
      page.drawText(responsableEvaluationprenom, { x: 211, y: 550, size: 10, color: rgb(0, 0, 0) });
  
      // --- Dessin des périodes avec pagination ---
      if (formation?.periodes?.length > 0) {
        let currentY = 340;
        let currentPageIndex = 0;
        let currentPage = pages[currentPageIndex];
        
        formation.periodes.forEach((periode: any, index: number) => {
          const hauteurPeriode = 60; // Hauteur fixe pour chaque période
          
          // Vérifier s'il reste assez de place sur la page actuelle
          if (currentY - hauteurPeriode < 100) {
            currentPageIndex++;
            if (currentPageIndex >= pages.length) {
              currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
              pages.push(currentPage);
            } else {
              currentPage = pages[currentPageIndex];
            }
            currentY = pageHeight - 190;
          }
          
     
          
          const periodeText = `Du : ${formatDate(periode.dateDebut)}\n au : ${formatDate(periode.dateFin)}`;
          currentPage.drawText(periodeText, {
            x: 335,
            y: currentY,
            size: 7,
            color: rgb(0, 0, 0),
          });
          
          // Met à jour currentY en fonction de la hauteur de cette période
          currentY -= hauteurPeriode;
          
          // Ajouter l'espacement seulement si ce n'est pas la dernière période
          if (index < formation.periodes.length - 1) {
            // Utiliser l'espacement personnalisé si disponible, sinon une valeur par défaut
            const spacing = this.periodSpacings[index]?.value || 80;
            currentY -= spacing;
          }
        });
      }
      */
  
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const modifiedPdfUrl = URL.createObjectURL(blob);
  
      this.selectedPdfUrl = modifiedPdfUrl;
      this.cdr.detectChanges();
      this.pdfDialogVisible = true;
    } catch (error) {
      console.error('Erreur lors de la modification du PDF:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur est survenue lors de l\'ouverture du PDF.',
      });
    } finally {
      this.selectedPosition = null;
    }
  
    function formatDate(dateString: string): string {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    }
  }
  
  
  
  
  

    private loadFormationsData() {
      const responsableID = localStorage.getItem('RESPONSABLEID');
      if (!responsableID) return;
    
      this.formationservice.getFormationsParResponsable(Number(responsableID)).subscribe(
        (data) => {
          this.formations = data;
          this.loadExistingRappelDates();
          this.formationsValidees = this.formations.filter((f) => f.valide);
          this.formationsNonValidees = this.formations.filter((f) => !f.valide && !f.annuler);
          this.formationsNoncorrige = this.formations.filter((f) => f.probleme === true);
          console.log('non corrigé : ',this.formationsNoncorrige)
          this.cdr.detectChanges(); // Forcer la mise à jour de la vue
        },
        (error) => {
          console.error('Erreur lors de la récupération des formations', error);
        }
      );
    }
  

    displayValidationConfirmDialog: boolean = false;

    async saveModifiedPdf(formationId: number, employeId: number) {
      let modifiedPdfFile: File;
    
    
  if (this.selectedFileFromPdfViewer) {
    modifiedPdfFile = this.selectedFileFromPdfViewer;
  } else if (this.selectedFileFromParticipants) {
    modifiedPdfFile = this.selectedFileFromParticipants;
  } else if (this.selectedPdfUrl) {
    const url = this.sanitizer.sanitize(4, this.selectedPdfUrl);
    if (!url) {
      console.error('URL invalide.');
      return;
    }

    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    modifiedPdfFile = new File([blob], 'modified_pdf.pdf', { type: 'application/pdf' });
  } else {
    console.error('Aucun PDF sélectionné.');
    return;
  }
    
      this.formationservice.modifierDocumentEmployeFormation(formationId, employeId, modifiedPdfFile).subscribe({
        next: (response) => {
          console.log('PDF modifié enregistré avec succès:', response);
          
          // 1. Afficher l'alerte de succès
          this.messageService.add({
          
            severity: 'success',
            summary: 'Succès',
            detail: 'Les modifications ont été enregistrées avec succès !',
            life: 3000
          });
      this.isDocumentCompatible = false;
          // 2. Fermer le dialogue PDF
          this.pdfDialogVisible = false;
          
          // 3. Vérifier si tous les employés sont évalués
          this.checkAllEmployeesEvaluated(this.selectedFormation);
          
          // 4. Nettoyer les ressources
          this.clearPdf();
        },
        error: (err) => {
          console.error('Erreur lors de l\'enregistrement du PDF modifié:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Une erreur est survenue lors de l\'enregistrement.',
            life: 5000
          });
        }
      });
    }
    
selectedFile: File | null = null;
pdfViewerKey = 0; // Clé initiale
onFileSelected(event: any) {
  const file = event.target.files[0];
  console.log('Fichier sélectionné:', file);
  if (!file) {
    this.selectedFileFromPdfViewer = null;
    return;
  }

  if (file.type !== 'application/pdf') {
    this.messageService.add({
      severity: 'error',
      summary: 'Format invalide',
      detail: 'Veuillez sélectionner un fichier PDF.',
    });
    this.selectedFileFromPdfViewer = null;
    return;
  }

  // Stocker le fichier pour le contexte PDF viewer
  this.selectedFileFromPdfViewer = file;

  const fileReader = new FileReader();
  fileReader.onload = () => {
    const blob = new Blob([fileReader.result as ArrayBuffer], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(blob);

    if (this.selectedPdfUrl) {
      URL.revokeObjectURL(this.selectedPdfUrl as string);
    }

    this.selectedPdfUrl = fileURL;
    this.pdfViewerKey = new Date().getTime();
    this.cdr.detectChanges();
  };

  fileReader.readAsArrayBuffer(file);
}



handlePdfLoaded(pdf: any) {
  console.log('PDF prêt:', pdf);
  // Traitements supplémentaires si nécessaire
}

handlePdfError(error: any) {
  console.error('Erreur PDF:', error);
  this.messageService.add({
    severity: 'error',
    summary: 'Erreur',
    detail: 'Le PDF n\'a pas pu être affiché',
    life: 5000
  });
}


// Dans votre composant TypeScript
isFormationEnAttente(formationId: number): boolean {
  return this.formationsNonValidees.some(formation => formation.id === formationId);
}
clearPdf() {
  if (this.selectedPdfUrl) {
    const oldUrl = this.sanitizer.sanitize(4, this.selectedPdfUrl);
    if (oldUrl) {
      URL.revokeObjectURL(oldUrl); // Libérer l'URL Blob de l'ancien PDF
    }
  }
  this.selectedPdfUrl = null; // Réinitialiser l'URL du PDF
  this.selectedFile = null; // Réinitialiser le fichier sélectionné
  this.cdr.detectChanges(); // Forcer la mise à jour de la vue
}
// Gestion des événements du PDF Viewer
onPdfLoadComplete(pdf: any) {
  console.log('PDF chargé avec succès', pdf);
}

onPdfLoadError(error: any) {
  console.error('Erreur de chargement PDF:', error);
  this.messageService.add({
    severity: 'error',
    summary: 'Erreur',
    detail: 'Impossible de charger le document PDF'
  });
}




  // Gérer le début du glisser
  onDragStart(event: DragEvent) {
    // Vérifier si l'objet DataTransfer est disponible et qu'un matricule est sélectionné
    if (event.dataTransfer && this.selectedEmploye?.matricule) {
      event.dataTransfer.setData('text/plain', this.selectedEmploye.matricule);
      event.dataTransfer.effectAllowed = 'move'; // Autoriser le déplacement
      console.log(`Début du drag : matricule ${this.selectedEmploye.matricule}`);
    }
  }
  
 
  
  reloadPdfViewer() {
    const pdfContainer = document.querySelector('pdf-viewer') as HTMLElement;
    if (pdfContainer) {
      pdfContainer.innerHTML = ''; // Supprimer l'ancien contenu
      setTimeout(() => {
        const newViewer = document.createElement('pdf-viewer');
        newViewer.setAttribute('src', this.selectedPdfUrl as string);
        pdfContainer.appendChild(newViewer); // Ajouter le nouveau PDF
      }, 0);
    }
  }
  
  
  // Ajouter la signature au PDF
  async addSignatureToPdf() {
    if (!this.selectedPdfUrl || !this.signatureImage) {
      return;
    }
  
    // Charger le PDF
    const url = this.sanitizer.sanitize(4, this.selectedPdfUrl);
    if (!url) {
      console.error('URL invalide.');
      return;
    }
  
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
  
    // Convertir l'image de la signature en PNG
    const pngImage = await pdfDoc.embedPng(this.signatureImage);
  
    // Ajouter la signature à la première page
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
  
    firstPage.drawImage(pngImage, {
      x: this.signaturePosition.x,
      y: height - this.signaturePosition.y - 50, // Ajuster la position Y
      width: 100,
      height: 50,
    });
  
    // Enregistrer le PDF modifié
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    this.selectedPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
  }
 // Ajoutez cette propriété pour stocker les fichiers PDF temporaires
tempPdfFiles: { [key: string]: File } = {};

// Méthode pour ouvrir le sélecteur de fichier pour un employé spécifique
openFileInput(employe: any) {
  const fileInput = document.querySelector('#fileInput') as HTMLInputElement;
  if (fileInput) {
    fileInput.click();
  }
}

// Méthode pour gérer la sélection de fichier pour un employé spécifique
onEmployeeFileSelected(event: any, employe: any) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== 'application/pdf') {
    this.messageService.add({
      severity: 'error',
      summary: 'Format invalide',
      detail: 'Veuillez sélectionner un fichier PDF.',
    });
    return;
  }

  // Stocker le fichier pour le contexte participants
  this.selectedFileFromParticipants = file;
  this.tempPdfFiles[employe.id] = file;

  const fileReader = new FileReader();
  fileReader.onload = () => {
    const blob = new Blob([fileReader.result as ArrayBuffer], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(blob);

    this.pdfUrls[employe.id] = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
    this.selectedPdfUrl = fileURL;
    this.selectedEmploye = employe;

    this.displayDialog = false;
    this.pdfDialogVisible = true;

    this.cdr.detectChanges();
  };

  fileReader.readAsArrayBuffer(file);
}



// Méthode pour enregistrer le PDF d'un employé
saveEmployeePdf(formationId: number, employeId: number) {
  const pdfFile = this.tempPdfFiles[employeId];
  if (!pdfFile) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Aucun changement',
      detail: 'Aucun nouveau fichier PDF sélectionné.',
    });
    return;
  }

  this.formationservice.modifierDocumentEmployeFormation(formationId, employeId, pdfFile).subscribe({
    next: (response) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Le document a été enregistré avec succès!',
        life: 3000
      });
      
      // Nettoyer le fichier temporaire
      delete this.tempPdfFiles[employeId];
      
      // Vérifier si tous les employés sont évalués
      this.checkAllEmployeesEvaluated(this.selectedFormation);
    },
    error: (err) => {
      console.error('Erreur lors de l\'enregistrement:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur est survenue lors de l\'enregistrement.',
        life: 5000
      });
    }
  });
}
}
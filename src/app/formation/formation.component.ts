import { Component, Input, OnInit, ViewChild ,NgZone, ChangeDetectorRef, SecurityContext } from '@angular/core';
import { FormationDto } from './model/FormationDto.model';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TypeFormation } from './model/type-formation.model';
import { SousTypeFormation } from './model/SousTypeFormation.model';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import dayGridPlugin from '@fullcalendar/daygrid'; // Plugin pour la vue mensuelle

import interactionPlugin from '@fullcalendar/interaction'; // Plugin pour les interactions (clic, glisser-déposer)
import timeGridPlugin from '@fullcalendar/timegrid';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { ReactiveFormsModule } from '@angular/forms';  // Importer ReactiveFormsModule
import { EmoloyeService } from '../employe/service/emoloye.service';

import { Utilisateur } from '../utilisateur/model/utilisateur';
import { UtilisateurService } from '../utilisateur/service/utilisateur.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormationService } from './service/formation.service';
import { Table, TableModule } from 'primeng/table';  // Import de la table PrimeNG
import { CardModule } from 'primeng/card';    // Import de la Card PrimeNG
import { TagModule } from 'primeng/tag';
import { PosteService } from '../poste/service/poste.service';
import { Poste } from '../poste/model/poste';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FullCalendarModule } from '@fullcalendar/angular';

import { TabViewModule } from 'primeng/tabview'; 
import { CalendarOptions } from '@fullcalendar/core';
import { FormationPosteService } from './service/FormationPosteService.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DirectionService } from '../direction/service/direction.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ListboxModule } from 'primeng/listbox';

import { FormationDto_Resultat } from './model/FormationDto_Resultat';
import { InputNumberModule } from 'primeng/inputnumber';
import { Entete } from './model/Entete';
import { MessageModule } from 'primeng/message';
import { ChipModule } from 'primeng/chip';
import { PeriodeFormationDto } from './model/periode-formation-dto';
import { EnteteService } from './service/entete.service';
import { Router } from '@angular/router';




interface FormationPosteId {
  formationId: number;
  posteId: number;
}

@Component({

  selector: 'app-formation',
  imports: [CalendarModule,
    DropdownModule,
    InputTextModule,
    DialogModule,
    ButtonModule,
    ChipModule,
    FullCalendarModule,
    MultiSelectModule,
     ReactiveFormsModule,
     MessageModule,
    CommonModule,
    TableModule,
    CardModule,
    TagModule,
    FormsModule,
    ToastModule,
    TabViewModule,
    CalendarModule,
    ConfirmDialogModule,
    RadioButtonModule,
    ListboxModule,
    InputNumberModule
  ],
  providers: [MessageService,ConfirmationService,DatePipe],
  templateUrl: './formation.component.html',
  styleUrl: './formation.component.css'
}) 
export class FormationComponent implements OnInit{
  employes: any[] = [];  // Liste des employés
  cities: any[] = [];  // Liste des employés pour le multiselect
  formationForm: FormGroup;
  dialogVisible: boolean = false; 
  dialogVisibleModif: boolean = false; 
  responsables: Utilisateur[] = [];
  selectedResponsableType: string = '';
  typeFormations = Object.values(TypeFormation); // ['INTERNE', 'EXTERNE']
  sousTypeFormations = Object.values(SousTypeFormation); // ['INTEGRATION', 'POLYVALENCE', ...]
  static formationPosteList: { formationId: number, posteId: number }[] = [];
  formations: FormationDto[] = [];
  displayEventDialog: boolean = false;
  selectedEvent: any = null;
  posteSelectionne: Poste | null = null;
  selectedFormation: any;
  displayDialog: boolean = false;
  globalFilter: string = '';
  postes: Poste[] = [];  
  selectedPoste: Poste | null = null; 
  safeDocumentUrl: SafeUrl | null = null;
  displayPdfDialog: boolean = false;
  pdfUrl: SafeResourceUrl | null = null;
  pdfUrls: { [key: string]: SafeResourceUrl } = {};
  displayModificationDialog: boolean = false;
  modificationForm: FormGroup;
  selectedFile: File | null = null;
  formationsIntegration: any[] = [];
  formationsPolyvalence: any[] = [];
  formationsCompletes: any[] = [];
  formationsIntegrationAnnulees: FormationDto[] = [];
  formationsPolyvalenceValidees: FormationDto[] = [];
  formationsPolyvalenceEnAttente: FormationDto[] = [];
  formationsIntegrationValidees: FormationDto[] = [];
  formationsIntegrationEnAttente: FormationDto[] = [];
  formationsIntegrationACorriger  : FormationDto[] = [];
  formationsPolyvalenceACorriger : FormationDto[] = [];
  formationsPolyvalenceAnnulees : FormationDto[] = [];
  filterTextNonValidees: string = '';
  selectedPosteId!:number;
  filterTextValidees: string = '';
  displayComplementaryProgramDialog: boolean = false;
complementaryProgramForm: FormGroup;
selectedEmployeeForComplementary: any = null;
displayPosteAssignmentDialog: boolean = false;
selectedEmploye: any = null;
selectedDirection: any = null;
selectedSite: any = null;
directions: any[] = [];
sites: any[] = [];
selectedRadio: { [key: string]: string } = {};
selectedEmployees: any[] = [];
employeeTempResults: { [key: number]: string } = {};
selectedEmployes: any[] = [];

  resultatOptions = [
    { label: 'Réussi', value: 'REUSSI' },
    { label: 'Échec', value: 'ECHEC' },
    { label: 'Programme Complémentaire', value: 'PROGRAMME_COMPLEMENTAIRE' },
  ];
  resultatOptionss = [
    { label: 'Réussi', value: 'REUSSI' },
    { label: 'Échec', value: 'ECHEC' }
   
  ];
  loading: boolean = false;
  @ViewChild('tableNonValidees') tableNonValidees!: Table;
  @ViewChild('tableValidees') tableValidees!: Table;
  displayCalendarDialog: boolean = false;
  calendarEvents: any[] = [];
  selectedDate: Date = new Date();
  modalData: { action: string; event: any } | null = null;
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [],//// liste d’événements créée dans updateCalendar()
    eventClick: this.handleEventClick.bind(this),
    eventDisplay: 'block', // Assure un bon affichage
    height: 'auto' // Ajuste la hauteur automatiquement
  };

formationWithComment: any = null;
commentaire: string = '';
constructor(private fb: FormBuilder, 
  private changeDetectorRef: ChangeDetectorRef,
  private directionservice: DirectionService,
  private formationPosteService: FormationPosteService,
  private router: Router,
  private confirmationService: ConfirmationService,
  private ngZone: NgZone,
   private cdRef: ChangeDetectorRef,
  private enteteService: EnteteService,
  private messageService: MessageService,
  private employeService: EmoloyeService,
  private utilisateurService: UtilisateurService,
  private formationservice : FormationService,
  private posteService : PosteService,
   private sanitizer: DomSanitizer) {
  this.formationForm = this.fb.group({
    titre: ['', Validators.required],
    description: ['', Validators.required],
    typeFormation: [null, Validators.required],
    sousTypeFormation: [null, Validators.required],
    dateDebutPrevue: [null, Validators.required],
    dateFinPrevue: [null, { validators: [Validators.required, this.validateDateFin.bind(this)], updateOn: 'change' }],
    responsableEvaluationId: [null],
    responsableEvaluationExterne: [''],
    titrePoste: [null],
    enteteId: [null], 
    reference: [''],
    revisionNumber: [null],
    dateApplication: [null],
    
    selectedCities: [[], Validators.required],
  });

  this.complementaryProgramForm = this.fb.group({
    titre: ['', Validators.required],
    description: ['', Validators.required],
    typeFormation: [null, Validators.required],
    sousTypeFormation: [null, Validators.required],
    dateDebutPrevue: [null, Validators.required],
    dateFinPrevue: [null, Validators.required],
    responsableEvaluationId: [null],
    responsableEvaluationExterne: [''],
    employeIds: [[]],
    titrePoste: [null], // Doit pouvoir accepter un objet Poste complet
    enteteId: [null, Validators.required], // Ajout du champ entête
    periodes: [[]], 
    
  });




  this.modificationForm = this.fb.group({
    titre: ['', Validators.required],
    description: ['', Validators.required],
    typeFormation: ['', Validators.required],
    sousTypeFormation: ['', Validators.required],
    dateDebutPrevue: ['', Validators.required],
    dateFinPrevue: [null, { validators: [Validators.required, this.validateDateFin.bind(this)], updateOn: 'change' }],
    responsableEvaluationId: [null],
    responsableEvaluationExterne: [''],
    employeIds: [[]],
    titrePoste: ['',],
    fichierPdf: [null] ,// Ajouter un contrôle pour le fichier PDF
    selectedCitiesModif: [[]],
    responsableType: [null],
    entete: [null],
   
    
    // Contrôles dynamiques pour les parties
    ...this.createPartieControls()
  });
  this.formationForm.valueChanges.subscribe(() => {
    this.validateDatesmodif();
  });



}

dateDebutFinValidator(group: FormGroup): any {
  const dateDebut = group.get('dateDebutPartie' + group.get('index')?.value)?.value;
  const dateFin = group.get('dateFinPartie' + group.get('index')?.value)?.value;

  if (dateDebut && dateFin && new Date(dateFin) <= new Date(dateDebut)) {
    group.get('dateFinPartie' + group.get('index')?.value)?.setErrors({ dateInvalide: true });
  } else {
    const control = group.get('dateFinPartie' + group.get('index')?.value);
    if (control?.hasError('dateInvalide')) {
      control.setErrors(null);
    }
  }
  return null;
}









// Variables pour gérer les périodes complémentaires
periodesComplementary: PeriodeFormationDto[] = [];
selectedEnteteComplementary: Entete | null = null;

// Méthodes pour gérer l'entête
onEnteteSelectComplementary(entete: Entete): void {
  this.selectedEnteteComplementary = entete;
}

shouldShowEnteteSectionComplementary(): boolean {
  return this.complementaryProgramForm.get('sousTypeFormation')?.value === 'INTEGRATION' || 
         this.complementaryProgramForm.get('sousTypeFormation')?.value === 'POLYVALENCE';
}
isPolyOrIntegrationComplementary(): boolean {
  return this.complementaryProgramForm.get('sousTypeFormation')?.value === 'INTEGRATION' || 
         this.complementaryProgramForm.get('sousTypeFormation')?.value === 'POLYVALENCE';
}

peutAjouterPeriodeComplementary(): boolean {
  const poste = this.complementaryProgramForm.get('titrePoste')?.value;
  return this.isPolyOrIntegrationComplementary() && 
         poste?.lesProgrammesDeFormation?.length &&
         this.periodesComplementary.length < poste.lesProgrammesDeFormation.length;
}

ajouterPeriodeComplementary(): void {
  const dateDebutControl = this.complementaryProgramForm.get('dateDebut');
  const dateFinControl = this.complementaryProgramForm.get('dateFin');
  const formateurControl = this.complementaryProgramForm.get('formateur');
  const programmeControl = this.complementaryProgramForm.get('programme');

  if (
    dateDebutControl?.value &&
    dateFinControl?.value &&
    formateurControl?.value &&
    programmeControl?.value
  ) {
    this.periodesComplementary.push({
      dateDebut: this.formatDate(new Date(dateDebutControl.value)),
      dateFin: this.formatDate(new Date(dateFinControl.value)),
      formateur: formateurControl.value.trim(),
      programme: programmeControl.value
    });
  } else {
    this.messageService.add({
      severity: 'warn',
      summary: 'Champs manquants',
      detail: 'Veuillez remplir tous les champs de la période complémentaire avant de l’ajouter.'
    });
  }
}

supprimerPeriodeComplementary(index: number): void {
  this.periodesComplementary.splice(index, 1);
}
createPartieControls(): { [key: string]: AbstractControl } {
  const controls: { [key: string]: AbstractControl } = {};
  
  for (let i = 0; i < this.nombrePartiesArray.length; i++) {
    controls[`dateDebutPartie${i}`] = new FormControl('', Validators.required);
    controls[`dateFinPartie${i}`] = new FormControl('', [
      Validators.required,
      this.validateDateFinPartie(i)  // Validation personnalisée
    ]);
    controls[`formateurPartie${i}`] = new FormControl('', Validators.required);
    controls[`programmePartie${i}`] = new FormControl('', Validators.required);
  }
  
  return controls;
}
shouldShowEnteteSection(): boolean {
  const sousType = this.formationForm.get('sousTypeFormation')?.value?.toLowerCase();
  return ['polyvalence', 'integration'].includes(sousType);
}
// Dans votre composant.ts
// Ajoutez cette méthode pour générer un commentaire pré-rempli
showCommentField(formation: any) {
  this.formationWithComment = formation;
  
  // Génère un template de commentaire avec les employés
  let employeesList = '';
  if (formation.employes && formation.employes.length > 0) {
    employeesList = formation.employes.map((emp: any) => 
      `- ${emp.matricule} ${emp.nom} ${emp.prenom} : [Décrire le problème]`
    ).join('\n');
  }
  
  this.commentaire = `Problème de validation pour la formation ${formation.titre} :
${employeesList}

[Observations complémentaires]`;
}

cancelComment() {
  this.formationWithComment = null;
  this.commentaire = '';
}

submitComment() {
  if (this.formationWithComment && this.commentaire.trim()) {
    this.formationservice.signalerProbleme(this.formationWithComment.id, this.commentaire)
      .subscribe({
        next: () => {
          this.messageService.add({severity: 'success', summary: 'Succès', detail: 'Problème signalé avec succès'});
          this.loadFormations();
          
          this.formationWithComment = null;
          this.commentaire = '';
        },
        error: (err) => {
          this.messageService.add({severity: 'error', summary: 'Erreur', detail: 'Erreur lors du signalement du problème'});
          console.error(err);
        }
      });
  }
}
editComment(formation: FormationDto) {
  this.formationWithComment = formation;
  this.commentaire = formation.commentaire || ''; // Charger le commentaire existant
}





  handleEventClick(info: any): void {
    this.selectedEvent = {
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
    };
    this.displayEventDialog = true; // Afficher le dialogue
  }
  openCalendarDialog() {
    this.displayCalendarDialog = true;
    this.loadCalendarEvents();
  }
  
  





  private transformToFormationDtocalendrier(data: any): FormationDto {
    return {
      id: data.id,
      titre: data.titre,
      commentaire: data.commentaire,
      description: data.description,
      typeFormation: data.typeFormation,
      sousTypeFormation: data.sousTypeFormation,
      dateDebutPrevue: this.ensureISODateString(data.dateDebutPrevue),
      dateFinPrevue: this.ensureISODateString(data.dateFinPrevue),
      responsableEvaluationId: data.responsableEvaluationId || null,
      responsableEvaluationExterne: data.responsableEvaluationExterne || null,
      employeIds: data.employeIds || [],
      responsableEvaluation: data.responsableEvaluation || null,
      employes: data.employes || [],
      fichierPdf: data.fichierPdf || null,
      organisateurId: data.organisateurId,
      titrePoste: data.titrePoste || null,
      valide: data.valide || false
    };
  }
  
  private ensureISODateString(dateInput: any): string {
    if (!dateInput) return new Date().toISOString(); // Valeur par défaut si null
    
    // Si c'est déjà une string ISO valide
    if (typeof dateInput === 'string' && this.isValidISODate(dateInput)) {
      return dateInput;
    }
    
    // Convertir en Date
    const date = this.convertToDate(dateInput);
    return date ? date.toISOString() : new Date().toISOString();
  }
  
  private convertToDate(dateInput: any): Date | null {
    if (!dateInput) return null;
    
    // Si c'est déjà une Date valide
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      return dateInput;
    }
    
    // Si c'est un timestamp (nombre)
    if (typeof dateInput === 'number') {
      return new Date(dateInput);
    }
    
    // Si c'est une string
    if (typeof dateInput === 'string') {
      // Essayez le parsing direct
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) return date;
      
      // Formats spécifiques
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
  
  private isValidISODate(dateString: string): boolean {
    return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/.test(dateString);
  }
  
  private updateCalendar(): void {
    this.calendarOptions = {
      ...this.calendarOptions,
      events: [...this.calendarEvents]
    };
    
    // Si vous utilisez ViewChild pour accéder au calendrier
  
  }
  
  loadCalendarEvents(): void {
    const rhId = localStorage.getItem('RHID');
    if (!rhId) {
      console.error("Impossible de récupérer l'ID du RH !");
      return;
    }

    this.formationservice.getFormationsParRH(Number(rhId)).subscribe({
      next: (data) => {
        this.calendarEvents = data
          .map((formation: any) => {
            const transformed = this.transformToFormationDtocalendrier(formation);
            
            //connaitre formation validé ou non pour choisir le couleur 
            const eventStyle = transformed.valide 
              ? { // Événement confirmé - Thème bleu professionnel
                  bgColor: '#e8f4fc', // Bleu très clair
                  borderColor: '#4a89dc', // Bleu vif mais professionnel
                  textColor: '#2c3e50', // Noir bleuté pour le texte
                  dotColor: '#4a89dc' // Bleu cohérent avec la bordure
                }
              : {
                bgColor: '#fff7ed',  // Orange ultra clair (fond crème)
                borderColor: '#f97316', // Orange vif mais contrôlé
                textColor: '#9a3412', // Brun-orange foncé (meilleure lisibilité)
                dotColor: '#f97316'   // Cohérence avec la bordure
              };
// Ce format est ce que FullCalendar attend pour afficher un événement.
            return {
              title: transformed.titre,
              start: transformed.dateDebutPrevue,
              end: transformed.dateFinPrevue,
              color: eventStyle.bgColor,
              textColor: eventStyle.textColor,
              borderColor: eventStyle.borderColor,
              className: transformed.valide ? 'event-confirmed' : 'event-tentative',
              extendedProps: {
                description: transformed.description,
                type: transformed.typeFormation,
                valide: transformed.valide
              }
            };
          })
          .filter(event => event !== null);

        this.updateCalendar();
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement du calendrier'
        });
      }
    });
}
  applyFilterNonValidees() {
    this.loading = true;
    setTimeout(() => {
      this.tableNonValidees.filterGlobal(this.filterTextNonValidees, 'contains');
      this.loading = false;
    }, 300);
  }

  resetFilterNonValidees() {
    this.filterTextNonValidees = '';
    this.tableNonValidees.filterGlobal('', 'contains');
  }

  applyFilterValidees() {
    this.loading = true;
    setTimeout(() => {
      this.tableValidees.filterGlobal(this.filterTextValidees, 'contains');
      this.loading = false;
    }, 300);
  }

  resetFilterValidees() {
    this.filterTextValidees = '';
    this.tableValidees.filterGlobal('', 'contains');
  }
  validateDateFinPartie(partieIndex: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const dateDebut = this.formationForm.get(`dateDebutPartie${partieIndex}`)?.value;
      const dateFin = control.value;
  
      console.log(`Validation de la date fin pour la partie ${partieIndex}`);
      console.log(`Date début partie ${partieIndex}:`, dateDebut);
      console.log(`Date fin entrée pour partie ${partieIndex}:`, dateFin);
  
      if (dateDebut && dateFin) {
        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);
  
        console.log(`Date début transformée en objet Date:`, debut);
        console.log(`Date fin transformée en objet Date:`, fin);
  
        if (fin <= debut) {
          console.log('La date de fin est avant ou égale à la date de début');
          return { dateInvalide: true };
        }
      }
  
      console.log('Validation réussie : la date de fin est valide');
      return null;
    };
  }
  
  
  
  
  validateDateFin(control: AbstractControl): ValidationErrors | null {
    const dateFin = control.value;
    const dateDebut = this.formationForm?.get('dateDebutPrevue')?.value;
  
    if (!dateFin) {
      return { required: true }; // La date de fin est obligatoire
    }
  
    if (dateDebut && new Date(dateFin) < new Date(dateDebut)) {
      return { dateInvalide: true }; // La date de fin doit être après la date de début
    }
  
    return null; // La validation est réussie
  }
  validateDates(form: FormGroup) {
    const dateDebut = form.get('dateDebutPrevue')?.value;
    const dateFin = form.get('dateFinPrevue')?.value;
  
    if (dateDebut && dateFin && new Date(dateDebut) > new Date(dateFin)) {
      form.get('dateFinPrevue')?.setErrors({ dateInvalide: true });
    } else {
      form.get('dateFinPrevue')?.setErrors(null);
    }
  }
  validateDatesmodif(): void {
    const dateDebut = this.modificationForm.get('dateDebutPrevue')?.value;
    const dateFin = this.modificationForm.get('dateFinPrevue')?.value;
  
    if (dateDebut && dateFin && new Date(dateFin) < new Date(dateDebut)) {
      this.modificationForm.get('dateFinPrevue')?.setErrors({ dateInvalide: true });
    } else {
      this.modificationForm.get('dateFinPrevue')?.setErrors(null);
    }
  }
  entetes: Entete[] = [];
  showEntete = false;
  showEnteteField(): boolean {
    const sousType = this.formationForm.get('sousTypeFormation')?.value;
    return sousType === 'POLYVALENCE' || sousType === 'INTEGRATION';
  }
  
  ngOnInit(): void {
    
    this.setupTypeListener();
    this.loadEntetes();
    this.formationForm.get('nombreParties')?.valueChanges.subscribe((value) => {
      this.updateDateFields();
      
      // Initialiser le tableau basé sur la valeur actuelle
      const currentValue = value || 0;
      this.nombrePartiesArray = Array(currentValue).fill(0).map((_, i) => i);
    });
    const initialValue = this.formationForm.get('nombreParties')?.value || 0;
    this.nombrePartiesArray = Array(initialValue).fill(0).map((_, i) => i);
    
    this.loadFormations(); 
    this.displayFormationPosteList();
    const rhId = localStorage.getItem('RHID'); // Pas 'RHIDD' ni 'RHIDDDDDDDDD'
  
    if (!rhId) {
      console.error("Aucun ID RH trouvé. Vérifiez :");
      console.log("Contenu actuel du localStorage:", localStorage);
     // Redirigez si l'ID est manquant
      return;
    }
    
    console.log('RHID:', rhId); // Log propre sans 'D' supplémentaires
    // ... reste du code
  
  this.formationForm = this.fb.group({
    titre: ['', Validators.required],
    description: ['', Validators.required],
    typeFormation: [null, Validators.required],
    sousTypeFormation: [null, Validators.required],
    dateDebutPrevue: [null, Validators.required],
    dateFinPrevue: [null, Validators.required],
    responsableEvaluationId: [null],
    responsableEvaluationExterne: [''],
    selectedCities: [[], Validators.required],
   
    titrePoste: [null],
   
    enteteId: [null
      
    ], 
    reference: [''],
    revisionNumber: [null],
    dateApplication: [null],
    responsableType: [null, Validators.required], 
  });


  
  this.formationForm.get('typeFormation')?.enable();
  this.formationForm.get('responsableType')?.enable();
  this.formationForm.valueChanges.subscribe(() => {
    this.validateDates(this.formationForm);
  });

  this.utilisateurService.getResponsables().subscribe(
    (data) => {
      console.log(data); 
      this.responsables = data;
    },
    (error) => {
      console.error('Erreur lors de la récupération des responsables', error);
    }
  );


  // Récupérer la liste des employés
  this.employeService.getEmployesWithDirectionAndSite().subscribe((data) => {
    this.employes = data;
    this.cities = this.employes.map((employe) => ({
      name: `${employe.nom} ${employe.prenom}`,  // Nom complet
      matricule: employe.matricule,  // Matricule de l'employé
      code: employe.id  // ID de l'employé (qui peut être utilisé pour l'identification)
    }));
    
  });


  this.posteService.getAllPostesnonArchives().subscribe(
    (data) => {
      this.postes = data;
    },
    (error) => {
      console.error('Erreur lors de la récupération des postes', error);
    }
  );
  this.formationForm.get('selectedCities')?.valueChanges.subscribe(selectedCodes => {
    this.selectedEmployees = this.cities.filter(emp => selectedCodes.includes(emp.code));
  });
  }
  private setupTypeListener() {
    this.formationForm.get('sousTypeFormation')?.valueChanges.subscribe(sousType => {
      if (this.shouldShowEnteteSection()) {
        this.loadEntetes(); // Recharger si nécessaire
      }
      this.showEntete = sousType === 'POLYVALENCE' || sousType === 'INTEGRATION';
      
      const enteteControl = this.formationForm.get('enteteId');
      if (this.showEntete) {
        enteteControl?.enable();
      } else {
        enteteControl?.disable();
        enteteControl?.setValue(null);
      }
    });
  }
  
  private loadEntetes() {
    this.enteteService.getAllEntetes().subscribe({
      next: (entetes) => this.entetes = entetes,
      error: (err) => {
        console.error('Erreur:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les entêtes'
        });
      }
    });
  }
  validateDateRange(debutControlName: string, finControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const debut = formGroup.get(debutControlName)?.value;
      const fin = formGroup.get(finControlName)?.value;
  
      if (debut && fin && new Date(fin) < new Date(debut)) {
        return { dateRangeInvalid: true };
      }
      return null;
    };
  }
  getProgrammesForPartie(): string[] {
    return this.posteSelectionne?.lesProgrammesDeFormation || [];
  }
  onPosteSelect(event: any) {
    const selectedPoste = event.value;
     this.selectedPosteId = event.value.id;
     this.posteSelectionne = selectedPoste;  
    console.log('ID du poste sélectionné :', this.selectedPosteId);
    if (selectedPoste && selectedPoste.document) {
      // Récupérer le contenu Base64 du PDF
      const base64Data = selectedPoste.document;
      this.initialiserParties();
      
      // Convertir le Base64 en un Blob (fichier binaire)
      const byteCharacters = atob(base64Data); // Décoder Base64
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const fileBlob = new Blob([byteArray], { type: 'application/pdf' });
  
      // Créer une URL Blob pour afficher dans l'iframe
      const pdfUrl = URL.createObjectURL(fileBlob);
  
      // Mettre à jour l'iframe
      const pdfViewer = document.getElementById('pdfViewer') as HTMLIFrameElement;
      if (pdfViewer) {
        pdfViewer.src = pdfUrl;
      }
  
      console.log('PDF chargé depuis Base64 et affiché dans iframe');
    } else {
      console.warn('Aucun document trouvé pour ce poste.');
    }
  }
  

  showParticipants(formation: any) {
    if (formation && formation.employes) {
      this.selectedFormation = formation;
      this.displayDialog = true;
  
      if (formation.valide) {
        this.pdfUrls = {};
        formation.employes.forEach((employe: any) => {
          // Récupérer le document PDF pour l'employé PDF en backend (type Blob).
          this.employeService.getDocumentByEmployeIdAndFormationId(employe.id, formation.id).subscribe({
            next: (response: Blob) => {
              const fileURL = URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
              this.pdfUrls[employe.id] = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
            }
          });
  
          // Récupérer le résultat de l'employé pour cette formation
          this.formationservice.getResultatFormation(formation.id, employe.id).subscribe({
            next: (result) => {
              // Ajouter le résultat à l'objet employé
              employe.resultat = result.resultat;
              employe.res = result.res; // Si vous avez besoin de cette propriété
            },
            error: (err) => {
              console.error(`Erreur lors de la récupération du résultat pour employé ${employe.id} et formation ${formation.id}:`, err);
              employe.resultat = 'Aucun résultat disponible'; // Valeur par défaut en cas d'erreur
            }
          });
        });
      }
    } else {
      console.error('Aucun employé trouvé pour cette formation');
    }
  }
  openPdfDialog(pdfUrl: SafeUrl) {
    this.pdfUrl = pdfUrl;
    this.displayPdfDialog = true;
  }

  hidePdfDialog() {
    this.displayPdfDialog = false;
    this.pdfUrl = null;
  }

  // Fermer le dialogue
  hideDialog() {
    this.displayDialog = false;
  }
  currentPoste: any;
openModificationDialog(formation: any) {
  console.log('--- openModificationDialog appelé ---');
  console.log('Formation reçue:', formation);

  this.loadEntetes();

  // Type responsable par défaut
  this.selectedResponsableTypeModif = (formation.sousTypeFormation === 'INTEGRATION' || formation.sousTypeFormation === 'POLYVALENCE')
    ? 'INTERNE'
    : formation.responsableEvaluationId ? 'INTERNE' : 'EXTERNE';

  this.selectedFormation = formation;

  this.initializePeriodesModif(formation);

  // Conversion des dates des périodes en Date()
  this.periodesModif = formation.periodes?.map((periode: any) => ({
    ...periode,
    dateDebut: new Date(periode.dateDebut),
    dateFin: new Date(periode.dateFin)
  })) || [];
  console.log('Périodes modifiées:', this.periodesModif);

  // Gestion du champ sousTypeFormation
  if (formation.sousTypeFormation === 'POLYCOMPETENCE') {
    this.modificationForm.get('sousTypeFormation')?.disable();
  } else {
    this.modificationForm.get('sousTypeFormation')?.enable();
  }
 // Récupérer les IDs des employés de la formation (pour TOUS les types de formation)
    const employeIds = formation.employes.map((emp: any) => emp.id);
   
    // Pré-sélectionner les employés dans le formControl (pour TOUS les types de formation)
    this.modificationForm.patchValue({
        selectedCitiesModif: employeIds
    });
 // Initialiser la liste des employés sélectionnés (pour TOUS les types de formation)
    this.selectedEmployeesModif = this.cities
        .filter(city => employeIds.includes(city.code))
        .map(city => ({
            ...city,
            name: city.name || `${city.nom} ${city.prenom}`
        }));
    // Traitement spécifique à POLYCOMPETENCE
    if (formation.sousTypeFormation === 'POLYCOMPETENCE') {
        this.selectedRadioModif = {};
        
        // Charger les résultats existants
        formation.employes.forEach((emp: any) => {
            this.formationservice.getResultatFormation(formation.id, emp.id).subscribe({
                next: (result) => {
                    this.selectedRadioModif[emp.id] = result.resultat;
                    this.changeDetectorRef.detectChanges();
                },
                error: (err) => {
                    console.error('Erreur récupération résultat', err);
                    this.selectedRadioModif[emp.id] = '';
                }
            });
        });
    }

  // --- Construction selectedEmployees sans utiliser cities ---
  console.log('Formation.employes:', formation.employes);

  this.selectedEmployees = formation.employes?.map((emp: any) => {
    const empName = emp.name || `${emp.nom} ${emp.prenom}`;
    console.log(`Traitement employé id=${emp.id} - name=${empName} - matricule=${emp.matricule}`);
    return {
      id: emp.id,
      code: emp.id, // code utilisé pour optionValue dans p-multiselect
      name: empName,
      matricule: emp.matricule
    };
  }) || [];
  console.log('SelectedEmployees construits:', this.selectedEmployees);



  // Patch du formulaire AVANT d'ouvrir le dialogue (important)
  this.modificationForm.patchValue({
    sousTypeFormation: formation.sousTypeFormation,
    selectedCitiesModif: employeIds,
    employeIds: employeIds
  });

  // Ouverture du dialogue
  this.displayModificationDialog = true;

  // Gestion spécifique POLYCOMPETENCE
if (formation.sousTypeFormation === 'POLYCOMPETENCE') {
  this.selectedRadioModif = {};
  this.editingEmployeeModif = {};

  formation.employes?.forEach((emp: any) => {
    console.log(`Récupération résultat formation pour employé id=${emp.id}`);
    this.formationservice.getResultatFormation(formation.id, emp.id).subscribe({
      next: (result) => {
        console.log(`Résultat pour employé ${emp.id}:`, result);
        this.selectedRadioModif[emp.id] = result.resultat;
        this.editingEmployeeModif[emp.id] = false; // Initialiser l'état d'édition
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Erreur récupération résultat', err);
        this.selectedRadioModif[emp.id] = '';
        this.editingEmployeeModif[emp.id] = false;
      }
    });
  });
}

else {
    this.formationPosteService.getPosteByFormationId(formation.id).subscribe({
      next: (poste) => {
        console.log('Poste récupéré:', poste);
        this.modificationForm.patchValue({ titrePoste: poste });

        if (poste?.document) {
          this.loadPdfIntoIframe(poste.document);
        } else {
          this.pdfUrl = null;
        }

        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error("Erreur récupération poste", err);
        this.modificationForm.patchValue({ titrePoste: null });
      }
    });
  }

  // Patch autres champs
  const currentEntete = formation.entete ? this.entetes.find(e => e.id === formation.entete.id) : null;
  console.log('Entête formation sélectionnée:', currentEntete);
//patchValue pour que les champs preremplis
  this.modificationForm.patchValue({
    titre: formation.titre,
    description: formation.description,
    typeFormation: formation.typeFormation,
    sousTypeFormation: formation.sousTypeFormation,
    dateDebutPrevue: new Date(formation.dateDebutPrevue),
    dateFinPrevue: new Date(formation.dateFinPrevue),
    responsableType: this.selectedResponsableTypeModif,
    responsableEvaluationId: formation.responsableEvaluation?.id || null,
    responsableEvaluationExterne: formation.responsableEvaluationExterne || '',
    reference: formation.reference || '',
    revisionNumber: formation.revisionNumber || '',
    dateApplication: new Date(formation.dateApplication),
    entete: currentEntete,
  });

  // Activation / désactivation selon sous-type
  if (formation.sousTypeFormation === 'INTEGRATION' || formation.sousTypeFormation === 'POLYVALENCE') {
    this.modificationForm.get('typeFormation')?.disable();
    this.modificationForm.get('responsableType')?.disable();
    this.modificationForm.get('responsableType')?.setValue('INTERNE');
  } else {
    this.modificationForm.get('typeFormation')?.enable();
    this.modificationForm.get('responsableType')?.enable();
  }

  this.changeDetectorRef.detectChanges();

  console.log('Modification dialog prêt avec formulaire patché');
}



shouldShowEnteteSectionModif(): boolean {
  return this.modificationForm.get('sousTypeFormation')?.value === 'INTEGRATION' || 
         this.modificationForm.get('sousTypeFormation')?.value === 'POLYVALENCE';
}
// joutez cette méthode pour filtrer les options de sous-type
getFilteredSousTypes(): any[] {
  const currentSousType = this.modificationForm.get('sousTypeFormation')?.value;
  const typeFormation = this.modificationForm.get('typeFormation')?.value;
  
  // Si POLYCOMPETENCE est déjà sélectionné, on l'inclut quand même (mais disabled)
  if (currentSousType === 'POLYCOMPETENCE') {
    return this.sousTypeFormations;
  }
  
  // Pour INTEGRATION/POLYVALENCE, on exclut POLYCOMPETENCE
  if (typeFormation === 'INTERNE') {
    return this.sousTypeFormations.filter(option => 
      option !== 'POLYCOMPETENCE'
    );
  }
  
  return this.sousTypeFormations;
}
  loadPdfIntoIframe(file: File | string) {
    if (file) {
      let pdfUrl: string;
  
      if (typeof file === 'string') {
        // Si le fichier est en Base64
        const byteCharacters = atob(file);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const fileBlob = new Blob([byteArray], { type: 'application/pdf' });
        pdfUrl = URL.createObjectURL(fileBlob);
      } else {
        // Si le fichier est de type File
        pdfUrl = URL.createObjectURL(file);
      }
  
      // Créer une URL sécurisée pour l'iframe
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
      




    } else {
      this.pdfUrl = null; // Réinitialiser l'iframe si aucun document n'est disponible
    }
  }
  onPosteSelectModification(event: any) {
    const selectedPoste = event.value; // Récupérer le poste sélectionné
  
    if (selectedPoste && selectedPoste.document) {
      // Charger le PDF du poste sélectionné dans l'iframe
      this.loadPdfIntoIframe(selectedPoste.document);
    } else {
      this.pdfUrl = null; // Réinitialiser l'iframe si aucun document n'est disponible
    }
    if (this.isPolyOrIntegrationModif()) {
      this.updatePeriodesForPoste(selectedPoste);
    }
  }
  private updatePeriodesForPoste(poste: any) {
    if (poste?.lesProgrammesDeFormation?.length) {
      // Garder les périodes existantes ou en créer de nouvelles
      if (this.periodesModif.length > 0) {
        // Mettre à jour les programmes disponibles
        this.periodesModif.forEach(periode => {
          if (!poste.lesProgrammesDeFormation.includes(periode.programme)) {
            periode.programme = poste.lesProgrammesDeFormation[0];
          }
        });
      } else {
        // Créer de nouvelles périodes
        this.periodesModif = poste.lesProgrammesDeFormation.map((programme: string) => ({
          dateDebut: new Date(),
          dateFin: new Date(),
          formateur: '',
          programme: programme
        }));
      }
    }
  }
onFileChange(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;
    this.modificationForm.get('fichierPdf')?.setValue(file);

    // Mettre à jour l'iframe avec le nouveau fichier PDF
    const fileURL = URL.createObjectURL(file);
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
  }
}
showPreviewModification() {
  if (this.modificationForm.invalid) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Veuillez remplir tous les champs requis avant de prévisualiser.'
    });
    return;
  }

  const formValues = this.modificationForm.getRawValue();
  const periodes: PeriodeFormationDto[] = this.periodesModif
    .filter(p => p.dateDebut && p.dateFin && p.formateur && p.programme)
    .map(p => ({
      dateDebut: this.formatDate(p.dateDebut),
      dateFin: this.formatDate(p.dateFin),
      formateur: p.formateur,
      programme: p.programme
    }));

  // Initialiser un poste vide pour éviter des erreurs si le poste est manquant
  const defaultPoste = {
    lesProgrammesDeFormation: [],
    titre: formValues.titrePoste?.titre || 'Poste non spécifié'
  };

  const posteId = formValues.titrePoste?.id;

  // Vérifier si un poste est sélectionné
  if (posteId) {
    this.posteService.getPosteById(posteId).subscribe({
      next: (poste) => {
        this.preparePreviewData(formValues, periodes, poste || defaultPoste);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du poste:', err);
        this.preparePreviewData(formValues, periodes, defaultPoste);
      }
    });
  } else {
    // Si aucun poste n'est sélectionné, afficher la prévisualisation avec un poste par défaut
    this.preparePreviewData(formValues, periodes, defaultPoste);
  }
}
closeModificationDialog() {
  this.displayModificationDialog = false;
  this.modificationForm.reset();
  this.selectedFile = null;
  this.pdfUrl = null;
}
alertVisible: boolean = false;
alertSeverity: string = 'success'; // success, info, warn, error

periodeErrors: string[] = [];

isIntegrationOuPolyvalence(): boolean {
  const value = this.formationForm.get('sousTypeFormation')?.value;
  return value === 'INTEGRATION' || value === 'POLYVALENCE';
}


submitFormation() {
  if (this.formationForm.invalid) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Veuillez remplir tous les champs pour créer une formation.'
    });

    Object.keys(this.formationForm.controls).forEach(key => {
      const control = this.formationForm.get(key);
      if (control?.invalid) {
        console.error(`Champ ${key} invalide:`, control.errors);
      }
    });
    return;
  }
  

  if (this.formationForm.valid) {

  
    this.alertSeverity = 'success';
    this.alertVisible = true;
    const formValues = this.formationForm.getRawValue();
    const rhId = Number(localStorage.getItem('RHID'));
    const periodes: PeriodeFormationDto[] = [];
    const dateDebutGlobale = new Date(formValues.dateDebutPrevue);
    const dateFinGlobale = new Date(formValues.dateFinPrevue);
    for (let i = 0; i < this.nombrePartiesArray.length; i++) {
      const dateDebutControl = this.formationForm.get(`dateDebutPartie${i}`);
      const dateFinControl = this.formationForm.get(`dateFinPartie${i}`);
      const formateurControl = this.formationForm.get(`formateurPartie${i}`);
      const programmeControl = this.formationForm.get(`programmePartie${i}`);
      
      if (dateDebutControl?.value && dateFinControl?.value && formateurControl?.value && programmeControl?.value) {
        const dateDebutPartie = new Date(dateDebutControl.value);
    const dateFinPartie = new Date(dateFinControl.value);
    if (dateDebutPartie < dateDebutGlobale || dateFinPartie > dateFinGlobale) {
      if (dateDebutPartie < dateDebutGlobale || dateFinPartie > dateFinGlobale) {
        this.periodeErrors[i] = `La période de la partie ${i + 1} doit être comprise entre la date de début prévue et la date de fin prévue de la formation.`;
        return;
      } else {
        this.periodeErrors[i] = ''; // Pas d’erreur
      }
      
      return;
    }

        periodes.push({
          dateDebut: this.formatDate(new Date(dateDebutControl.value)),
          dateFin: this.formatDate(new Date(dateFinControl.value)),
          formateur: formateurControl.value.trim(),
          programme: programmeControl.value // Récupère le texte du programme sélectionné
        });
      }
    }
  
    console.log('Periodes:', periodes);
    // Afficher l'objet complet dans la console avant envoi
    console.log('Objet formation avant envoi:', {
      ...formValues,
      periodes: periodes,
      rhId: rhId
    });
    // Si c'est une formation de polycompétences
    if (this.isPolycompetence()) {
      // Vérifier qu'on a bien des résultats pour chaque employé
      if (!this.selectedRadio || Object.keys(this.selectedRadio).length === 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Veuillez sélectionner un résultat pour chaque employé.'
        });
        return;
      }
    
      // Créer l'objet avec toutes les propriétés dès le départ
      const formationDto: FormationDto_Resultat = {
        titre: formValues.titre,
        description: formValues.description,
        typeFormation: formValues.typeFormation,
        sousTypeFormation: formValues.sousTypeFormation,
        dateDebutPrevue: this.formatDate(formValues.dateDebutPrevue),
        dateFinPrevue: this.formatDate(formValues.dateFinPrevue),
        employes: formValues.selectedCities.map((employeId: number) => ({
          employeId: employeId,
          resultat: this.selectedRadio[employeId]
        })),
        // Initialiser les propriétés optionnelles
        responsableEvaluationId: undefined,
        responsableEvaluationExterne: undefined
      };
    
      // Affecter le responsable selon le type
      if (this.selectedResponsableType === 'INTERNE') {
        formationDto.responsableEvaluationId = formValues.responsableEvaluationId;
        formationDto.responsableEvaluationExterne = undefined;
      } else {
        formationDto.responsableEvaluationExterne = formValues.responsableEvaluationExterne;
        formationDto.responsableEvaluationId = undefined;
      }
    
     
      console.log('Données envoyées:', formationDto);
      
      // Appel du service
     this.formationservice.creerFormationAvecResultat(formationDto, rhId).subscribe({
  next: (res) => {
    console.log('Formation avec résultat ajoutée avec succès', res);
    this.closeDialog();
    this.loadFormations(); // Le refresh est ici maintenant
  },
  error: (error) => {
    console.error('Erreur lors de l\'ajout de la formation avec résultat', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Une erreur est survenue lors de l\'ajout de la formation.',
    });
  }
});

      this.closeDialog();
      this.loadFormations();
    } else {
    
      //C’est donc une solution pratique, sécurisée et adaptée à des formulaires riches comme celui de création de formation.
      const formData = new FormData();

      formData.append('titre', formValues.titre);
      formData.append('description', formValues.description);
      formData.append('typeFormation', formValues.typeFormation);
      formData.append('sousTypeFormation', formValues.sousTypeFormation);
      formData.append('dateDebutPrevue', formValues.dateDebutPrevue.toISOString().split('T')[0]);
      formData.append('dateFinPrevue', formValues.dateFinPrevue.toISOString().split('T')[0]);
    
    
    if (formValues.enteteId && formValues.enteteId.id) {
  formData.append('enteteId', formValues.enteteId.id.toString());
} else {
  this.messageService.add({
    severity: 'error',
    summary: 'Erreur',
    detail: 'Le champ entête est requis.'
  });
  return;
}



      if (formValues.responsableEvaluationId) {
        formData.append('responsableEvaluationId', formValues.responsableEvaluationId.toString());
      }
      if (formValues.responsableEvaluationExterne) {
        formData.append('responsableEvaluationExterne', formValues.responsableEvaluationExterne);
      }
  if (periodes.length === 0) {
  this.messageService.add({
    severity: 'error',
    summary: 'Aucun programme',
    detail: 'Ce poste n\'a pas de programmes. Vous ne pouvez donc pas l\'affecter à cette formation. Veuillez sélectionner un poste qui a des programmes.',
  });
  return;
}    
 if (periodes.length > 0) {
      formData.append('periodes', JSON.stringify(periodes));
    }
      formData.append('organisateurId', rhId.toString());

      formData.append('titrePoste', formValues.titrePoste.titre);

      formValues.selectedCities.forEach((id: number) => {
        formData.append('employeIds', id.toString());
      });

     

      this.formationservice.creerFormation(formData).subscribe({
        next: (formationId) => {
          console.log('Formation ajoutée avec succès', formationId);
if (periodes.length === 0) {
  this.messageService.add({
    severity: 'error',
    summary: 'Aucun programme',
    detail: 'Ce poste n\'a pas de programmes. Vous ne pouvez donc pas l\'affecter à cette formation. Veuillez sélectionner un poste qui a des programmes.',
  });
  return;
}
          if (this.posteSelectionne && this.posteSelectionne.id !== undefined) {
            this.formationPosteService.addPair(formationId, this.posteSelectionne.id).subscribe({
              next: () => {
                console.log('Paire formationId et posteId ajoutée avec succès');
                this.displayFormationPosteList();
              },
              error: (error) => {
                console.error('Erreur lors de l\'ajout de la paire', error);
              },
            });
          } else {
            console.error('Données manquantes :', { posteSelectionne: this.posteSelectionne });
          }

          this.displayFormationPosteList();
          this.closeDialog();
          this.loadFormations();
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout de la formation', error);
        }
      });
    }
  }
}
// Add this to your component class
previewDialogVisible: boolean = false;
previewData: any = {};

showPreview() {
  if (this.formationForm.invalid) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Veuillez remplir tous les champs requis avant de prévisualiser.'
    });
    return;
  }

  const formValues = this.formationForm.getRawValue();
  const periodes: PeriodeFormationDto[] = [];

  for (let i = 0; i < this.nombrePartiesArray.length; i++) {
    const dateDebut = formValues[`dateDebutPartie${i}`];
    const dateFin = formValues[`dateFinPartie${i}`];
    const formateur = formValues[`formateurPartie${i}`];
    const programme = formValues[`programmePartie${i}`];
    if (dateDebut && dateFin && formateur) {
      periodes.push({
        dateDebut: this.formatDate(dateDebut),
        dateFin: this.formatDate(dateFin),
        formateur: formateur.trim(),
        programme: programme.trim()
      });
    }
  }

  const defaultPoste = {
    lesProgrammesDeFormation: [],
  };

  const posteId = formValues.titrePoste?.id;

  // Supposition : formValues.entete est déjà un objet bien structuré
  if (posteId) {
    this.posteService.getPosteById(posteId).subscribe({
      next: (poste) => {
        this.preparePreviewData(formValues, periodes, poste || defaultPoste);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du poste:', err);
        this.preparePreviewData(formValues, periodes, defaultPoste);
      }
    });
  } else {
    this.preparePreviewData(formValues, periodes, defaultPoste);
  }
}


confirmCreation() {
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir créer cette formation pour ' + 
             this.selectedEmployees.length + ' employé(s) avec les paramètres affichés?',
    header: 'Confirmation finale',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Oui, créer',
    rejectLabel: 'Non, modifier',
    accept: () => {
      this.submitFormation();
      this.previewDialogVisible = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Formation créée avec succès pour ' + this.selectedEmployees.length + ' employé(s)'
      });
    },
    reject: () => {
      // L'utilisateur peut continuer à modifier
      this.messageService.add({
        severity: 'info',
        summary: 'Modification',
        detail: 'Vous pouvez modifier la formation avant de la créer'
      });
    }
  });
}
private preparePreviewData(formValues: any, periodes: PeriodeFormationDto[], poste: any) {
  // Répartir les programmes de formation entre les périodes
  const programmesParPartie = this.repartirProgrammes(poste?.ProgrammesDeFormation || [], periodes.length);
  let entete: any = formValues.enteteId;

  if (typeof entete !== 'object') {
    entete = this.entetes.find(e => e.id === entete);
  }

  // Prepare preview data
  this.previewData = {
    ...formValues,
    libelle: entete?.libelle || 'Entête de formation',
    reference: entete?.reference || 'Entête de formation',
    numerorevision: entete?.numerorevision ?? 0,
    dateApplication: entete?.dateApplication   ? new Date(entete.dateApplication).toLocaleDateString('fr-FR') 
    : 'Non définie',
    periodes: periodes.map((periode, index) => ({
      ...periode,
      programmes: programmesParPartie[index] || [] // Ajoute les programmes à chaque période
    })),
    poste: poste,
    employes: this.selectedEmployees,
    selectedRadio: this.selectedRadio,
    responsable: this.selectedResponsableType === 'INTERNE' 
      ? this.responsables.find(r => r.id === formValues.responsableEvaluationId)
      : { nom: formValues.responsableEvaluationExterne, prenom: '' },
    enteteId: formValues.enteteId
  };

  this.previewDialogVisible = true;
}

private repartirProgrammes(programmes: string[], nombreParties: number): string[][] {
  if (nombreParties === 0 || programmes.length === 0) {
    return Array(nombreParties).fill([]);
  }

  // Répartir équitablement les programmes entre les parties
  const result: string[][] = Array(nombreParties).fill([]).map(() => []);
  const programmesParPartie = Math.ceil(programmes.length / nombreParties);

  for (let i = 0; i < programmes.length; i++) {
    const partieIndex = Math.floor(i / programmesParPartie);
    if (partieIndex < nombreParties) {
      result[partieIndex].push(programmes[i]);
    }
  }

  return result;
}
submitModificationForm() {
  if (!this.modificationForm.valid) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Veuillez remplir tous les champs obligatoires'
    });
    return;
  }

  const formValues = this.modificationForm.getRawValue();
  const rhId = Number(localStorage.getItem('RHID'));
  const formationId = this.selectedFormation.id;

  if (formValues.sousTypeFormation === 'POLYCOMPETENCE') {
    const formationDto: FormationDto_Resultat = {
      titre: formValues.titre,
      description: formValues.description,
      typeFormation: formValues.typeFormation,
      sousTypeFormation: formValues.sousTypeFormation,
      dateDebutPrevue: this.formatDate(formValues.dateDebutPrevue),
      dateFinPrevue: this.formatDate(formValues.dateFinPrevue),
      employes: formValues.selectedCitiesModif.map((employeId: number) => ({
        employeId,
        resultat: this.selectedRadioModif[employeId]
      })),
      responsableEvaluationId: this.selectedResponsableTypeModif === 'INTERNE'
        ? formValues.responsableEvaluationId
        : undefined,
      responsableEvaluationExterne: this.selectedResponsableTypeModif === 'EXTERNE'
        ? formValues.responsableEvaluationExterne
        : undefined
    };

    this.formationservice.modifierFormationAvecResultat(formationDto, rhId, formationId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Formation mise à jour avec succès'
        });
        this.closeModificationDialog();
        this.loadFormations();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.error || 'Erreur lors de la mise à jour'
        });
      }
    });
  } else {
    const formData = new FormData();

    formData.append('titre', formValues.titre);
    formData.append('description', formValues.description);
    formData.append('typeFormation', formValues.typeFormation);
    formData.append('sousTypeFormation', formValues.sousTypeFormation);
    formData.append('dateDebutPrevue', formValues.dateDebutPrevue.toISOString().split('T')[0]);
    formData.append('dateFinPrevue', formValues.dateFinPrevue.toISOString().split('T')[0]);
    formData.append('organisateurId', rhId.toString());
    if (formValues.sousTypeFormation === 'INTEGRATION' || formValues.sousTypeFormation === 'POLYVALENCE') {
      // Référence
      if (formValues.reference) {
        formData.append('reference', formValues.reference);
      }

      // Numéro de révision
      if (formValues.revisionNumber) {
        formData.append('revisionNumber', formValues.revisionNumber.toString());
      }

      // Date d'application
      if (formValues.dateApplication) {
        formData.append('dateApplication', formValues.dateApplication.toISOString().split('T')[0]);
      }

      // Entête
      if (formValues.entete && formValues.entete.id) {
        formData.append('enteteId', formValues.entete.id.toString());
      }

      if (this.isPolyOrIntegrationModif() && this.periodesModif.length > 0) {
        const periodesValides = this.periodesModif
          .filter(p => p.dateDebut && p.dateFin && p.formateur && p.programme)
          .map(p => ({
            dateDebut: this.formatDate(p.dateDebut),
            dateFin: this.formatDate(p.dateFin),
            formateur: p.formateur,
            programme: p.programme
          }));
  
        if (periodesValides.length > 0) {
          formData.append('periodes', JSON.stringify(periodesValides));
        }
      }}










    

    if (this.selectedResponsableTypeModif === 'INTERNE' && formValues.responsableEvaluationId) {
      formData.append('responsableEvaluationId', formValues.responsableEvaluationId.toString());
    } else if (this.selectedResponsableTypeModif === 'EXTERNE' && formValues.responsableEvaluationExterne) {
      formData.append('responsableEvaluationExterne', formValues.responsableEvaluationExterne);
    }

    formValues.selectedCitiesModif?.forEach((id: number) => {
      formData.append('employeIds', id.toString());
    });

    if (formValues.titrePoste?.document) {
      if (typeof formValues.titrePoste.document === 'string' && formValues.titrePoste.document.startsWith('JVBERi0')) {
        const pdfFile = this.base64ToFile(formValues.titrePoste.document, 'document.pdf');
        formData.append('fichierPdf', pdfFile);
      } else if (formValues.titrePoste.document instanceof File) {
        formData.append('fichierPdf', formValues.titrePoste.document);
      }
    }

    formData.append('titrePoste', formValues.titrePoste?.titre || '');

    this.formationservice.modifierFormation(formationId, formData).subscribe({
      next: () => {
        if (formValues.titrePoste?.id) {
          this.formationPosteService.updatePosteForFormation(formationId, formValues.titrePoste.id).subscribe({
            next: () => console.log('Poste mis à jour avec succès'),
            error: (error) => console.error('Erreur lors de la mise à jour du poste', error)
          });
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Formation mise à jour avec succès'
        });
        this.closeModificationDialog();
        this.loadFormations();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.error || 'Erreur lors de la mise à jour'
        });
      }
    });
  }
}




private initializePeriodesModif(formation: any) {
  if (formation.periodes && formation.periodes.length > 0) {
    this.periodesModif = formation.periodes.map((periode: any) => ({
      ...periode,
      dateDebut: new Date(periode.dateDebut),
      dateFin: new Date(periode.dateFin)
    }));
  } else if (formation.titrePoste && formation.titrePoste.lesProgrammesDeFormation) {
    // Si pas de périodes mais des programmes, créer des périodes par défaut
    this.periodesModif = formation.titrePoste.lesProgrammesDeFormation.map((programme: string, index: number) => ({
      dateDebut: new Date(),
      dateFin: new Date(),
      formateur: '',
      programme: programme
    }));
  } else {
    this.periodesModif = [];
  }
}

// Méthodes utilitaires pour gérer les réponses
private handleSuccessResponse(response: any) {
  console.log('Formation mise à jour avec succès', response);
  this.messageService.add({
    severity: 'success',
    summary: 'Succès',
    detail: 'Formation mise à jour avec succès'
  });
  this.closeModificationDialog();
  this.loadFormations();
}

displayFormationPosteList() {
  this.formationPosteService.getAllPairs().subscribe({
    next: (pairs) => {
      console.log('Liste des paires formationId et posteId :', pairs);
    },
    error: (error) => {
      console.error('Erreur lors de la récupération des paires', error);
    },
  });
}

isInProgress(dateFinPrevue: Date): boolean {
  const today = new Date();
  const dateFin = new Date(dateFinPrevue);
  return today <= dateFin; // Retourne true si la formation est en cours
}



  onResponsableTypeChange(value: string) {
    this.selectedResponsableType = value;
  }
  openDialog() {
    this.dialogVisible = true;
  }
  openDialogModif() {
    this.dialogVisibleModif = true;
  }

  closeDialogModif() {
    this.dialogVisibleModif = false;
  }
  closeDialog() {
    this.dialogVisible = false;
  }
  private formatDate(date: Date | string | null): string {
    if (!date) return '';
    
    // Si c'est déjà une string, la retourner directement
    if (typeof date === 'string') return date;
    
    // Si c'est un objet Date, le formater
    return new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )).toISOString().split('T')[0];
  }
  
  getPeriodesFromForm(formValues: any): PeriodeFormationDto[] {
    const periodes: PeriodeFormationDto[] = [];
    const nombreDePeriodes = formValues.nombreDePeriodes;
  
    for (let i = 0; i < nombreDePeriodes; i++) {
      const dateDebut = formValues[`dateDebutPartie${i}`];
      const dateFin = formValues[`dateFinPartie${i}`];
      const formateur = formValues[`formateurPartie${i}`];
      const programme = formValues[`programmePartie${i}`];
      if (dateDebut && dateFin && formateur) {
        periodes.push({
          dateDebut: dateDebut.toISOString().split('T')[0],
          dateFin: dateFin.toISOString().split('T')[0],
          formateur: formateur.trim(),
          programme: programme.trim()
        });
      }
    }
  
    return periodes;
  }
  

  loadFormations(): void {
    const rhId = localStorage.getItem('RHID');
    
    if (!rhId) {
      console.error("Impossible de récupérer l'ID du RH !");
      return;
    }
    
    this.loading = true;
    this.ngZone.run(() => {
      this.formationservice.getFormationsParRH(Number(rhId)).subscribe(
        (data) => {
          console.log("Formations récupérées avec succès", data);
          
          // Transformez les données reçues
          this.formations = data.map(item => this.transformToFormationDto(item));
          
          // Filtrer les formations POLYVALANCE
          this.formationsPolyvalence = this.formations.filter(f => 
            f.sousTypeFormation === 'POLYVALENCE'
          );
          
          // Filtrer les formations POLYVALANCE validées
          this.formationsPolyvalenceValidees = this.formationsPolyvalence.filter(f => 
            f.valide  && !f.probleme
          );

          // Filtrer les formations POLYVALANCE en attente
          this.formationsPolyvalenceEnAttente = this.formationsPolyvalence  .filter(f => !f.valide && !f.annuler);
          this.formationsPolyvalenceACorriger = this.formationsPolyvalence.filter(f => 
            f.probleme === true // Enlevez la condition sur !f.valide pour tester
          );
          this.formationsPolyvalenceAnnulees = this.formationsPolyvalence.filter(f => f.annuler);
          // Ajoutez un console.log pour vérifier
          console.log('Formations à corriger:', this.formationsPolyvalenceACorriger);
        
          // Filtrer les formations INTEGRATION
          this.formationsIntegration = this.formations.filter(f => 
            f.sousTypeFormation === 'INTEGRATION'
          );
          this.formationsIntegrationAnnulees  = this.formationsIntegration.filter(f => f.annuler);




          // Dans loadFormations(), après les autres filtres d'intégration
this.formationsIntegrationACorriger = this.formationsIntegration.filter(f => 
  f.probleme === true
);
          // Filtrer les formations INTEGRATION validées
          this.formationsIntegrationValidees = this.formationsIntegration.filter(f => 
            f.valide  && !f.probleme
          );
          
          // Filtrer les formations INTEGRATION en attente
          this.formationsIntegrationEnAttente = this.formationsIntegration.filter(f =>
            !f.valide && !f.annuler 
          );
          console.log("Formations integration en attente", this.formationsIntegrationEnAttente);
          
          // Filtrer les formations POLYCOMPETENCES (inchangé)
          this.formationsCompletes = this.formations.filter(f => 
            f.sousTypeFormation === 'POLYCOMPETENCE'
          );
          
          this.loading = false;
          this.updateCalendarEvents();
        },
        (error) => {
          console.error('Erreur lors de la récupération des formations', error);
          this.loading = false;
        }
      );
    });
  }




onAnnulerFormation(formation: FormationDto) {
  const id = formation.id;
  if (id == null) {
    console.error("Impossible d’annuler : l’ID de la formation est absent");
    return;
  }

  this.confirmationService.confirm({
    message: `Êtes-vous sûr de vouloir annuler la formation "${formation.titre}" ?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Oui',
    rejectLabel: 'Non',
    acceptButtonStyleClass: 'p-button-success',  // bouton vert
  rejectButtonStyleClass: 'p-button-danger',   // bouton rouge
    accept: () => {
      this.formationservice.annulerFormation(id).subscribe({
        next: updated => {
          formation.annuler = updated.annuler;
          formation.dateAnnulation = updated.dateAnnulation;
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Annulé', 
            detail: `La formation "${formation.titre}" a été annulée.` 
          });
          this.loadFormations();
        },
        error: err => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible d’annuler la formation.'
          });
        }
      });
    }
  });
}
  




// convertir un objet brut probablement reçu depuis un backend via une API en un objet bien typé du modèle FormationDt
  private transformToFormationDto(data: any): FormationDto {
    return {
      id: data.id,
      titre: data.titre,
      commentaire: data.commentaire,
      description: data.description,
      typeFormation: data.typeFormation,
      sousTypeFormation: data.sousTypeFormation,
      dateDebutPrevue: data.dateDebutPrevue,
      dateFinPrevue: data.dateFinPrevue,
      responsableEvaluationId: data.responsableEvaluationId,
      responsableEvaluationExterne: data.responsableEvaluationExterne,
      employeIds: data.employeIds || [],
      responsableEvaluation: data.responsableEvaluation,
      employes: data.employes,
      fichierPdf: data.fichierPdf,
      organisateurId: data.organisateurId,
      titrePoste: data.titrePoste,
      valide: data.valide,
      probleme: data.probleme,
      annuler: data.annuler,
      dateAnnulation: data.dateAnnulation, 
      entete: data.entete, 
     
      periodes: data.periodes ? data.periodes.map((periode: any) => ({
        dateDebut: periode.dateDebut,
        dateFin: periode.dateFin,
        formateur: periode.formateur,
        programme: periode.programme
      } as PeriodeFormationDto)) : []
    
    };
  }




  // Variables pour gérer les périodes
periodesModif: PeriodeFormationDto[] = [];

isPolyOrIntegrationModif(): boolean {
  return this.modificationForm.get('sousTypeFormation')?.value === 'INTEGRATION' || 
         this.modificationForm.get('sousTypeFormation')?.value === 'POLYVALENCE';
}

peutAjouterPeriodeModif(): boolean {
  const poste = this.modificationForm.get('titrePoste')?.value;
  return this.isPolyOrIntegrationModif() && 
         poste?.lesProgrammesDeFormation?.length &&
         this.periodesModif.length < poste.lesProgrammesDeFormation.length;
}

ajouterPeriodeModif(): void {
  this.periodesModif.push({
    dateDebut: '',
    dateFin: '',
    formateur: '',
    programme: ''
  });
}

supprimerPeriodeModif(index: number): void {
  this.periodesModif.splice(index, 1);
}
  // Méthode séparée pour la mise à jour du calendrier
  updateCalendarEvents(): void {
    this.calendarOptions.events = this.formations.map((formation) => ({
      title: formation.titre,
      start: new Date(formation.dateDebutPrevue), // Notez le changement de dateDebutPrevue à date_debut_prevue
      end: new Date(formation.dateFinPrevue),    // Notez le changement de dateFinPrevue à date_fin_prevue
    }));
    
    // Forcer la mise à jour du calendrier
    setTimeout(() => {
      this.calendarOptions = { ...this.calendarOptions };
    }, 0);
  }

  onReactiverFormation(formation: FormationDto) {
    if (formation.id !== undefined) {  // Vérifier si l'ID est défini
      this.formationservice.reactiverFormation(formation.id).subscribe({
        next: (reactivatedFormation: FormationDto) => {
          const index = this.formationsIntegrationAnnulees.findIndex(f => f.id === reactivatedFormation.id);
          if (index !== -1) {
            this.formationsIntegrationAnnulees[index] = reactivatedFormation;
          }
          this.messageService.add({severity: 'success', summary: 'Réactivation réussie', detail: 'La formation a été réactivée avec succès.'});
          this.loadFormations();
        },
        error: (err) => {
          this.messageService.add({severity: 'error', summary: 'Erreur', detail: 'La réactivation de la formation a échoué.'});
        }
      });
    } else {
      // Si l'ID est undefined, on peut afficher un message d'erreur ou gérer autrement
      this.messageService.add({severity: 'error', summary: 'Erreur', detail: 'ID de la formation invalide.'});
    }
  }
  
  
  base64ToFile(base64: string, filename: string): File {
    const byteCharacters = atob(base64); // Décoder Base64
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' }); // Créer un Blob
    return new File([blob], filename, { type: 'application/pdf' });
  }
  isEmployeeSelected(employeeCode: string): boolean {
    const selectedEmployees = this.formationForm.get('selectedCities')?.value || [];
    return selectedEmployees.includes(employeeCode);
  }

  isPolycompetence(): boolean {
    return this.formationForm.get('sousTypeFormation')?.value?.toLowerCase() === 'polycompetence';
  }

  onEmployeSelectionChange(selectedIds: number[]) {
    // Mettre à jour la liste des employés sélectionnés
    this.selectedEmployes = this.cities
      .filter(city => selectedIds.includes(city.code))
      .map(emp => ({
        ...emp,
        resultat: emp.resultat || null // Conserver le résultat existant si déjà défini
      }));
  }
  
  updateEmployeResultat(employe: any, resultat: string) {
    employe.resultat = resultat;
    // Vous pouvez ajouter ici une logique supplémentaire si nécessaire
  }


  
 // Fonction pour afficher nom et matricule
 customFilter(event: any, option: any): boolean {
  const searchValue = event.query.toLowerCase();
  const name = option.name.toLowerCase();
  const matricule = option.matricule.toString().toLowerCase();

  // Rechercher dans le nom et le matricule
  return name.includes(searchValue) || matricule.includes(searchValue);
}
getFormationStatus(dateFinPrevue: Date): string {
  const currentDate = new Date();
  
  // Si la date de fin est dans le futur, afficher "En cours"
  if (new Date(dateFinPrevue) > currentDate) {
    return 'En cours';  // premier tag
  } else {
    return 'Terminé'; // deuxième tag
  }
}

getStatusSeverity(dateFinPrevue: Date): 'success' | 'info' {
  const currentDate = new Date();

  // Si la date de fin est dans le futur, retourner 'info'
  if (new Date(dateFinPrevue) > currentDate) {
    return 'info'; // bleu clair (en cours)
  } else {
    return 'success'; // vert (terminé)
  }
}



onSousTypeChange(sousType: string | null) {
  if (!sousType) return;
  
  const sousTypeLower = sousType.toLowerCase();
  
  if (sousTypeLower === 'polyvalence' || sousTypeLower === 'integration') {
    this.formationForm.get('typeFormation')?.setValue('INTERNE');
    this.formationForm.get('typeFormation')?.disable();
    
    this.formationForm.get('responsableType')?.setValue('INTERNE');
    this.formationForm.get('responsableType')?.disable();
    
    this.selectedResponsableType = 'INTERNE';
    
    // Activer les champs spécifiques à INTEGRATION/POLYVALENCE
    this.formationForm.get('enteteId')?.enable();
    this.formationForm.get('titrePoste')?.enable();
  } else {
    // Réinitialiser les champs pour POLYCOMPETENCE
    this.formationForm.get('typeFormation')?.enable();
    this.formationForm.get('responsableType')?.enable();
    
    // Désactiver et réinitialiser les champs spécifiques à INTEGRATION/POLYVALENCE
    this.formationForm.get('enteteId')?.disable();
    this.formationForm.get('enteteId')?.setValue(null);
    this.formationForm.get('titrePoste')?.disable();
    this.formationForm.get('titrePoste')?.setValue(null);
    
    // Réinitialiser les périodes
    this.nombrePartiesArray = [];
    this.creerControlesParties();
  }
}
shouldShowPosteSection(): boolean {
  const sousType = this.formationForm.get('sousTypeFormation')?.value?.toLowerCase();
  return !['polycompetence', 'sensibilisation'].includes(sousType);
}


getSeverity(resultat: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
  switch (resultat) {
    case 'REUSSI':
      return 'success'; // Vert
    case 'ECHEC':
      return 'danger'; // Rouge
    case 'PROGRAMME_COMPLEMENTAIRE':
      return 'warn'; // Orange (utilisez 'warn' au lieu de 'warning')
    default:
      return 'info'; // Bleu (par défaut)
  }
}

// Méthode pour obtenir le libellé du résultat
getResultatLabel(resultat: string): string {
  const option = this.resultatOptions.find((opt) => opt.value === resultat);
  return option ? option.label : 'non évalué';
}
checkBeforeEdit(employe: any) {
  if ((this.selectedFormation?.sousTypeFormation === 'INTEGRATION' || 
       this.selectedFormation?.sousTypeFormation === 'POLYVALENCE') &&
      employe.resultat === 'REUSSI') {
    
    this.messageService.add({
      severity: 'warn',
      summary: 'Action impossible',
      detail: 'Vous ne pouvez pas modifier ce résultat car l\'employé a déjà acquis les compétences de ce poste',
      life: 5000  // Durée d'affichage en ms
    });
    return;
  }

  if (employe.resultat === 'PROGRAMME_COMPLEMENTAIRE') {
    this.confirmationService.confirm({
      message: 'Vous ne pouvez pas modifier ce résultat car une formation complémentaire a déjà été lancée pour cet employé',
      header: 'Modification impossible',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'OK',
      rejectVisible: false
    });
    return;
  }
  this.resetResultat(employe);
}
showDocumentColumn(): boolean {
  return this.selectedFormation?.valide && 
         (this.selectedFormation?.sousTypeFormation === 'POLYVALENCE' || 
          this.selectedFormation?.sousTypeFormation === 'INTEGRATION');
}
isConfirming : boolean = false;
isConfirmationOpen: boolean = false;

updateResultat(formationId: number, employeId: number, resultat: string, employe: any) {
  // Vérifier si c'est une formation POLYCOMPETENCE
  if (this.selectedFormation?.sousTypeFormation === 'POLYCOMPETENCE') {
    // Pour les formations polycompétences, mettre à jour directement sans confirmation
    this.formationservice.ajouterResultatFormation(formationId, employeId, resultat,false).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Résultat mis à jour avec succès !',
        });
        employe.resultat = resultat;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de la mise à jour du résultat.',
        });
      },
    });
  }
  // Cas spécial pour INTEGRATION - affichage direct du dialogue
  else if (this.selectedFormation?.sousTypeFormation === 'INTEGRATION' && resultat === 'REUSSI') {
    this.showDirectionSiteDialog(formationId, employe);
  }
  // Cas normal pour les autres formations (y compris POLYVALANCE)
else if (resultat === 'REUSSI') {
    this.confirmationService.confirm({
        message: `Êtes-vous sûr que l'employé ${employe.nom} ${employe.prenom} a réussi cette formation ?`,
        header: 'Confirmation de réussite',
          acceptLabel: 'Oui',
  rejectLabel: 'Non',
        icon: 'pi pi-exclamation-triangle',
accept: () => {
  employe.tempResultat = 'REUSSI';

  setTimeout(() => {
    if (this.isConfirmationOpen) return; // Empêche une double ouverture
    this.isConfirmationOpen = true;

    this.confirmationService.confirm({
      message: `Voulez-vous passer cet employé à un autre poste comme poste actuel ?`,
      header: 'Changement de poste',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.isConfirmationOpen = false;
        this.showDirectionSiteDialog(formationId, employe);
      },
      reject: () => {
        this.isConfirmationOpen = false;

        this.formationservice.ajouterResultatFormation(formationId, employe.id, 'REUSSI',true).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Résultat mis à jour avec succès !',
            });

            setTimeout(() => {
              if (this.isConfirmationOpen) return;
              this.isConfirmationOpen = true;

              this.confirmationService.confirm({
                message: `L'employé ${employe.nom} ${employe.prenom} reste à son poste actuel mais a bien réussi cette formation et peut l'exercer.`,
                header: 'Information',
                icon: 'pi pi-check-circle',
                acceptLabel: 'OK',
                rejectVisible: false,
                accept: () => {
                  this.isConfirmationOpen = false;
                  employe.resultat = 'REUSSI';
                  employe.tempResultat = null;
                }
              });
            }, 300);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Une erreur est survenue lors de la mise à jour du résultat.'
            });
          }
        });
      }
    });
  }, 300);
}
,

        reject: () => {
            employe.resultat = null;
            employe.tempResultat = null;
        }
    });
}   else if (resultat === 'PROGRAMME_COMPLEMENTAIRE') {
    this.confirmationService.confirm({
      message: `Vous avez sélectionné "Programme Complémentaire" pour ${employe.nom} ${employe.prenom}. Souhaitez-vous créer une nouvelle formation pour cet employé ?`,
      header: 'Programme Complémentaire',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.prepareComplementaryProgramForm(employe, this.selectedFormation);
        this.displayComplementaryProgramDialog = true;      },
      reject: () => {
        // Ne rien faire - l'utilisateur a annulé la sélection
        employe.tempResultat = null; // Réinitialiser la sélection temporaire
      }
    });
  }
  else {
    // Pour les autres résultats (ECHEC, PROGRAMME_COMPLEMENTAIRE)
    this.formationservice.ajouterResultatFormation(formationId, employeId, resultat,false).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Résultat mis à jour avec succès !',
        });
        employe.resultat = resultat;
        employe.tempResultat = null;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de la mise à jour du résultat.',
        });
      },
    });
  }
}





prepareComplementaryProgramForm(employe: any, formation: any) {
  this.selectedEmployeeForComplementary = employe;
  
  // Trouver le poste correspondant
  const currentPoste = this.postes.find(poste => poste.titre === formation.titrePoste);
  
  // Initialiser les périodes si nécessaire
 
    this.periodesComplementary = formation.periodes.map((periode: any) => ({
      dateDebut:new Date(periode.dateDebut),
      dateFin: new Date(periode.dateFin),
      formateur: periode.formateur || '',
      programme: periode.programme || ''
    }));
    console.log(this.periodesComplementary);  // Ajoute cette ligne pour voir les périodes dans la console
  
  
  
  // Trouver l'entête de la formation originale
  const currentEntete = formation.entete;

  this.complementaryProgramForm.patchValue({
    titre: `Programme complémentaire - ${formation.titre}`,
    description: formation.description,
    typeFormation: formation.typeFormation,
    sousTypeFormation: formation.sousTypeFormation,
    dateDebutPrevue: new Date(),
    dateFinPrevue: new Date(new Date().setDate(new Date().getDate() + 7)),
    responsableType: 'INTERNE',
    responsableEvaluationId: formation.responsableEvaluation?.id || null,
    employeIds: [employe.id],
    titrePoste: currentPoste || null,
    enteteId: currentEntete || null
  });

  this.selectedEnteteComplementary = currentEntete;
}
onPosteSelectcomp(event: any) {
  this.posteSelectionne = event.value;
  console.log('Poste sélectionné:', this.posteSelectionne); // Pour vérification
}
submitComplementaryProgram() {
  if (this.complementaryProgramForm.invalid) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Veuillez remplir tous les champs obligatoires'
    });
    return;
  }

  const formValues = this.complementaryProgramForm.getRawValue();
  const rhId = Number(localStorage.getItem('RHID'));

  // Préparer les périodes valides
  const periodesValides = this.periodesComplementary
    .filter(p => p.dateDebut && p.dateFin && p.formateur && p.programme)
    .map(p => ({
      dateDebut: this.formatDate(p.dateDebut),
      dateFin: this.formatDate(p.dateFin),
      formateur: p.formateur,
      programme: p.programme
    }));

  const formData = new FormData();
  formData.append('titre', formValues.titre);
  formData.append('description', formValues.description);
  formData.append('typeFormation', formValues.typeFormation);
  formData.append('sousTypeFormation', formValues.sousTypeFormation);
  formData.append('dateDebutPrevue', formValues.dateDebutPrevue.toISOString().split('T')[0]);
  formData.append('dateFinPrevue', formValues.dateFinPrevue.toISOString().split('T')[0]);
  formData.append('organisateurId', rhId.toString());
  
  if (formValues.enteteId) {
    formData.append('enteteId', formValues.enteteId.id.toString());
  }

  if (periodesValides.length > 0) {
    formData.append('periodes', JSON.stringify(periodesValides));
  }

  if (formValues.responsableEvaluationId) {
    formData.append('responsableEvaluationId', formValues.responsableEvaluationId.toString());
  }

  formValues.employeIds.forEach((id: number) => {
    formData.append('employeIds', id.toString());
  });

  if (formValues.titrePoste) {
    formData.append('titrePoste', formValues.titrePoste.titre);
  }

  this.formationservice.creerFormation(formData).subscribe({
    next: (formationId) => {
      // 1. Enregistrer le résultat pour l'employé
      this.formationservice.ajouterResultatFormation(
        this.selectedFormation.id, 
       this.selectedEmployeeForComplementary.id, // ← 👈 pas selectedEmploye ici !
  'PROGRAMME_COMPLEMENTAIRE',false
      ).subscribe({
        next: () => {
          // 2. Utilisez this.posteSelectionne
          if (this.posteSelectionne?.id) {
            console.log('Ajout de la paire:', {
              formationId: formationId,
              poste: this.posteSelectionne  // Envoyez l'objet complet si nécessaire
            });
            
            this.formationPosteService.addPair(formationId, this.posteSelectionne.id).subscribe({
              next: () => {
                  this.selectedEmploye.resultat = 'PROGRAMME_COMPLEMENTAIRE';
          this.selectedEmploye.tempResultat = null;
                console.log('Paire formation-poste ajoutée avec succès');
              
                this.displayFormationPosteList();
                this.showSuccessMessage();

                this.closeComplementaryDialog();
                this.confirmationService.close();
   
this.cdRef.detectChanges();
               
              },
              error: (posteError) => {
                console.error('Erreur ajout paire formation-poste:', posteError);
                this.showPartialSuccessMessage();
              }
            });
          } else {
            console.warn('Aucun poste sélectionné');
            this.showSuccessMessage();
            this.closeComplementaryDialog();
          
            this.loadFormations();
          }
        },
        error: (resultatError) => {
          console.error('Erreur enregistrement résultat:', resultatError);
          this.showPartialSuccessMessage();
        }
      });
    },
    error: (formationError) => {
      console.error('Erreur création programme:', formationError);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: formationError.error?.message || 'Échec de la création du programme'
      });
    }
  });
}

// Méthodes utilitaires pour les messages
private showSuccessMessage() {
  this.messageService.add({
    severity: 'success',
    summary: 'Succès',
    detail: 'Programme complémentaire créé avec succès'
  });
  
}

private showPartialSuccessMessage() {
  this.messageService.add({
    severity: 'warn',
    summary: 'Avertissement',
    detail: 'Le programme a été créé mais certaines opérations secondaires ont échoué'
  });
}

private handleSuccess() {
  this.messageService.add({
    severity: 'success',
    summary: 'Succès',
    detail: 'Programme complémentaire créé avec succès'
  });
  this.displayComplementaryProgramDialog = false;

  this.loadFormations();
}

private handleError(error: any) {
  this.messageService.add({
    severity: 'error',
    summary: 'Erreur',
    detail: error.error || 'Erreur lors de la création du programme complémentaire'
  });
}
// Afficher le dialogue de sélection direction/site
showDirectionSiteDialog(formationId: number, employe: any) {
  this.selectedEmploye = employe;
  
  // Récupérer l'ID du poste associé à la formation
  this.formationPosteService.getPosteIdByFormationId(formationId).subscribe({
    next: (posteId) => {
      // Récupérer les détails complets du poste
      this.posteService.getPosteById(posteId).subscribe({
        next: (poste) => {
          this.selectedPoste = poste;
          
          // Charger les directions pour ce poste
          this.posteService.getDirectionsByPosteId(posteId).subscribe({
            next: (directions) => {
              this.directions = directions;
              this.displayPosteAssignmentDialog = true;
            },
            error: (err) => {
              console.error('Erreur directions:', err);
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger les directions'
              });
              // Annuler le résultat temporaire en cas d'erreur
              employe.tempResultat = null;
            }
          });
        },
        error: (err) => {
          console.error('Erreur poste:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de récupérer les détails du poste'
          });
          employe.tempResultat = null;
        }
      });
    },
    error: (err) => {
      console.error('Erreur poste ID:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de récupérer le poste associé'
      });
      employe.tempResultat = null;
    }
  });
}

// Gestion de la sélection de direction
onDirectionSelect(event: any) {
  this.selectedDirection = event.value;
  this.selectedSite = null; // Réinitialiser la sélection de site
  
  if (this.selectedDirection) {
    // Charger les sites pour la direction sélectionnée
    this.directionservice.getSitesByDirection(this.selectedDirection.id).subscribe({
      next: (sites) => {
        this.sites = sites;
      },
      error: (err) => {
        console.error('Erreur sites:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les sites'
        });
      }
    });
  }
}

confirmAssignment() {
  // First check all required selections with proper null checks
  if (!this.selectedDirection?.id || !this.selectedSite?.id || 
      !this.selectedEmploye?.id || !this.selectedPoste?.id || 
      !this.selectedFormation?.id) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez sélectionner tous les éléments requis'
    });
    return;
  }

  // Now TypeScript knows these values can't be undefined
  const employeId = this.selectedEmploye.id;
  const posteId = this.selectedPoste.id;
  const directionId = this.selectedDirection.id;
  const siteId = this.selectedSite.id;
  const formationId = this.selectedFormation.id;

  console.log('IDs sélectionnés:', {
    employeId,
    posteId,
    directionId,
    siteId
  });

  // Appel pour changer le poste de l'employé
  this.formationservice.changerPosteEmploye(
    employeId,
    posteId,
    directionId,
    siteId
  ).subscribe({
    next: (posteResponse) => {
      // Si le changement de poste réussit, on met à jour le résultat de formation
      this.formationservice.ajouterResultatFormation(
        formationId, 
        employeId, 
        'REUSSI',false
      ).subscribe({
        next: (formationResponse) => {
          // Mettre à jour l'interface seulement après les deux succès
          this.selectedEmploye.resultat = 'REUSSI';
          this.selectedEmploye.tempResultat = null;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Affectation et résultat mis à jour avec succès !'
          });

          // Fermer le dialogue
          this.displayPosteAssignmentDialog = false;
          this.selectedDirection = null;
          this.selectedSite = null;
        },
        error: (formationErr) => {
          console.error('Erreur lors de la mise à jour du résultat:', formationErr);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: "Erreur lors de l'enregistrement du résultat"
          });
        }
      });
    },
    error: (posteErr) => {
      console.error('Erreur lors du changement de poste:', posteErr);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: "Erreur lors du changement de poste"
      });
    }
  });
}
// Annulation du dialogue d'affectation
onPosteAssignmentDialogHide() {
  // Réinitialiser le résultat temporaire si l'utilisateur ferme sans confirmer
  if (this.selectedEmploye?.tempResultat) {
    this.selectedEmploye.tempResultat = null;
  }
  this.selectedDirection = null;
  this.selectedSite = null;
}


// Réinitialiser le résultat (pour permettre une nouvelle sélection)
resetResultat(employe: any) {
  employe.resultat = null;
  employe.tempResultat = null;
}
 

 // Méthode qui met à jour le radio sélectionné pour un employé donné
 editingEmployee: { [key: string]: boolean } = {};
 onRadioChange(employeeCode: string, selectedValue: string): void {
  this.selectedRadio[employeeCode] = selectedValue;
  this.editingEmployee[employeeCode] = false; // Masquer les boutons après sélection
  console.log(`Employé ${employeeCode} a sélectionné : ${selectedValue}`);
}

editSelection(employeeCode: string): void {
  this.editingEmployee[employeeCode] = true; // Afficher à nouveau les boutons radio
}

// Variables pour la modification
selectedResponsableTypeModif: string = '';
selectedEmployeesModif: any[] = [];
selectedRadioModif: { [key: string]: string } = {};
editingEmployeeModif: { [key: string]: boolean } = {};

// Méthodes pour la modification
isPolycompetenceModif(): boolean {
  const result = this.selectedFormation?.sousTypeFormation === 'POLYCOMPETENCE';
  console.log('isPolycompetenceModif:', result);
  return result;
}


shouldShowPosteSectionModif(): boolean {
  const sousType = this.modificationForm.get('sousTypeFormation')?.value;
  return !['polycompetence', 'sensibilisation'].includes(sousType?.toLowerCase());
}

onSousTypeChangeModif(value: string | null) {
  if (!value) return;

  const sousTypeLower = value.toLowerCase();

  // Désactiver le champ sousTypeFormation si POLYCOMPETENCE
  if (sousTypeLower === 'polycompetence') {
    this.modificationForm.get('sousTypeFormation')?.disable();
  } else {
    this.modificationForm.get('sousTypeFormation')?.enable();
  }

  // Logique pour INTEGRATION/POLYVALENCE
  if (sousTypeLower === 'integration' || sousTypeLower === 'polyvalence') {
    this.modificationForm.get('typeFormation')?.setValue('INTERNE');
    this.modificationForm.get('typeFormation')?.disable();

    this.modificationForm.get('responsableType')?.setValue('INTERNE');
    this.modificationForm.get('responsableType')?.disable();

    this.selectedResponsableTypeModif = 'INTERNE';
  } else {
    this.modificationForm.get('typeFormation')?.enable();
    this.modificationForm.get('responsableType')?.enable();
  }
}

onResponsableTypeChangeModif(value: string) {
  this.selectedResponsableTypeModif = value;
}

onRadioChangeModif(employeeCode: string, selectedValue: string): void {
  this.selectedRadioModif[employeeCode] = selectedValue;
  this.editingEmployeeModif[employeeCode] = false;
}

editSelectionModif(employeeCode: string): void {
  this.editingEmployeeModif[employeeCode] = true;
}

onEmployeSelectionChangeModif(selectedCodes: number[]) {
  // Mettre à jour la liste des employés sélectionnés
  this.selectedEmployeesModif = selectedCodes
    .map(code => {
      const cityEmp = this.cities.find(c => c.code === code);
      return cityEmp ? {
        ...cityEmp,
        name: cityEmp.name || `${cityEmp.nom} ${cityEmp.prenom}`
      } : null;
    })
    .filter(Boolean);

  // Gérer les résultats et l'état d'édition
  selectedCodes.forEach(code => {
    if (!this.selectedRadioModif[code]) {
      this.selectedRadioModif[code] = ''; // ou une valeur par défaut
    }

    if (this.editingEmployeeModif[code] === undefined) {
      this.editingEmployeeModif[code] = true; // Montre les radios pour les nouveaux
    }
  });

  // Nettoyer les données des employés désélectionnés
  Object.keys(this.selectedRadioModif).forEach(codeStr => {
    const code = Number(codeStr);
    if (!selectedCodes.includes(code)) {
      delete this.selectedRadioModif[code];
    }
  });

  Object.keys(this.editingEmployeeModif).forEach(codeStr => {
    const code = Number(codeStr);
    if (!selectedCodes.includes(code)) {
      delete this.editingEmployeeModif[code];
    }
  });
}

displayCommentDialog: boolean = false;
currentFormation: any;
newComment: string = '';
 // Méthode pour ouvrir le dialogue
 openCommentDialog(formation: any) {
  this.currentFormation = formation;
  this.newComment = formation.commentaire || '';
  this.displayCommentDialog = true;
}



// Le reste de vos méthodes existantes...
// Méthode pour déterminer si la section poste doit être affichée
shouldShowPosteSectionComplementary(): boolean {
  const sousType = this.complementaryProgramForm.get('sousTypeFormation')?.value;
  return !['polycompetence', 'sensibilisation'].includes(sousType?.toLowerCase());
}

// Méthode pour gérer la sélection d'un poste
onPosteSelectComplementary(event: any) {
  const selectedPoste = event.value;
  if (selectedPoste && selectedPoste.document) {
    this.loadComplementaryPdf(selectedPoste.document);
  } else {
    this.complementaryPdfUrl = null;
  }
}
private loadComplementaryPdf(document: string | File) {
  if (typeof document === 'string') {
    // Handle Base64 string
    const byteCharacters = atob(document);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const fileBlob = new Blob([byteArray], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(fileBlob);
    this.complementaryPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
  } else if (document instanceof File) {
    // Handle File object
    const pdfUrl = URL.createObjectURL(document);
    this.complementaryPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
  }
}
closeComplementaryDialog() {
  this.displayComplementaryProgramDialog = false;
  this.complementaryProgramForm.reset();
  this.periodesComplementary = [];
  this.selectedEnteteComplementary = null;
  
  // Nettoyer l'URL du PDF si nécessaire
  if (this.complementaryPdfUrl) {
    const unsafeUrl = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.complementaryPdfUrl);
    if (unsafeUrl) {
      URL.revokeObjectURL(unsafeUrl);
    }
    this.complementaryPdfUrl = null;
  }
}


// Ajoutez cette propriété à votre composant
complementaryPdfUrl: SafeResourceUrl | null = null;



// Propriétés à ajouter
nombrePartiesArray: number[] = []; // Pour suivre le nombre de parties
datePartieControls: string[] = []; // Pour gérer les contrôles dynamiques

// Méthode pour vérifier le type de formation
isPolyOrIntegration(): boolean {
  const type = this.formationForm.get('sousTypeFormation')?.value;
  return type === 'POLYVALENCE' || type === 'INTEGRATION';
}

updateDateFields(): void {
  // Supprimer tous les contrôles existants
  for (let i = 0; i < 10; i++) {
    ['dateDebutPartie', 'dateFinPartie', 'formateurPartie', 'programmePartie'].forEach(prefix => {
      if (this.formationForm.get(`${prefix}${i}`)) {
        this.formationForm.removeControl(`${prefix}${i}`);
      }
    });
  }

  // Réinitialiser le tableau
  this.nombrePartiesArray = [];

  // Vérifier si un poste est sélectionné
  if (this.posteSelectionne && this.posteSelectionne.lesProgrammesDeFormation) {
    const lesProgrammes = this.posteSelectionne.lesProgrammesDeFormation;
    const nbProgrammes = lesProgrammes.length;

    if (nbProgrammes > 0) {
      this.nombrePartiesArray = Array.from({ length: nbProgrammes }, (_, i) => i);

      this.nombrePartiesArray.forEach(i => {
        this.formationForm.addControl(`dateDebutPartie${i}`, new FormControl('', Validators.required));
        this.formationForm.addControl(`dateFinPartie${i}`, new FormControl('', Validators.required));
        this.formationForm.addControl(`formateurPartie${i}`, new FormControl('', Validators.required));

        const programmeInitial = lesProgrammes[i] || '';
        this.formationForm.addControl(
          `programmePartie${i}`,
          new FormControl(programmeInitial, Validators.required)
        );

        // Ajouter le validateur personnalisé pour la date de fin
        const dateFinCtrl = this.formationForm.get(`dateFinPartie${i}`);
        if (dateFinCtrl) {
          dateFinCtrl.setValidators([
            Validators.required,
            this.validateDateFinPartie(i),
            this.validateDateOverlap(i)
          ]);
          dateFinCtrl.updateValueAndValidity();
        }
      });
    }
  }
}

// Validateur personnalisé pour vérifier si une date se chevauche avec les autres parties
// Validateur personnalisé pour vérifier si une date se chevauche avec les autres parties
validateDateOverlap(index: number) {
  return (control: AbstractControl) => {
    const dateFin = control.value;

    // Vérification que les contrôles existent avant d'y accéder
    const dateDebutPartieCtrl = this.formationForm.get(`dateDebutPartie${index}`);
    const dateDebutPartie = dateDebutPartieCtrl ? dateDebutPartieCtrl.value : null;

    if (!dateDebutPartie) {
      return null; // Si la date de début de cette partie est null, on ne fait pas la validation
    }

    for (let i = 0; i < this.nombrePartiesArray.length; i++) {
      if (i !== index) {
        // Vérification que les contrôles existent avant d'y accéder
        const dateDebutAutrePartieCtrl = this.formationForm.get(`dateDebutPartie${i}`);
        const dateFinAutrePartieCtrl = this.formationForm.get(`dateFinPartie${i}`);

        const dateDebutAutrePartie = dateDebutAutrePartieCtrl ? dateDebutAutrePartieCtrl.value : null;
        const dateFinAutrePartie = dateFinAutrePartieCtrl ? dateFinAutrePartieCtrl.value : null;

        if (dateDebutAutrePartie && dateFinAutrePartie) {
          // Vérifier le chevauchement des périodes
          if (dateDebutPartie < dateFinAutrePartie && dateFin > dateDebutAutrePartie) {
            return { dateOverlap: true }; // La période chevauche une autre partie
          }
        }
      }
    }
    return null; // Aucun chevauchement
  };
}






// Variables de classe
nombrePartiesInitial: number = 0;

initialiserParties() {
  // Vérifier d'abord si un poste est sélectionné et a des programmes
  if (!this.posteSelectionne || !this.posteSelectionne.lesProgrammesDeFormation) {
    this.nombrePartiesInitial = 0;
    this.nombrePartiesArray = [];
    return;
  }

  const nbProgrammes = this.posteSelectionne.lesProgrammesDeFormation.length;
  console.log(`Initialisation des parties, nombre de programmes : ${nbProgrammes}`);
  
  // Initialiser les variables
  this.nombrePartiesInitial = nbProgrammes;
  this.nombrePartiesArray = Array.from({ length: nbProgrammes }, (_, i) => i);

  console.log('Tableau des parties initialisées :', this.nombrePartiesArray);
  console.log('Nombre initial de parties :', this.nombrePartiesInitial);

  this.creerControlesParties();
}
creerControlesParties() {
  // Supprimer les anciens contrôles
  for (let i = 0; i < 10; i++) {
    ['dateDebutPartie', 'dateFinPartie', 'formateurPartie', 'programmePartie'].forEach(prefix => {
      if (this.formationForm.get(`${prefix}${i}`)) {
        console.log(`Suppression du contrôle ${prefix}${i}`);
        this.formationForm.removeControl(`${prefix}${i}`);
      }
    });
  }

  // Étape 1 : Créer tous les contrôles SANS le validateur personnalisé
  this.nombrePartiesArray.forEach(i => {
    this.formationForm.addControl(`dateDebutPartie${i}`, new FormControl('', Validators.required));
    this.formationForm.addControl(`dateFinPartie${i}`, new FormControl('', Validators.required));
    this.formationForm.addControl(`formateurPartie${i}`, new FormControl('', Validators.required));
  
    const programmeInitial = this.posteSelectionne?.lesProgrammesDeFormation?.[i] || '';
    this.formationForm.addControl(`programmePartie${i}`, new FormControl(programmeInitial, Validators.required));
  
    // Ajouter le validateur personnalisé pour la date de fin
    const dateFinCtrl = this.formationForm.get(`dateFinPartie${i}`);
    if (dateFinCtrl) {
      dateFinCtrl.setValidators([
        Validators.required,
        this.validateDateFinPartie(i)
      ]);
      dateFinCtrl.updateValueAndValidity();
    }
  
    console.log(`Contrôles créés pour la partie ${i}`);
  });
  

  // Étape 2 : Ajouter les validateurs personnalisés APRÈS que tous les champs existent
  this.nombrePartiesArray.forEach(i => {
    const dateDebutCtrl = this.formationForm.get(`dateDebutPartie${i}`);
    const dateFinCtrl = this.formationForm.get(`dateFinPartie${i}`);
  
    if (dateDebutCtrl && dateFinCtrl) {
      dateDebutCtrl.valueChanges.subscribe(() => {
        console.log(`Changement dans dateDebutPartie${i}, mise à jour de dateFinPartie${i}`);
        dateFinCtrl.updateValueAndValidity();
      });
    }
  });
  

  this.nombrePartiesArray.forEach(i => {
    const dateFinCtrl = this.formationForm.get(`dateFinPartie${i}`);
    if (dateFinCtrl) {
      dateFinCtrl.updateValueAndValidity({ onlySelf: true, emitEvent: true });
    }
  });
}




// Vérifie si on peut ajouter une partie
peutAjouterPartie(): boolean {
  // Vérifier d'abord si un poste est sélectionné
  if (!this.posteSelectionne || !this.posteSelectionne.lesProgrammesDeFormation) {
    return false;
  }

  const maxParties = this.posteSelectionne.lesProgrammesDeFormation.length;
  const canAdd = this.nombrePartiesArray.length < maxParties;
  
  console.log(`Peut ajouter partie? Max: ${maxParties}, Actuel: ${this.nombrePartiesArray.length}, Résultat: ${canAdd}`);
  
  return canAdd;
}
ajouterPartie() {
  if (this.peutAjouterPartie()) {
    const nouvellePartieIndex = this.nombrePartiesArray.length;
    this.nombrePartiesArray.push(nouvellePartieIndex);
    
    // Ajouter les nouveaux contrôles avec la validation personnalisée
    this.formationForm.addControl(`dateDebutPartie${nouvellePartieIndex}`, new FormControl('', Validators.required));
    this.formationForm.addControl(`dateFinPartie${nouvellePartieIndex}`, new FormControl('', [
      Validators.required,
      this.validateDateFinPartie(nouvellePartieIndex)  // Validation personnalisée
    ]));
    this.formationForm.addControl(`formateurPartie${nouvellePartieIndex}`, new FormControl('', Validators.required));
    this.formationForm.addControl(`programmePartie${nouvellePartieIndex}`, new FormControl('', Validators.required));
    
    // Mettre à jour la validité de dateFinPartie lorsque dateDebutPartie change
    this.formationForm.get(`dateDebutPartie${nouvellePartieIndex}`)?.valueChanges.subscribe(() => {
      this.formationForm.get(`dateFinPartie${nouvellePartieIndex}`)?.updateValueAndValidity();
    });
  }
}



// Supprime une partie
supprimerPartie(index: number) {
  if (this.nombrePartiesArray.length > 1) {
    // Supprimer les contrôles associés
    ['dateDebutPartie', 'dateFinPartie', 'formateurPartie', 'programmePartie'].forEach(prefix => {
      this.formationForm.removeControl(`${prefix}${index}`);
    });
    
    // Réindexer les parties restantes
    this.nombrePartiesArray = this.nombrePartiesArray.filter(i => i !== index);
    
    // Réorganiser les index pour qu'ils soient séquentiels
    this.nombrePartiesArray = this.nombrePartiesArray.map((_, newIndex) => newIndex);
    
    // Recréer tous les contrôles avec les nouveaux index
    this.creerControlesParties();

  }
}


// Variables pour le dialogue
displayEnteteDialog: boolean = false;

newEntete: Entete = { 
  libelle: '',
  reference: '',
  numerorevision: 0,
  dateApplication: '' };

// Ouvrir le dialogue
closeEnteteDialog() {
  this.displayEnteteDialog = false;
  this.resetForm();
}

// Modify the openEnteteDialog method
openEnteteDialog(enteteToEdit?: Entete) {
  this.loadEntetes(); 
  if (enteteToEdit) {
    this.editingEntete = enteteToEdit;
    this.newEntete = { 
      ...enteteToEdit,
      dateApplication: enteteToEdit.dateApplication ? new Date(enteteToEdit.dateApplication) : new Date()
    };
  } else {
    this.resetForm();
  }
  this.displayEnteteDialog = true;
}


// Ajouter une nouvelle entête
addEntete() {
  if (!this.newEntete.libelle.trim()) return;
  
  this.enteteService.createEntete(this.newEntete).subscribe({
    next: (createdEntete) => {
      this.entetes.push(createdEntete);
      this.newEntete = {
        libelle: '',
        reference: '',
        numerorevision: 0,
        dateApplication: '' // ou une date initiale comme '2025-05-01'
      };
      
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Entête ajoutée avec succès'
      });
    },
    error: (err) => {
      console.error('Erreur lors de la création', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec de la création de l\'entête'
      });
    }
  });
}

updateEntete() {
  if (!this.editingEntete || !this.newEntete.libelle.trim()) return;
  
  const updatedEntete = {
    ...this.editingEntete,
    libelle: this.newEntete.libelle,
    reference: this.newEntete.reference,
    numerorevision: this.newEntete.numerorevision,
    dateApplication: this.newEntete.dateApplication
  };
  
  console.log(updatedEntete);
  this.enteteService.updateEntete(updatedEntete.id!, updatedEntete).subscribe({
    next: (entete) => {
      const index = this.entetes.findIndex(e => e.id === entete.id);
      if (index !== -1) {
        this.entetes[index] = entete;
      }
      this.resetForm();
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Entête modifiée avec succès'
      });
    },
    error: (err) => this.handleErrorr('Erreur lors de la modification', err)
  });
}
saveEntete() {
 if (
    !this.newEntete.libelle ||
    !this.newEntete.reference ||
    this.newEntete.numerorevision === null || this.newEntete.numerorevision === undefined ||
    !this.newEntete.dateApplication
  ) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Tous les champs sont obligatoires'
    });
    return;
  }

  if (this.editingEntete) {
    this.updateEntete();
  } else {
    this.addEntete();
  }
}
confirmDeleteEntete(entete: Entete) {
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir supprimer cette entête?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Oui',
    rejectLabel: 'Non',
    accept: () => {
      this.deleteEntete(entete);
    }
  });
}
selectedEntete: any;

onEnteteSelect(enteteId: any) {  // Changez le type en any ou number selon ce que renvoie le dropdown
  if (enteteId && enteteId.id) {  // Si l'option est un objet avec propriété id
    this.selectedEntete = this.entetes.find(e => e.id === enteteId.id);
  } else if (enteteId) {  // Si c'est directement l'ID
    this.selectedEntete = this.entetes.find(e => e.id === enteteId);
  } else {
    this.selectedEntete = null;
  }
  console.log('Entête sélectionnée:', this.selectedEntete);
}
// Méthode pour supprimer une entête
deleteEntete(entete: Entete) {
  // Implémentez votre logique de suppression ici
  // Par exemple, appel à un service API
  this.enteteService.deleteEntete(entete.id!).subscribe(
    () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Entête supprimée avec succès'
      });
      this.loadEntetes(); // Recharger la liste
    },
error => {
  this.messageService.add({
    severity: 'error',
    summary: 'Suppression impossible',
    detail: 'Cette entête est utilisée dans une ou plusieurs formations. Veuillez d’abord la supprimer ou la remplacer dans toutes les formations concernées.'
  });
}

  );
}
// Dans votre composant, avec les autres variables
isEditingEntete: boolean = false;
editingEntete: Entete | null = null;
// Éditer une entête
editEntete(entete: Entete) {
  this.openEnteteDialog(entete);
}

// Annuler l'édition
cancelEdit() {
  this.resetForm();
}

// Réinitialiser le formulaire
resetForm() {
  this.newEntete = {
    libelle: '',
    reference: '',
    numerorevision: 0,
    dateApplication: new Date() // Utilisez un objet Date directement
  };
  this.editingEntete = null;
}

// Gérer les erreurs
handleErrorr(summary: string, error: any) {
  console.error(summary, error);
  this.messageService.add({
    severity: 'error',
    summary: summary,
    detail: error.message || 'Une erreur est survenue'
  });
}


}
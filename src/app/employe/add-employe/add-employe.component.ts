import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { MenuItem, MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { Employe } from '../model/employe';
import { EmoloyeService } from '../service/emoloye.service';
import { StageComponent } from '../stage/stage.component';
import { DisciplineService } from '../service/discipline.service';

import { DisciplineComponent } from '../discipline/discipline.component';
import { Discipline } from '../model/Discipline';
import { ExperienceComponent } from '../experience/experience.component';
import { ExperienceService } from '../service/experience.service';
import {
  DxTabPanelModule,
  DxSelectBoxModule,
  DxTemplateModule,
} from 'devextreme-angular';
import { DxTabPanelTypes } from 'devextreme-angular/ui/tab-panel';
import { TabPanelItem } from '../../navbarexmpl/app.service';
import { SiteService } from '../../site/service/site.service';
import { Site } from '../../site/model/site';
import { PosteService } from '../../poste/service/poste.service';
import { DirectionService } from '../../direction/service/direction.service';
import { SelectButtonModule } from 'primeng/selectbutton';
import { PosteComponent } from '../poste/poste.component';
import { ListDiplomeComponent } from '../../diplome/list-diplome/list-diplome.component';

import { MenubarModule } from 'primeng/menubar';
import { CalendarModule } from 'primeng/calendar';

import { MessageModule } from 'primeng/message';

import { FormationEmployeComponent } from '../formation-employe/formation-employe.component';
import { EmployeCompetenceComponent } from '../../competence/employecompetence/employecompetence.component';

@Component({
  selector: 'app-add-employe',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    RouterModule,
    FileUploadModule,
    BadgeModule,
    ProgressBarModule,
    ButtonModule,
    ToastModule,
    SelectModule,
    DropdownModule,
    FormsModule,
    StageComponent,
    DisciplineComponent,
    PosteComponent,
    ExperienceComponent,
    DxTabPanelModule,
    DxSelectBoxModule,
    DxTemplateModule,
    DxTabPanelModule,
    SelectButtonModule,
    ListDiplomeComponent,
    CardModule,
    MessageModule,
    CalendarModule,
    MenubarModule,
    EmployeCompetenceComponent,
    FormationEmployeComponent,
  ],
  templateUrl: './add-employe.component.html',
  styleUrls: ['./add-employe.component.css'],
  providers: [MessageService],
})
export class AddEmployeComponent implements OnInit {
  addEmployeeForm!: FormGroup;
  selectedCity!: string;
  selectedSexe: { name: string } | null = null;
  totalSizePercent: number = 0;
  totalSize: number = 0;
  files: any[] = [];
  uploadedFiles: any[] = [];
  uploadProgress: number = 0;
  isCanceled: boolean = false;
  errorMessage!: string;
  showSuccessAlert: boolean = false;
  selectedEmployeId: number | null = null;
  disciplines: Discipline[] = [];
  selectedSiteId: number | null = null;
  sites: Site[] = [];
  directions: any[] = [];
  postes: any[] = [];

  items: MenuItem[] = []; // Menu items for the Menubar
  activeTab: string = 'modifier-employe'; // Active tab state

  constructor(
    private messageService: MessageService,
    private EmoloyeService: EmoloyeService,
    private router: Router,
    private disciplineService: DisciplineService,
    private experienceService: ExperienceService,
    private siteService: SiteService,
    private posteservice: PosteService,
    private Directionservice: DirectionService
  ) {}

  employe: any = {};
  sexes = [{ name: 'Homme' }, { name: 'Femme' }];
  photoUrl: string | null = null;
  stateOptions = [
    { label: 'Actif', value: 'actif' },
    { label: 'Inactif', value: 'inactif' },
  ];
  ngOnInit() {
    this.initializeMenu(); // Initialize the Menubar
    this.initializeForm(); // Initialize the form

    if (this.employe.id) {
      this.selectedEmployeId = this.employe.id;
      this.getDisciplines(this.employe.id);
    }

    this.posteservice.getAllPostesnonArchives().subscribe((data) => {
      this.postes = data;
    });
  }

  initializeMenu() {
    this.items = [
      {
        label: 'Modifier Employé',
        icon: 'pi pi-user',
        command: () => this.navigateToTab('modifier-employe'),
      },
      {
        label: 'Stage',
        icon: 'pi pi-book',
        command: () => this.navigateToTab('stage'),
      },
      {
        label: 'Discipline',
        icon: 'pi pi-exclamation-triangle',
        command: () => this.navigateToTab('discipline'),
      },
      {
        label: 'Expérience',
        icon: 'pi pi-briefcase',
        command: () => this.navigateToTab('experience'),
      },
      {
        label: 'Diplômes',
        icon: 'pi pi-sitemap',
        command: () => this.navigateToTab('diplomes'),
      },
      {
        label: 'Poste',
        icon: 'pi pi-sitemap',
        command: () => this.navigateToTab('poste'),
      },
      {
        label: 'Formations',
        icon: 'pi pi-sitemap',
        command: () => this.navigateToTab('formations-employees'),
      },
      {
        label: 'Compétences',
        icon: 'pi pi-sitemap',
        command: () => this.navigateToTab('employe-competences'),
      }
    ];
  }

  navigateToTab(tab: string) {
    this.activeTab = tab; // Update the active tab
  }

  
//un objet FormGroup nommé addEmployeeForm qui contient tous les champs nécessaires à l’ajout (ou modification) d’un employé
  initializeForm() {
    const employeData = localStorage.getItem('employe');

    //JSON.parse(employeData)	Si c’est présent, on convertit la chaîne JSON en objet JavaScript.
    this.employe = employeData ? JSON.parse(employeData) : {};

    if (this.employe.photo) {
      this.photoUrl = this.employe.photo;
    }

    this.selectedSexe =
      this.sexes.find((sexe) => sexe.name === this.employe.sexe) || null;

    this.addEmployeeForm = new FormGroup({
      Nom: new FormControl(this.employe.nom || '', Validators.required),
      Prenom: new FormControl(this.employe.prenom || '', Validators.required),
     dN: new FormControl(this.employe.dateNaissance ? new Date(this.employe.dateNaissance) : null, Validators.required),
    dR: new FormControl(this.employe.dateRecrutement ? new Date(this.employe.dateRecrutement) : null, Validators.required),
      sexe: new FormControl(this.selectedSexe || ''),
     email: new FormControl(this.employe.email || '', [Validators.email]),

      Direction: new FormControl(null),
      Poste: new FormControl(null),
      site: new FormControl(null),
      photo: new FormControl(this.employe.photo || ''),
      matricule: new FormControl(this.employe.matricule, Validators.required),
      actif: new FormControl(true, Validators.required),
      dateDebut: new FormControl(null),
      dateFin: new FormControl(null),
    });
  }
  onPosteChange(event: any): void {
    const posteId = event.value.id;
    this.getDirections(posteId);
  }

  getDirections(posteId: number): void {
    this.posteservice.getDirectionsByPosteId(posteId).subscribe((data) => {
      this.directions = data;
    });
  }
  getSites(directionId: number): void {
    this.Directionservice.getSitesByDirection(directionId).subscribe((data) => {
      this.sites = data;
    });
  }
  onDirectionChange(event: any): void {
    const directionId = event.value.id;
    this.getSites(directionId);
  }

  getDisciplines(employeId: number) {
    this.disciplineService
      .getDisciplinesByEmployeId(employeId)
      .subscribe((data) => {
        this.disciplines = data;
      });
  }
  onExperienceAdded() {
    console.log('Une nouvelle expérience a été ajoutée !');
  }
onSubmit(): void {
  if (this.addEmployeeForm.invalid) {
    this.addEmployeeForm.markAllAsTouched();  
    return; 
  }

  const emp: Employe = new Employe();

  emp.nom = this.addEmployeeForm.controls['Nom'].value;
  emp.prenom = this.addEmployeeForm.controls['Prenom'].value;
  emp.dateNaissance = this.addEmployeeForm.controls['dN'].value;
  emp.dateRecrutement = this.addEmployeeForm.controls['dR'].value;
  emp.sexe = this.addEmployeeForm.controls['sexe'].value?.name;
  emp.matricule = this.addEmployeeForm.controls['matricule'].value;
  emp.email = this.addEmployeeForm.controls['email'].value;
  emp.photo = this.addEmployeeForm.controls['photo'].value;
  emp.actif = this.addEmployeeForm.controls['actif'].value === 'actif';

  const employeId = this.selectedEmployeId ?? 0;

  if (this.employe.ajout) {
    // Cas ajout : on envoie uniquement les infos personnelles
    this.EmoloyeService.modifierEmploye(employeId, null, null, null, emp, null, null).subscribe(
      (response) => {
        console.log('Employé modifié (infos personnelles uniquement) :', response);
        this.showSuccessAlert = true;

        setTimeout(() => {
          this.showSuccessAlert = false;
          this.router.navigate(['/list-employe-existants']); 
        }, 5000);
      },
      (error) => {
        console.error('Erreur lors de la modification de l\'employé :', error);
      }
    );
  } else {
    // Cas modification complète : on récupère les infos de poste, direction, site
    const poste = this.addEmployeeForm.controls['Poste'].value;
    const posteId = poste?.id ?? 0;

    if (!posteId) {
      console.log('Erreur: Le poste sélectionné n\'est pas valide');
      return;
    }

    const direction = this.addEmployeeForm.controls['Direction'].value;
    const site = this.addEmployeeForm.controls['site'].value;
    const dateDebut = this.addEmployeeForm.controls['dateDebut'].value;
    const dateFin = this.addEmployeeForm.controls['dateFin'].value;

    emp.direction = direction?.nom_direction;
    emp.site = site?.nom_site;

    console.log('Poste:', posteId);
    console.log('Direction:', direction?.id);
    console.log('Site:', site?.id);
    console.log('Date de début:', dateDebut);
    console.log('Date de fin:', dateFin);
    console.log('Employé à modifier (complet):', emp);

    this.EmoloyeService.modifierEmploye(employeId, posteId, direction?.id, site?.id, emp, dateDebut, dateFin).subscribe(
      (response) => {
        console.log('Employé modifié avec succès :', response);
        this.showSuccessAlert = true;

        setTimeout(() => {
          this.showSuccessAlert = false;
          this.router.navigate(['/list-employe-existants']); 
        }, 5000);
      },
      (error) => {
        console.error('Erreur lors de la modification complète de l\'employé :', error);
      }
    );
  }
}

  
  onSelectedFiles(event: any) {
    if (event.files && event.files.length > 0) {
      const uploadedFile = event.files[0]; // Prendre le premier fichier sélectionné

      // Simuler une URL pour la nouvelle photo (vous pouvez utiliser FileReader pour obtenir une URL de données)
      this.photoUrl = URL.createObjectURL(uploadedFile);

      // Mettre à jour le formulaire avec le nom du fichier téléchargé
      this.addEmployeeForm.controls['photo'].setValue(uploadedFile.name);
      this.files = Array.from(event.files).map((file: any) => ({
        ...file,
        state: 'pending',
      }));
      this.updateTotalSize();
    } else {
      this.addEmployeeForm.controls['photo'].setValue(null);
      this.errorMessage = 'Aucun fichier sélectionné !';
      console.log(this.errorMessage);
    }
  }
  ngOnDestroy() {
    if (this.photoUrl) {
      URL.revokeObjectURL(this.photoUrl); // Libérer la mémoire
    }
  }

  uploadEvent(uploadCallback: any) {
    const totalSize = this.files.reduce((sum, file) => sum + file.size, 0);
    let uploaded = 0;

    // Simulation de la progression du téléchargement
    const interval = setInterval(() => {
      uploaded += 100000; // Simule un téléchargement de 100KB à chaque intervalle
      this.uploadProgress = Math.round((uploaded / totalSize) * 100);
      this.totalSizePercent = this.uploadProgress;

      // Mettre à jour l'état des fichiers pendant le processus de téléchargement
      this.files.forEach((file) => (file.state = 'pending')); // État 'pending' pendant l'upload

      if (this.uploadProgress >= 100) {
        clearInterval(interval);

        // Après l'upload, on met l'état à 'completed'
        this.files.forEach((file) => (file.state = 'completed'));

        this.uploadedFiles = [...this.uploadedFiles, ...this.files]; // Ajoute les fichiers à la liste des téléchargés
        this.files = []; // Vide la liste des fichiers en attente
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Téléchargement complet !',
        });
      }
    }, 100); // Déclenche tous les 100ms
  }

  onRemoveTemplatingFile(
    event: any,
    file: any,
    removeFileCallback: any,
    index: number
  ) {
    this.files.splice(index, 1);
    removeFileCallback();
  }

  // Supprimer un fichier téléchargé
  removeUploadedFileCallback(index: number) {
    this.uploadedFiles.splice(index, 1);
  }

  // Format de la taille du fichier en KB
  formatSize(size: number) {
    return (size / 1024).toFixed(2) + ' KB';
  }

  // Calcul de la taille totale des fichiers sélectionnés
  updateTotalSize() {
    this.totalSize = this.files.reduce((sum, file) => sum + file.size, 0);
  }

  choose(event: Event, callback: Function) {
    // Votre logique pour la méthode choose
    callback(event);
  }
  resetForm() {
    this.addEmployeeForm.reset(); // Réinitialise le formulaire
    this.showSuccessAlert = false; // Masque l'alerte
  }
  dismissAlert(fileUpload: any): void {
    // Logique pour fermer l'alerte

    this.resetForm(); // Réinitialiser le formulaire et masquer l'alerte
  }
}

import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ExperienceService } from '../service/experience.service';
import { ExperienceAnterieure } from '../model/ExperienceAnterieure';
import { ExperienceAssad } from '../model/ExperienceAssad';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SplitterModule } from 'primeng/splitter';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { Poste } from '../../poste/model/poste';
import { PosteService } from '../../poste/service/poste.service';
import { DirectionService } from '../../direction/service/direction.service';
import { Direction } from '../../direction/model/Direction';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    SplitterModule,
    TableModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    ToastModule

  ],
  styleUrls: ['./experience.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ExperienceComponent implements OnInit {
  @Input() employeId!: number;
  @Input() experiencesAssad: ExperienceAssad[] = [];
  @Input() experiencesAnterieure: ExperienceAnterieure[] = [];
  @Output() experienceUpdated = new EventEmitter<void>();
  @Output() experienceAdded = new EventEmitter<void>();

  experienceAssadForm: FormGroup;
  experienceAnterieureForm: FormGroup;
  visible: boolean = false;
  postes: Poste[] = [];
  directions: Direction[] = [];
  showAllAssad = false;
  showAllAnterieure = false;
  editingAssad = false;
  editingAnterieure = false;
  modesAffectation = ['changement de poste', 'Nouveau Recrutement', 'Promotion'];
  constructor(
    private experienceService: ExperienceService,
    private fb: FormBuilder,
    private posteService: PosteService,
    private DirectionService: DirectionService,
     private messageService: MessageService
  ) {
    this.experienceAssadForm = this.fb.group({
      debut: ['', Validators.required],
      fin: ['', Validators.required],
      poste: ['', Validators.required],
      direction: ['', Validators.required],
      modeAffectation: ['', Validators.required],
    });

    this.experienceAnterieureForm = this.fb.group({
      poste: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      societe: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.employeId) {
      this.loadExperiences();
    }
    this.getPostes();
    this.getDirections();
  }
  visibleAddAssad: boolean = false;
  visibleAddAnterieure: boolean = false;

  showDialogAddAssad() {
    this.visibleAddAssad = true;
  }

  showDialogAddAnterieure() {
    this.visibleAddAnterieure = true;
  }
  getPostes() {
    this.posteService.getAllPostesnonArchives().subscribe((data: Poste[]) => {
      this.postes = data; // Stockage des postes dans la variable 'postes'
    });
  }
  getDirections() {
    this.DirectionService.getAllDirections().subscribe((data: Direction[]) => {
      this.directions = data; // Stockage des postes dans la variable 'postes'
    });
  }
private checkDateOverlap(newStart: Date, newEnd: Date, excludeId?: number): boolean {
  // Convertir en timestamp pour comparaison
  const newStartTime = newStart.getTime();
  const newEndTime = newEnd.getTime();

  // Vérifier chaque expérience existante
  for (const exp of this.experiencesAssad) {
    // Exclure l'expérience en cours d'édition si nécessaire
    if (excludeId && exp.id === excludeId) continue;

    const expStart = new Date(exp.dateDebut).getTime();
    const expEnd = new Date(exp.dateFin).getTime();

    // Vérifier le chevauchement
    if ((newStartTime >= expStart && newStartTime <= expEnd) ||
        (newEndTime >= expStart && newEndTime <= expEnd) ||
        (newStartTime <= expStart && newEndTime >= expEnd)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Les dates chevauchent une autre expérience ASSAD existante'
      });
      return true;
    }
  }
  return false;
}
  visibleAssad = false;
  visibleAnterieure = false;
  selectedExperienceAssad: ExperienceAssad | null = null;
  selectedExperienceAnterieure: ExperienceAnterieure | null = null;

  showDialogAssad(experience: ExperienceAssad) {
    this.selectedExperienceAssad = experience;
    // Convertir les dates en objets Date si elles sont des strings
    const dateDebut = experience.dateDebut ? new Date(experience.dateDebut) : null;
    const dateFin = experience.dateFin ? new Date(experience.dateFin) : null;
  
    
    // Find the complete poste object
    const selectedPoste = this.postes.find(p => p.titre === experience.poste);
    // Find the complete direction object
    const selectedDirection = this.directions.find(d => d.nom_direction === experience.direction);
  
    this.experienceAssadForm.patchValue({
      debut: dateDebut,
      fin: dateFin,
      poste: selectedPoste, // Pass the complete object
      direction: selectedDirection, // Pass the complete object
      modeAffectation: experience.modeAffectation,
    });
    
    this.editingAssad = true;
    this.editingAnterieure = false;
  }

  showDialogAnterieure(experience: ExperienceAnterieure) {
    this.selectedExperienceAnterieure = experience;
    
    const dateDebut = experience.dateDebut ? new Date(experience.dateDebut) : null;
  const dateFin = experience.dateFin ? new Date(experience.dateFin) : null;

    this.experienceAnterieureForm.patchValue({
      dateDebut: dateDebut,
      dateFin: dateFin,
      poste: experience.poste,
      societe: experience.societe,
    });
    
    this.editingAnterieure = true;
    this.editingAssad = false;
  }

  cancelEdit() {
    this.editingAssad = false;
    this.editingAnterieure = false;
  }
updateExperienceAssad() {
  if (!this.selectedExperienceAssad || this.experienceAssadForm.invalid) {
    return;
  }

  const formValue = this.experienceAssadForm.value;
  const debut = formValue.debut;
  const fin = formValue.fin;
if (!this.validateDateOrder(debut, fin)) {
    return;
  }

  // Vérifier le chevauchement en excluant l'expérience actuelle
  if (this.checkDateOverlap(debut, fin, this.selectedExperienceAssad.id)) {
    return;
  }

  const updatedExperience: ExperienceAssad = {
    id: this.selectedExperienceAssad.id,
    poste: formValue.poste.titre,
    dateDebut: debut,
    dateFin: fin,
    direction: formValue.direction.nom_direction,
    modeAffectation: formValue.modeAffectation,
  };

  this.experienceService
    .modifyExperienceAssad(updatedExperience.id!, updatedExperience)
    .subscribe(
      (response) => {
        const index = this.experiencesAssad.findIndex(
          (e) => e.id === updatedExperience.id
        );
        if (index !== -1) {
          this.experiencesAssad[index] = response;
        }
        this.editingAssad = false;
        this.experienceUpdated.emit();
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Expérience ASSAD mise à jour avec succès'
        });
      },
      (error) => {
        console.error('Erreur lors de la mise à jour:', error);
      }
    );
}
private validateDateOrder(startDate: Date, endDate: Date): boolean {
  if (startDate && endDate && startDate > endDate) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur de date',
      detail: 'La date de fin doit être postérieure à la date de début'
    });
    return false;
  }
  return true;
}
updateExperienceAnterieure() {
  if (!this.selectedExperienceAnterieure || this.experienceAnterieureForm.invalid) {
    return;
  }

  const formValue = this.experienceAnterieureForm.value;
  const dateDebut = formValue.dateDebut;
  const dateFin = formValue.dateFin;
if (!this.validateDateOrder(dateDebut, dateFin)) {
    return;
  }
  // Vérifier le chevauchement en excluant l'expérience actuelle
  if (this.checkDateOverlapAnterieure(dateDebut, dateFin, this.selectedExperienceAnterieure.id)) {
    return;
  }

  const updatedExperience: ExperienceAnterieure = {
    id: this.selectedExperienceAnterieure.id,
    poste: formValue.poste, 
    dateDebut: dateDebut,
    dateFin: dateFin,
    societe: formValue.societe,
  };

  this.experienceService
    .modifyExperienceAnterieure(updatedExperience.id!, updatedExperience)
    .subscribe(
      (response) => {
        const index = this.experiencesAnterieure.findIndex(
          (e) => e.id === updatedExperience.id
        );
        if (index !== -1) {
          this.experiencesAnterieure[index] = response;
        }
        this.editingAnterieure = false;
        this.experienceUpdated.emit();
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Expérience antérieure mise à jour avec succès'
        });
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la mise à jour de l\'expérience antérieure'
        });
        console.error('Erreur lors de la mise à jour:', error);
      }
    );
}
 addExperienceAssad() {
  if (this.experienceAssadForm.invalid) {
    console.log("Tous les champs de l'expérience Assad sont requis !");
    return;
  }

  const debut = this.experienceAssadForm.value.debut;
  const fin = this.experienceAssadForm.value.fin;
 if (!this.validateDateOrder(debut, fin)) {
    return;
  }
  // Vérifier le chevauchement
  if (this.checkDateOverlap(debut, fin)) {
    return;
  }

  const newExperienceAssad: ExperienceAssad = {
    poste: this.experienceAssadForm.value.poste.titre,
    dateDebut: debut,
    dateFin: fin,
    direction: this.experienceAssadForm.value.direction.nom_direction,
    modeAffectation: this.experienceAssadForm.value.modeAffectation,
  };

  this.visibleAddAssad = false;
  this.experienceService
    .addExperienceAssad(this.employeId, newExperienceAssad)
    .subscribe(
      (response) => {
        this.experiencesAssad.push(response);
        this.experienceAssadForm.reset();
        this.experienceAdded.emit();
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Expérience ASSAD ajoutée avec succès'
        });
      },
      (error) => {
        console.error("Erreur lors de l'ajout de l'expérience Assad:", error);
      }
    );
}
private checkDateOverlapAnterieure(newStart: Date, newEnd: Date, excludeId?: number): boolean {
  // Convertir en timestamp pour comparaison
  const newStartTime = newStart.getTime();
  const newEndTime = newEnd.getTime();

  // Vérifier chaque expérience existante
  for (const exp of this.experiencesAnterieure) {
    // Exclure l'expérience en cours d'édition si nécessaire
    if (excludeId && exp.id === excludeId) continue;

    const expStart = new Date(exp.dateDebut).getTime();
    const expEnd = new Date(exp.dateFin).getTime();

    // Vérifier le chevauchement
    if ((newStartTime >= expStart && newStartTime <= expEnd) ||
        (newEndTime >= expStart && newEndTime <= expEnd) ||
        (newStartTime <= expStart && newEndTime >= expEnd)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Les dates chevauchent une autre expérience antérieure existante'
      });
      return true;
    }
  }
  return false;
}
addExperienceAnterieure() {
  if (this.experienceAnterieureForm.invalid) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Tous les champs sont requis'
    });
    return;
  }

  const dateDebut = this.experienceAnterieureForm.value.dateDebut;
  const dateFin = this.experienceAnterieureForm.value.dateFin;
 if (!this.validateDateOrder(dateDebut, dateFin)) {
    return;
  }

  // Vérifier le chevauchement
  if (this.checkDateOverlapAnterieure(dateDebut, dateFin)) {
    return;
  }

  const newExperienceAnterieure: ExperienceAnterieure = {
    poste: this.experienceAnterieureForm.value.poste,
    dateDebut: dateDebut,
    dateFin: dateFin,
    societe: this.experienceAnterieureForm.value.societe,
  };

  this.experienceService
    .addExperienceAnterieure(this.employeId, newExperienceAnterieure)
    .subscribe(
      (response) => {
        this.experiencesAnterieure.push(response);
        this.experienceAnterieureForm.reset();
        this.experienceUpdated.emit();
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Expérience antérieure ajoutée avec succès'
        });
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Échec de l'ajout de l'expérience antérieure"
        });
        console.error("Erreur lors de l'ajout de l'expérience Antérieure:", error);
      }
    );
  this.visibleAddAnterieure = false;
}


  deleteExperienceAssad(experienceId: number) {
    this.experienceService
      .deleteExperienceAssad(this.employeId, experienceId)
      .subscribe(
        () => {
          this.experiencesAssad = this.experiencesAssad.filter(
            (e) => e.id !== experienceId
          );
          console.log('Expérience Assad supprimée avec succès');
          this.experienceUpdated.emit();
        },
        (error) => {
          console.error(
            "Erreur lors de la suppression de l'expérience Assad:",
            error
          );
        }
      );
  }

  deleteExperienceAnterieure(experienceId: number) {
    this.experienceService
      .deleteExperienceAnterieure(this.employeId, experienceId)
      .subscribe(
        () => {
          this.experiencesAnterieure = this.experiencesAnterieure.filter(
            (e) => e.id !== experienceId
          );
          console.log('Expérience Antérieure supprimée avec succès');
          this.experienceUpdated.emit();
        },
        (error) => {
          console.error(
            "Erreur lors de la suppression de l'expérience Antérieure:",
            error
          );
        }
      );
  }

  loadExperiences() {
    this.experienceService.getExperiencesAssad(this.employeId).subscribe(
      (data) => {
        this.experiencesAssad = data;
      },
      (error) => {
        console.error(
          'Erreur lors du chargement des expériences Assad:',
          error
        );
      }
    );

    this.experienceService.getExperiencesAnterieure(this.employeId).subscribe(
      (data) => {
        this.experiencesAnterieure = data;
      },
      (error) => {
        console.error(
          'Erreur lors du chargement des expériences Antérieures:',
          error
        );
      }
    );
  }
}
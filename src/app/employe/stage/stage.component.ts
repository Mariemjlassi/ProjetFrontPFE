import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { StageService } from '../service/stage.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-stage',
  imports: [ButtonModule, FormsModule, DialogModule,ReactiveFormsModule, CommonModule, InputTextModule, TableModule, CalendarModule, ToastModule, ConfirmDialogModule],
  templateUrl: './stage.component.html',
  styleUrl: './stage.component.css',
  providers: [MessageService, ConfirmationService]
})
export class StageComponent implements OnInit{
  

  @Input() employeId!: number;
  @Output() stageUpdated = new EventEmitter<void>();
  stages: any[] = [];
  visible: boolean = false; 
  selectedStage: any = null; 
  addStageVisible: boolean = false;
  editStageVisible: boolean = false;
  stageForm = new FormGroup({
    societe: new FormControl('', Validators.required),
    dateDebut: new FormControl('', Validators.required),
    dateFin: new FormControl('', Validators.required)
  });

  editStageForm = new FormGroup({
    societe: new FormControl('', Validators.required),
    dateDebut: new FormControl('', Validators.required),
    dateFin: new FormControl('', Validators.required)
  });

  constructor(private stageService: StageService, private messageService: MessageService, private confirmationService : ConfirmationService) {}


  ngOnInit(): void {
    if (this.employeId) {
      this.getStages();
    }
  }
  showAddStageDialog() {
    this.addStageVisible = true;  // Ouvre la boîte de dialogue pour ajouter un stage
  }

  showEditStageDialog(stage: any) {
    this.selectedStage = { ...stage };  // Copie du stage sélectionné
    this.editStageForm.patchValue(this.selectedStage);  // Charge les données dans le formulaire de modification
    this.editStageVisible = true;  // Ouvre la boîte de dialogue pour modifier un stage
  }
  getStages() {
    this.stageService.getStagesByEmployeId(this.employeId).subscribe(data => {
      this.stages = data;
    });
  }

  dateErrorMessage: string = '';

  addStage() {
    this.dateErrorMessage = '';
  
    if (this.stageForm.invalid) {
      this.stageForm.markAllAsTouched();
      return;
    }
  
    const newStage = this.stageForm.value;
  
    if (newStage.dateDebut! >= newStage.dateFin!) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur de dates',
        detail: 'La date de fin doit être postérieure à la date de début.'
      });
      return;
    }
  
    if (this.isOverlapping(newStage)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Chevauchement détecté',
        detail: 'Les dates du stage se chevauchent avec un autre stage.'
      });
      return;
    }
  
    this.stageService.addStageToEmploye(this.employeId, newStage).subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Stage ajouté avec succès.'
      });
      this.getStages();
      this.stageForm.reset();
      this.stageForm.markAsUntouched();
      this.addStageVisible = false;
      this.stageUpdated.emit();
    });
  }
  
  deleteStage(stageId: number) {
    this.stageService.removeStageFromEmploye(this.employeId, stageId).subscribe(() => {
      console.log('Stage supprimé avec succès');
      this.getStages();
      this.stageUpdated.emit();
    });
  }

  showDialog(stage: any) {
    this.selectedStage = { ...stage }; // Copie du stage sélectionné
    this.editStageForm.patchValue(this.selectedStage);
    this.visible = true;
  }

  // Ajoutez cette propriété à votre classe
editDateErrorMessage: string = '';

// Modifiez la méthode updateStage()
updateStage() {
  this.editDateErrorMessage = '';
  
  if (this.editStageForm.invalid) {
    this.editStageForm.markAllAsTouched();
    return;
  }

  const updatedStage = this.editStageForm.value;

  // Vérification des dates
  if (updatedStage.dateDebut! >= updatedStage.dateFin!) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur de dates',
      detail: 'La date de fin doit être postérieure à la date de début.'
    });
    return;
  }

  // Vérification du chevauchement (en excluant le stage actuellement édité)
  if (this.isOverlappingForEdit(updatedStage)) {
    this.messageService.add({
      severity: 'error',
      summary: 'Chevauchement détecté',
      detail: 'Les dates du stage se chevauchent avec un autre stage.'
    });
    return;
  }

  this.stageService.updateStage(this.selectedStage.id, updatedStage).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Stage mis à jour avec succès.'
      });
      this.getStages();
      this.editStageVisible = false;
      this.stageUpdated.emit();
    },
    error: (err) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur est survenue lors de la mise à jour du stage.'
      });
    }
  });
}

confirmDelete(id: number): void {
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir supprimer ce stage?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Oui',
    rejectLabel: 'Non',
    acceptButtonStyleClass: 'p-button-danger',
    rejectButtonStyleClass: 'p-button-secondary',
    acceptIcon: 'pi pi-check',
    rejectIcon: 'pi pi-times',
    accept: () => {
      this.deleteStage(id);
    },
    reject: () => {
      this.messageService.add({
        severity: 'info',
        summary: 'Annulé',
        detail: 'Suppression annulée',
        life: 3000
      });
    }
  });
}

// Ajoutez cette méthode pour vérifier le chevauchement en excluant le stage en cours d'édition
isOverlappingForEdit(updatedStage: any): boolean {
  return this.stages.some(stage => {
    // On ignore le stage qu'on est en train de modifier
    if (stage.id === this.selectedStage.id) {
      return false;
    }

    const start1 = new Date(stage.dateDebut);
    const end1 = new Date(stage.dateFin);
    const start2 = new Date(updatedStage.dateDebut);
    const end2 = new Date(updatedStage.dateFin);

    return (start2 <= end1 && end2 >= start1);
  });
}

  isOverlapping(newStage: any): boolean {
    return this.stages.some(stage => {
      const start1 = new Date(stage.dateDebut);
      const end1 = new Date(stage.dateFin);
      const start2 = new Date(newStage.dateDebut);
      const end2 = new Date(newStage.dateFin);
  
      return (start2 <= end1 && end2 >= start1);
    });
  }
  
}
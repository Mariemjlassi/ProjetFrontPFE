import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DisciplineService } from '../service/discipline.service';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Discipline } from '../model/Discipline';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-discipline',
  imports: [CommonModule,FormsModule, ReactiveFormsModule, TableModule,InputTextModule, DialogModule, ButtonModule, CommonModule, FormsModule,  DialogModule, ButtonModule, ToastModule,
    ConfirmDialogModule],
  templateUrl: './discipline.component.html',
  styleUrl: './discipline.component.css',
  providers:[MessageService, ConfirmationService]
})
export class DisciplineComponent implements OnInit{
  @Input() employeId!: number;
  @Input() disciplines: Discipline[] = [];
  @Output() disciplineUpdated = new EventEmitter<void>();
  addDisciplineVisible = false;
  editDisciplineVisible = false;
  selectedDiscipline: Discipline | null = null;

  constructor(private disciplineService: DisciplineService,private messageService: MessageService,
    private confirmationService: ConfirmationService) {}
  ngOnInit(): void {
    if (this.employeId) {
      this.loadDisciplines();
    }
  }
  
  disciplineForm = new FormGroup({
    nom: new FormControl('', Validators.required),
    dateDebut: new FormControl('', Validators.required),
    dateFin: new FormControl('', Validators.required)
  });

  // Formulaire pour la modification d'une discipline
  editDisciplineForm = new FormGroup({
    nom: new FormControl('', Validators.required), 
    dateDebut: new FormControl('', Validators.required),
    dateFin: new FormControl('', Validators.required)
  });
  showAddDisciplineDialog() {
    this.disciplineForm.reset(); // Réinitialiser le formulaire
    this.addDisciplineVisible = true; // Ouvrir la boîte de dialogue
  }
  
  showEditDisciplineDialog(discipline: Discipline) {
    this.selectedDiscipline = discipline;
    this.editDisciplineForm.patchValue(discipline); // Remplir le formulaire avec les données de la discipline
    this.editDisciplineVisible = true; // Ouvrir la boîte de dialogue
  }
 

  updateDiscipline() {
    if (!this.selectedDiscipline || this.editDisciplineForm.invalid) {
      return;
    }
  
    const updatedDiscipline: Discipline = {
      id: this.selectedDiscipline.id,
      nom: this.editDisciplineForm.value.nom!,
      dateDebut: this.editDisciplineForm.value.dateDebut!,
      dateFin: this.editDisciplineForm.value.dateFin!
    };
  
    this.disciplineService.updateDiscipline(updatedDiscipline.id!, updatedDiscipline).subscribe({
      next: (response) => {
        const index = this.disciplines.findIndex(d => d.id === updatedDiscipline.id);
        if (index !== -1) {
          this.disciplines[index] = response;
        }
        this.editDisciplineVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Discipline mise à jour avec succès',
          life: 3000
        });
        this.disciplineUpdated.emit();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la mise à jour de la discipline',
          life: 3000
        });
      }
    });
  }

  addDiscipline() {
    if (this.disciplineForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Tous les champs sont obligatoires',
        life: 3000
      });
      return;
    }
  
    const newDiscipline: Discipline = {
      nom: this.disciplineForm.value.nom!,
      dateDebut: this.disciplineForm.value.dateDebut!,
      dateFin: this.disciplineForm.value.dateFin!
    };
  
    this.disciplineService.addDisciplineToEmploye(this.employeId, newDiscipline).subscribe({
      next: (response) => {
        this.disciplines.push(response);
        this.disciplineForm.reset();
        this.addDisciplineVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Discipline ajoutée avec succès',
          life: 3000
        });
        this.disciplineUpdated.emit();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de l\'ajout de la discipline',
          life: 3000
        });
      }
    });
  }

  deleteDiscipline(disciplineId: number) {
    this.disciplineService.removeDisciplineFromEmploye(this.employeId, disciplineId).subscribe({
      next: () => {
        this.disciplines = this.disciplines.filter(d => d.id !== disciplineId);
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Discipline supprimée avec succès',
          life: 3000
        });
        this.disciplineUpdated.emit();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la suppression de la discipline',
          life: 3000
        });
      }
    });
  }

  loadDisciplines() {
    this.disciplineService.getDisciplinesByEmployeId(this.employeId).subscribe({
      next: (data) => {
        this.disciplines = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des disciplines:', error);
      }
    });
  }

  confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer cette discipline ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      accept: () => {
        this.deleteDiscipline(id);
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
}
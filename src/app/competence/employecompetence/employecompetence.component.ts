import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeCompetence } from '../model/employecompetence';
import { Competence } from '../model/competence';
import { EmployeCompetenceService } from '../service/employecompetence.service';
import { CompetenceService } from '../service/competence.service';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-employecompetence',
  imports: [ButtonModule,TableModule, DialogModule,InputTextModule, ReactiveFormsModule, FormsModule, DropdownModule, ToastModule, ConfirmDialogModule],
  templateUrl: './employecompetence.component.html',
  styleUrl: './employecompetence.component.css',
  providers: [MessageService, ConfirmationService]
})
export class EmployeCompetenceComponent implements OnInit {
  @Input() employeId!: number;
  @Output() competenceUpdated = new EventEmitter<void>();

  competencesDisponibles: Competence[] = [];
  employeCompetences: EmployeCompetence[] = [];

  addDialogVisible = false;
  editDialogVisible = false;
  selectedCompetence: EmployeCompetence | null = null;

  competenceForm = new FormGroup({
    competenceId: new FormControl('', Validators.required),
    niveau: new FormControl('', Validators.required)
  });

  editCompetenceForm = new FormGroup({
    niveau: new FormControl('', Validators.required)
  });

  constructor(
    private employeCompetenceService: EmployeCompetenceService,
    private competenceService: CompetenceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadEmployeCompetences();
    this.loadCompetencesDisponibles();
  }

  loadEmployeCompetences() {
    this.employeCompetenceService.getByEmployeId(this.employeId).subscribe({
      next: data => this.employeCompetences = data,
      error: err => console.error('Erreur chargement compétences employé', err)
    });
  }

  loadCompetencesDisponibles() {
    this.competenceService.getAll().subscribe({
      next: data => this.competencesDisponibles = data,
      error: err => console.error('Erreur chargement compétences', err)
    });
  }

  showAddDialog() {
    this.competenceForm.reset();
    this.addDialogVisible = true;
  }

  showEditDialog(comp: EmployeCompetence) {
    this.selectedCompetence = comp;
    this.editCompetenceForm.patchValue({ niveau: comp.niveau });
    this.editDialogVisible = true;
  }

  addCompetence() {
    if (this.competenceForm.invalid) {
      this.competenceForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Tous les champs sont obligatoires',
        life: 3000
      });
      return;
    }

    const dto = {
      competenceId: Number(this.competenceForm.value.competenceId),
      niveau: this.competenceForm.value.niveau as string
    };

    this.employeCompetenceService.addCompetenceToEmploye(this.employeId, dto).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Compétence ajoutée avec succès',
          life: 3000
        });
        this.employeCompetences.push(response);
        this.addDialogVisible = false;
        this.competenceUpdated.emit();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.error || 'Erreur lors de l\'ajout',
          life: 3000
        });
      }
    });
  }

  updateNiveau() {
    if (this.editCompetenceForm.invalid || !this.selectedCompetence) {
      this.editCompetenceForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Le niveau est obligatoire',
        life: 3000
      });
      return;
    }

    const niveau = this.editCompetenceForm.value.niveau!;

    this.employeCompetenceService.updateNiveau(this.selectedCompetence.id, { niveau }).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Niveau mis à jour avec succès',
          life: 3000
        });
        const index = this.employeCompetences.findIndex(ec => ec.id === response.id);
        if (index !== -1) {
          this.employeCompetences[index] = response;
        }
        this.editDialogVisible = false;
        this.competenceUpdated.emit();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.error || 'Erreur lors de la mise à jour',
          life: 3000
        });
      }
    });
  }

  deleteCompetence(id: number) {
    this.employeCompetenceService.delete(id).subscribe({
      next: () => {
        this.employeCompetences = this.employeCompetences.filter(c => c.id !== id);
        this.competenceUpdated.emit();
      },
      error: err => alert(err.error)
    });
  }

  confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer cette compétence?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      accept: () => {
        this.deleteCompetence(id);
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
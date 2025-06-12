import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CompetenceService } from '../service/competence.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabViewModule } from 'primeng/tabview';
import { CompetencePosteService } from '../../poste/service/competenceposte.service';

@Component({
  selector: 'app-competence',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    TabViewModule
  ],
  templateUrl: './competence.component.html',
  styleUrl: './competence.component.css',
  providers: [MessageService, ConfirmationService],
})
export class CompetencesComponent implements OnInit {
  activeTabIndex: number = 0;
  globalFilter: string = '';
  @ViewChild('dtEmploye') dtEmploye: Table | undefined;
  @ViewChild('dtPoste') dtPoste: Table | undefined;

  // Compétences employé
  competencesEmploye: any[] = [];
  selectedCompetenceEmploye: any = null;
  selectedCompetencesEmploye: any[] = [];
  addDialogVisibleEmploye = false;
  editDialogVisibleEmploye = false;

  employesWithCompetence: any[] = [];


employesDialogVisible = false;
selectedCompetenceId: number | null = null;
  // Compétences poste
  competencesPoste: any[] = [];
  selectedCompetencePoste: any = null;
  selectedCompetencesPoste: any[] = [];
  addDialogVisiblePoste = false;
  editDialogVisiblePoste = false;

  // Formulaires employé
  competenceEmployeForm = new FormGroup({
    nom: new FormControl('', [Validators.required, Validators.minLength(2)])
  });

  editCompetenceEmployeForm = new FormGroup({
    nom: new FormControl('', [Validators.required, Validators.minLength(2)])
  });

  // Formulaires poste
  competencePosteForm = new FormGroup({
    nom: new FormControl('', [Validators.required, Validators.minLength(2)]),
    description: new FormControl('')
  });

  editCompetencePosteForm = new FormGroup({
    nom: new FormControl('', [Validators.required, Validators.minLength(2)]),
    description: new FormControl('')
  });

  constructor(
    private competenceService: CompetenceService,
    private competencePosteService: CompetencePosteService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.loadCompetencesEmploye();
    this.loadCompetencesPoste();
  }

  // Méthodes pour les compétences employé
  loadCompetencesEmploye() {
    this.competenceService.getAll().subscribe({
      next: (data) => {
        this.competencesEmploye = data;
      },
      error: (err) => {
        this.showError('Erreur', 'Impossible de charger les compétences employé');
      }
    });
  }

  showAddDialogEmploye() {
    this.competenceEmployeForm.reset();
    this.addDialogVisibleEmploye = true;
  }

  showEditDialogEmploye(competence: any) {
    this.selectedCompetenceEmploye = { ...competence };
    this.editCompetenceEmployeForm.patchValue({
      nom: competence.nom
    });
    this.editDialogVisibleEmploye = true;
  }

  addCompetenceEmploye() {
    if (this.competenceEmployeForm.invalid) {
      this.competenceEmployeForm.markAllAsTouched();
      return;
    }

    const nom = this.competenceEmployeForm.value.nom?.trim() || '';

    const exists = this.competencesEmploye.some(c => 
      c.nom.toLowerCase() === nom.toLowerCase()
    );
    
    if (exists) {
      this.showError('Erreur', 'Cette compétence employé existe déjà');
      return;
    }

    this.competenceService.create({ nom }).subscribe({
      next: () => {
        this.showSuccess('Succès', 'Compétence employé ajoutée avec succès');
        this.loadCompetencesEmploye();
        this.addDialogVisibleEmploye = false;
      },
      error: (err) => {
        this.showError('Erreur', err.error || 'Erreur lors de l\'ajout');
      }
    });
  }

  updateCompetenceEmploye() {
    if (this.editCompetenceEmployeForm.invalid) {
      this.editCompetenceEmployeForm.markAllAsTouched();
      return;
    }

    const nom = this.editCompetenceEmployeForm.value.nom?.trim() || '';

    const exists = this.competencesEmploye.some(c => 
      c.nom.toLowerCase() === nom.toLowerCase() && 
      c.id !== this.selectedCompetenceEmploye.id
    );
    
    if (exists) {
      this.showError('Erreur', 'Cette compétence employé existe déjà');
      return;
    }

    this.competenceService.update(this.selectedCompetenceEmploye.id, { nom }).subscribe({
      next: () => {
        this.showSuccess('Succès', 'Compétence employé mise à jour avec succès');
        this.loadCompetencesEmploye();
        this.editDialogVisibleEmploye = false;
      },
      error: (err) => {
        this.showError('Erreur', err.error || 'Erreur lors de la mise à jour');
      }
    });
  }

  deleteCompetenceEmploye(id: number) {
    this.competenceService.delete(id).subscribe({
      next: () => {
        this.showSuccess('Succès', 'Compétence employé supprimée avec succès');
        this.loadCompetencesEmploye();
      },
      error: (err) => {
        this.showError('Impossible de supprimer', 
            'Cette compétence est actuellement utilisée par un ou plusieurs employés. ' +
            'Veuillez d\'abord la retirer de leurs profils avant de la supprimer.');
      }
    });
  }

  // Méthodes pour les compétences poste
  loadCompetencesPoste() {
    this.competencePosteService.getAllCompetences().subscribe({
      next: (data) => {
        this.competencesPoste = data;
      },
      error: (err) => {
        this.showError('Erreur', 'Impossible de charger les compétences poste');
      }
    });
  }

  showAddDialogPoste() {
    this.competencePosteForm.reset();
    this.addDialogVisiblePoste = true;
  }

  showEditDialogPoste(competence: any) {
    this.selectedCompetencePoste = { ...competence };
    this.editCompetencePosteForm.patchValue({
      nom: competence.nom,
      description: competence.description
    });
    this.editDialogVisiblePoste = true;
  }

  addCompetencePoste() {
    if (this.competencePosteForm.invalid) {
      this.competencePosteForm.markAllAsTouched();
      return;
    }

    const formValue = this.competencePosteForm.value;
    const nom = formValue.nom?.trim() || '';
    const description = formValue.description?.trim() || '';

    const exists = this.competencesPoste.some(c => 
      c.nom.toLowerCase() === nom.toLowerCase()
    );
    
    if (exists) {
      this.showError('Erreur', 'Cette compétence poste existe déjà');
      return;
    }

    this.competencePosteService.create({ nom, description }).subscribe({
      next: () => {
        this.showSuccess('Succès', 'Compétence poste ajoutée avec succès');
        this.loadCompetencesPoste();
        this.addDialogVisiblePoste = false;
      },
      error: (err) => {
        this.showError('Erreur', err.error || 'Erreur lors de l\'ajout');
      }
    });
  }

  updateCompetencePoste() {
    if (this.editCompetencePosteForm.invalid || !this.selectedCompetencePoste?.id) {
      this.editCompetencePosteForm.markAllAsTouched();
      return;
    }

    const formValue = this.editCompetencePosteForm.value;
    const nom = formValue.nom?.trim() || '';
    const description = formValue.description?.trim() || '';

    const exists = this.competencesPoste.some(c => 
      c.nom.toLowerCase() === nom.toLowerCase() && 
      c.id !== this.selectedCompetencePoste?.id
    );
    
    if (exists) {
      this.showError('Erreur', 'Cette compétence poste existe déjà');
      return;
    }

    this.competencePosteService.update(this.selectedCompetencePoste.id, { nom, description }).subscribe({
      next: () => {
        this.showSuccess('Succès', 'Compétence poste mise à jour avec succès');
        this.loadCompetencesPoste();
        this.editDialogVisiblePoste = false;
      },
      error: (err) => {
        this.showError('Erreur', err.error || 'Erreur lors de la mise à jour');
      }
    });
  }

  deleteCompetencePoste(id: number) {
    this.competencePosteService.delete(id).subscribe({
      next: () => {
        this.showSuccess('Succès', 'Compétence poste supprimée avec succès');
        this.loadCompetencesPoste();
      },
      error: (err) => {
        this.showError('Impossible de supprimer', 
          'Cette compétence est actuellement associée à un ou plusieurs postes. ' +
          'Veuillez d\'abord la retirer de ces postes avant de la supprimer.');
      }
    });
  }

  // Méthodes communes
  applyFilter(event: Event, tableType: 'employe' | 'poste'): void {
    const input = event.target as HTMLInputElement;
    this.globalFilter = input.value;
    
    if (tableType === 'employe' && this.dtEmploye) {
      this.dtEmploye.filterGlobal(this.globalFilter, 'contains');
    } else if (tableType === 'poste' && this.dtPoste) {
      this.dtPoste.filterGlobal(this.globalFilter, 'contains');
    }
  }

  confirmDelete(id: number, type: 'employe' | 'poste'): void {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer cette compétence ${type}?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
    rejectLabel: 'Non',
    acceptButtonStyleClass: 'p-button-danger',
    rejectButtonStyleClass: 'p-button-secondary',
    acceptIcon: 'pi pi-check',
    rejectIcon: 'pi pi-times',
      accept: () => {
        if (type === 'employe') {
          this.deleteCompetenceEmploye(id);
        } else {
          this.deleteCompetencePoste(id);
        }
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

  private showSuccess(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail
    });
  }

  private showError(summary: string, detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail
    });
  }




showEmployesDialog(competenceId: number) {
  this.selectedCompetenceId = competenceId;
  this.employesDialogVisible = true;
  this.loadEmployesWithCompetence(competenceId);
}

loadEmployesWithCompetence(competenceId: number) {
  this.competenceService.getEmployesWithCompetence(competenceId).subscribe({
    next: (data) => {
      this.employesWithCompetence = data;
    },
    error: (err) => {
      this.showError('Erreur', 'Impossible de charger les employés avec cette compétence');
    }
  });
}
}

import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Diplome } from '../model/diplome';
import { TypeDiplome } from '../model/type-diplome';
import { TypeDiplomeService } from '../service/type-diplome.service';
import { DiplomeService } from '../service/diplome.service';
import { DiplomeRequest } from '../model/diplome-request';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TagModule } from 'primeng/tag';
import { CalendarModule } from 'primeng/calendar';
@Component({
  selector: 'app-list-diplome',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    PaginatorModule,
    ReactiveFormsModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    AutoCompleteModule,
    CalendarModule,
    InputTextModule
  ],
  templateUrl: './list-diplome.component.html',
  styleUrl: './list-diplome.component.css',
  providers: [MessageService, ConfirmationService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ListDiplomeComponent implements OnInit {
  @Input() employeId!: number;

  diplomes: Diplome[] = [];
  allDiplomes: Diplome[] = []; // Tous les diplômes disponibles
  addDiplomeVisible = false;
  editDiplomeVisible = false;
  diplomeToEdit: Diplome | null = null;

  // Formulaire pour assigner un diplôme existant
  assignForm: FormGroup;

  // Formulaire pour modifier l'association
  editAssignForm: FormGroup;
  

  constructor(
    private diplomeService: DiplomeService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.assignForm = this.fb.group({
      diplomeId: [null, Validators.required],
      dateObtention: [null, Validators.required]
    });

    this.editAssignForm = this.fb.group({
      diplomeId: [null, Validators.required], // Ajoutez ce contrôle
    dateObtention: [null, Validators.required]
    });
  }

  
  ngOnInit(): void {
    this.loadEmployeDiplomes();
    this.loadAllDiplomes();
  }

  loadAllDiplomes() {
    this.diplomeService.getAllDiplomes().subscribe({
      next: (data) => this.allDiplomes = data,
      error: (err) => console.error('Erreur chargement tous diplômes:', err)
    });
  }


  loadEmployeDiplomes() {
    this.diplomeService.getDiplomesByEmploye(this.employeId).subscribe({
      next: (data) => this.diplomes = data,
      error: (err) => console.error('Erreur chargement diplômes:', err)
    });
  }

  showAddDiplomeDialog(): void {
    this.assignForm.reset();
    this.addDiplomeVisible = true;
  }

 private formatDateForCalendar(date: Date): Date {
    // Convertir en date locale sans heure
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}

showEditDiplomeDialog(diplome: Diplome): void {
    this.diplomeToEdit = diplome;
    const dateObtention = diplome.dateObtention ? new Date(diplome.dateObtention) : null;
    
    this.editAssignForm.patchValue({
        diplomeId: diplome.id,
        dateObtention: dateObtention ? this.formatDateForCalendar(dateObtention) : null
    });
    this.editDiplomeVisible = true;
}
  loadDiplomes() {
    this.diplomeService
      .getDiplomesByEmploye(this.employeId)
      .subscribe((data) => {
        console.log('Diplômes récupérés :', data);
        this.diplomes = data;
      });
  }

  assignDiplome(): void {
    if (this.assignForm.invalid) return;

    const { diplomeId, dateObtention } = this.assignForm.value;

    this.diplomeService.assignDiplomeToEmploye(
      this.employeId,
      diplomeId,
      dateObtention
    ).subscribe({
      next: () => {
        this.loadEmployeDiplomes();
        this.addDiplomeVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Diplôme assigné avec succès',
          life: 3000
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Erreur lors de l'assignation du diplôme",
          life: 3000
        });
      }
    });
  }

updateAssignment(): void {
  if (this.editAssignForm.invalid || !this.diplomeToEdit) return;

  const { diplomeId, dateObtention } = this.editAssignForm.value;

  this.diplomeService.updateDiplomeAssignment(
    this.diplomeToEdit.id!, // oldDiplomeId
    this.employeId,
    diplomeId, // newDiplomeId
    dateObtention
  ).subscribe({
    next: () => {
      this.loadEmployeDiplomes();
      this.editDiplomeVisible = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Assignation mise à jour avec succès',
        life: 3000
      });
    },
    error: (err) => {
      let detail = 'Erreur lors de la mise à jour';
      if (err.error?.message) {
        detail = err.error.message;
      } else if (err.status === 404) {
        detail = 'Diplôme non trouvé';
      }
      
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: detail,
        life: 5000
      });
    }
  });
}

  deleteDiplomeEmploye(id: number) {
    this.diplomeService.deleteDiplomeEmploye(id, this.employeId).subscribe({
      next: () => {
        this.loadEmployeDiplomes();
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Diplôme supprimé avec succès',
          life: 3000
        });
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la suppression du diplôme',
          life: 3000
        });
      }
    });
  }


confirmDelete(id: number): void {
  this.confirmationService.confirm({
    message: 'Êtes-vous sûr de vouloir supprimer ce diplôme?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Oui',
    rejectLabel: 'Non',
    acceptButtonStyleClass: 'p-button-danger',
    rejectButtonStyleClass: 'p-button-secondary',
    acceptIcon: 'pi pi-check',
    rejectIcon: 'pi pi-times',
    accept: () => {
      this.deleteDiplomeEmploye(id);
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

  
  
  
  

  

  // Quand un diplôme est sélectionné, on met à jour le formulaire
  

 

  // Dans votre composant
  getTypeDiplomeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'baccalauréat':
        return 'pi pi-id-card';
      case 'licence':
        return 'pi pi-certificate';
      case 'master':
        return 'pi pi-star';
      case 'doctorat':
        return 'pi pi-shield';
      default:
        return 'pi pi-book';
    }
  }

  getTypeDiplomeSeverity(
    type: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (type.toLowerCase()) {
      case 'baccalauréat':
        return 'success';
      case 'licence':
        return 'info';
      case 'master':
        return 'warn';
      case 'doctorat':
        return 'danger';
      default:
        return 'info';
    }
  }

 
  focusOnFirstField() {
    setTimeout(() => {
      const firstField = document.getElementById('libelle');
      if (firstField) firstField.focus();
    }, 100);
  }


  
}
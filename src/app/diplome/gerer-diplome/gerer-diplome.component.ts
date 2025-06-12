import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Diplome } from '../model/diplome';
import { TypeDiplome } from '../model/type-diplome';
import { TypeDiplomeService } from '../service/type-diplome.service';
import { DiplomeService } from '../service/diplome.service';
import { DiplomeRequest } from '../model/diplome-request';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-gerer-diplome',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    PaginatorModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule
  ],
  templateUrl: './gerer-diplome.component.html',
  styleUrl: './gerer-diplome.component.css',
  providers: [MessageService, ConfirmationService],
})
export class GererDiplomeComponent implements OnInit {
  globalFilter: string = '';
  @ViewChild('dt') dt: Table | undefined; // dt peut être undefined
  diplomes: Diplome[] = [];
  typeDiplomes: TypeDiplome[] = [];
  visible = false;
  editVisible = false;
  selectedTypeId: number | null = null;
  libelleDiplome = '';
  editingDiplome: Diplome | null = null;
  loading = true;
  selectedDiplomes: Diplome[] = [];

  constructor(
    private diplomeService: DiplomeService,
    private typeDiplomeService: TypeDiplomeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.selectedDiplomes = [];
    this.getAllDiplomes();
    this.getAllTypeDiplomes();
  }
  applyFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.globalFilter = input.value;
    if (this.dt) {
      this.dt.filterGlobal(this.globalFilter, 'contains');
    }
  }

  getAllDiplomes(): void {
    this.diplomeService.getAllDiplomes().subscribe((data) => {
      this.diplomes = data;
    });
  }

  getAllTypeDiplomes(): void {
    this.typeDiplomeService.getAllTypeDiplomeNonArchives().subscribe((data) => {
      this.typeDiplomes = data;
    });
  }

  showAddDialog(): void {
    this.libelleDiplome = '';
    this.selectedTypeId = null;
    this.visible = true;
  }

  onSubmit(form: NgForm): void {
  if (form.invalid || !this.selectedTypeId) return;
  
  const selectedType = this.typeDiplomes.find(t => t.id === this.selectedTypeId);
  if (!selectedType) return;

  this.diplomeService.addDiplome(
    this.selectedTypeId,
    selectedType.libelleTypeDiplome,
    this.libelleDiplome
  ).subscribe({
    next: () => {
      this.getAllDiplomes();
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Diplôme ajouté avec succès',
        life: 3000
      });
      this.visible = false;
      form.resetForm();
    },
    error: (err) => {
      const errorMessage = err.error?.message?.includes('existe déjà') 
        ? 'Un diplôme avec ce nom et ce type existe déjà'
        : 'Une erreur est survenue lors de l\'ajout du diplôme';
      
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: errorMessage,
        life: 5000
      });
    }
  });
}


  showEditDialog(diplome: Diplome): void {
    this.editingDiplome = { ...diplome };
    this.selectedTypeId = diplome.typeDiplome?.id || null;
    this.editVisible = true;
  }

  onUpdateSubmit(form: NgForm): void {
  if (form.invalid || !this.selectedTypeId || !this.editingDiplome) return;

  const selectedType = this.typeDiplomes.find(t => t.id === this.selectedTypeId);
  if (!selectedType) return;

  const diplomeRequest: DiplomeRequest = {
    idType: this.selectedTypeId,
    libelleTypeDiplome: selectedType.libelleTypeDiplome,
    libelle: this.editingDiplome.libelle
  };

  this.diplomeService.updateDiplome(this.editingDiplome.id!, diplomeRequest)
    .subscribe({
      next: () => {
        this.getAllDiplomes();
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Diplôme mis à jour avec succès',
        });
        this.editVisible = false;
      },
      error: (err) => {
        const errorMessage = err.error?.message?.includes('existe déjà') 
          ? 'Un diplôme avec ce nom et ce type existe déjà'
          : 'Une erreur est survenue lors de la mise à jour du diplôme';
        
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: errorMessage,
          life: 5000
        });
      }
    });
}

  confirmDelete(id: number): void {
  this.confirmationService.confirm({
    header: 'Confirmation de suppression',
    message: 'Êtes-vous sûr de vouloir supprimer ce diplôme ? Cette action est irréversible.',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Oui, supprimer',
    acceptIcon: 'pi pi-check',
    acceptButtonStyleClass: 'p-button-danger',
    rejectLabel: 'Annuler',
    rejectIcon: 'pi pi-times',
    rejectButtonStyleClass: 'p-button-secondary',
    accept: () => {
      this.deleteDiplome(id);
    },
    reject: () => {
      this.messageService.add({
        severity: 'info',
        summary: 'Annulé',
        detail: 'Suppression annulée',
      });
    },
  });
}

  deleteDiplome(id: number): void {
    this.diplomeService.deleteDiplome(id).subscribe({
        next: () => {
            this.getAllDiplomes();
            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Diplôme supprimé avec succès',
            });
        },
        error: (err) => {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: err.message,
                life: 5000
            });
        }
    });
}
  getTypeSeverity(typeName: string | undefined): string {
    if (!typeName) return 'info';
    
    const type = typeName.toLowerCase();
    if (type.includes('licence')) return 'success';
    if (type.includes('master')) return 'warning';
    if (type.includes('doctorat')) return 'danger';
    return 'info';
  }



private convertDiplomesToCSV(diplomes: Diplome[]): string {
    const headers = ['Référence', 'Intitulé du Diplôme', 'Catégorie'];
    const rows = diplomes.map(diplome => [
        `DIP-${diplome.id}`,
        diplome.libelle,
        diplome.typeDiplome?.libelleTypeDiplome || 'Non spécifié'
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

private downloadCSV(csvData: string, fileName: string): void {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
exportDiplomes(): void {
  // Vérifier si des diplômes sont sélectionnés
  if ( this.selectedDiplomes.length > 0) {
      // Confirmation avant export des sélections
      this.confirmationService.confirm({
          message: `Voulez-vous exporter les ${this.selectedDiplomes.length} diplômes sélectionnés ?`,
          header: 'Confirmation export',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Oui',
    rejectLabel: 'Non',
    acceptButtonStyleClass: 'p-button-danger',
    rejectButtonStyleClass: 'p-button-secondary',
    acceptIcon: 'pi pi-check',
    rejectIcon: 'pi pi-times',
          accept: () => {
              const csvData = this.convertDiplomesToCSV(this.selectedDiplomes);
              this.downloadCSV(csvData, 'diplomes_selectionnes');
              this.messageService.add({
                  severity: 'success',
                  summary: 'Export réussi',
                  detail: `${this.selectedDiplomes.length} diplômes exportés`
              });
          }
      });
  } else {
      // Si aucun diplôme sélectionné, exporter tout avec confirmation
      this.confirmationService.confirm({
          message: 'Aucun diplôme sélectionné. Voulez-vous exporter tous les diplômes ?',
          header: 'Confirmation export',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Oui',
    rejectLabel: 'Non',
    acceptButtonStyleClass: 'p-button-danger',
    rejectButtonStyleClass: 'p-button-secondary',
          accept: () => {
              const csvData = this.convertDiplomesToCSV(this.diplomes);
              this.downloadCSV(csvData, 'diplomes');
              this.messageService.add({
                  severity: 'success',
                  summary: 'Export réussi',
                  detail: `${this.diplomes.length} diplômes exportés`
              });
          }
      });
  }
}


}

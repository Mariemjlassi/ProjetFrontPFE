import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TypeDiplome } from '../model/type-diplome';
import { TypeDiplomeService } from '../service/type-diplome.service';
import { FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { Toast, ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { BrowserModule } from '@angular/platform-browser';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';


@Component({
  selector: 'app-type-diplome',
  standalone:true,
  imports: [CommonModule,DialogModule,ButtonModule ,TableModule,ToastModule,ReactiveFormsModule,FormsModule, InputTextModule, ConfirmDialogModule],
  templateUrl: './type-diplome.component.html',
  styleUrl: './type-diplome.component.css',
  providers: [MessageService, ConfirmationService]
})
export class TypeDiplomeComponent implements OnInit {
  globalFilter: string = ''; 
  @ViewChild('dt') dt: Table | undefined; 
  typeDiplomes: any[] = [];
  selectedTypeDiplome: any | null = null;
  visibleAdd: boolean = false;
  visibleEdit: boolean = false;
  typeDiplomeForm: FormGroup;
  editTypeDiplomeForm: FormGroup;
  selectedTypeDiplomes: TypeDiplome[] = [];
  constructor(
    private typeDiplomeService: TypeDiplomeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.typeDiplomeForm = new FormGroup({
      libelleTypeDiplome: new FormControl('', Validators.required),
    });

    this.editTypeDiplomeForm = new FormGroup({
      libelleTypeDiplome: new FormControl('', Validators.required),
    });
  }

  applyFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.globalFilter = input.value;
    if (this.dt) {
      this.dt.filterGlobal(this.globalFilter, 'contains');
    }
  }
  ngOnInit(): void {
    this.getTypeDiplomes();
  }

  getTypeDiplomes(): void {
    this.typeDiplomeService.getAllTypeDiplomeNonArchives().subscribe(
      (data) => {
        this.typeDiplomes = data;
      },
      (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de chargement des types de diplômes' });
      }
    );
  }

  showAddDialog(): void {
    this.visibleAdd = true;
  }

  addTypeDiplome(): void {
  if (this.typeDiplomeForm.invalid) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Le libellé est requis',
      life: 3000
    });
    return;
  }

  const newTypeDiplome = this.typeDiplomeForm.value;

  this.typeDiplomeService.addTypeDiplome(newTypeDiplome).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Type de diplôme ajouté avec succès',
        life: 3000
      });
      this.getTypeDiplomes();
      this.typeDiplomeForm.reset();
      this.visibleAdd = false;
    },
    error: (err) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: "Échec de l'ajout du type de diplôme",
        life: 5000
      });
    }
  });
}
  archiver(id: number): void {
  this.typeDiplomeService.archiverTypeDiplome(id).subscribe({
    next: (response) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Type de diplôme archivé avec succès',
        life: 3000
      });
      this.getTypeDiplomes();
    },
    error: (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: "Échec de l'archivage du type de diplôme",
        life: 5000
      });
    }
  });
}
  confirmArchiver(id: number): void {
    this.confirmationService.confirm({
      header: 'Confirmation d\'archivage',
      message: 'Êtes-vous sûr de vouloir archiver ce type de diplôme ? Cette action ne pourra pas être annulée.',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: {
        label: 'Oui, archiver',
        icon: 'pi pi-check',
        severity: 'warn'
      },
      rejectButtonProps: {
        label: 'Annuler',
        icon: 'pi pi-times',
        severity: 'secondary'
      },
      accept: () => {
        this.archiver(id);
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Annulé', detail: 'Archivage annulé' });
      }
    });
  }
  

  showEditDialog(typeDiplome: any): void {
    this.selectedTypeDiplome = { ...typeDiplome };
    this.editTypeDiplomeForm.patchValue(this.selectedTypeDiplome);
    this.visibleEdit = true;
  }

  updateTypeDiplome(): void {
  if (!this.selectedTypeDiplome || this.editTypeDiplomeForm.invalid) return;

  const newLibelle = this.editTypeDiplomeForm.value.libelleTypeDiplome;
  
  // Vérification côté client (optionnelle)
  const existing = this.typeDiplomes.find(t => 
    t.libelleTypeDiplome === newLibelle && t.id !== this.selectedTypeDiplome.id
  );
  
  if (existing) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Un type de diplôme avec ce nom existe déjà',
      life: 5000
    });
    return;
  }

  // Créez un objet TypeDiplome complet avec l'ID existant
  const updatedTypeDiplome: TypeDiplome = {
    id: this.selectedTypeDiplome.id,
    libelleTypeDiplome: newLibelle
  };
  
  this.typeDiplomeService.updateTypeDiplome(this.selectedTypeDiplome.id, updatedTypeDiplome).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Type de diplôme mis à jour avec succès',
        life: 3000
      });
      this.getTypeDiplomes();
      this.visibleEdit = false;
    },
    error: (err) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err.message || "Échec de la mise à jour du type de diplôme",
        life: 5000
      });
    }
  });
}
  exportTypeDiplomes(): void {
    if (this.selectedTypeDiplomes && this.selectedTypeDiplomes.length > 0) {
        this.confirmationService.confirm({
            message: `Voulez-vous exporter les ${this.selectedTypeDiplomes.length} types de diplômes sélectionnés ?`,
            header: 'Confirmation export',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
    rejectLabel: 'Non',
    acceptButtonStyleClass: 'p-button-danger',
    rejectButtonStyleClass: 'p-button-secondary',
    acceptIcon: 'pi pi-check',
    rejectIcon: 'pi pi-times',
            accept: () => {
                const csvData = this.convertTypeDiplomesToCSV(this.selectedTypeDiplomes);
                this.downloadCSV(csvData, 'types_diplomes_selectionnes');
                this.messageService.add({
                    severity: 'success',
                    summary: 'Export réussi',
                    detail: `${this.selectedTypeDiplomes.length} types de diplômes exportés`
                });
            }
        });
    } else {
        this.confirmationService.confirm({
            message: 'Aucun type de diplôme sélectionné. Voulez-vous exporter tous les types ?',
            header: 'Confirmation export',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
    rejectLabel: 'Non',
    acceptButtonStyleClass: 'p-button-danger',
    rejectButtonStyleClass: 'p-button-secondary',
    acceptIcon: 'pi pi-check',
    rejectIcon: 'pi pi-times',
            accept: () => {
                const csvData = this.convertTypeDiplomesToCSV(this.typeDiplomes);
                this.downloadCSV(csvData, 'types_diplomes');
                this.messageService.add({
                    severity: 'success',
                    summary: 'Export réussi',
                    detail: `${this.typeDiplomes.length} types de diplômes exportés`
                });
            }
        });
    }
}

private convertTypeDiplomesToCSV(typeDiplomes: TypeDiplome[]): string {
    const headers = ['Référence', 'Intitulé du Type'];
    const rows = typeDiplomes.map(type => [
        `TYPE-${type.id}`,
        type.libelleTypeDiplome
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
}
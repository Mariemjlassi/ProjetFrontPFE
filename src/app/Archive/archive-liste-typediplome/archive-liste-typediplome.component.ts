import { Component, OnInit, ViewChild } from '@angular/core';
import { TypeDiplomeService } from '../../diplome/service/type-diplome.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

import { TagModule } from 'primeng/tag'; // Ajoutez cette ligne si vous 
import { ConfirmDialogModule } from 'primeng/confirmdialog';
@Component({
  selector: 'app-archive-liste-typediplome',
  imports: [TagModule,CommonModule,ConfirmDialogModule, DialogModule, ButtonModule, TableModule, ToastModule, ReactiveFormsModule, FormsModule, InputTextModule],
  templateUrl: './archive-liste-typediplome.component.html',
  styleUrl: './archive-liste-typediplome.component.css',
   providers: [ConfirmationService]
})
export class ArchiveListeTypediplomeComponent implements OnInit {
  typeDiplomes: any[] = [];
  selectedTypeDiplome: any | null = null;
  visibleAdd: boolean = false;
  visibleEdit: boolean = false;
  typeDiplomeForm!: FormGroup;
  editTypeDiplomeForm!: FormGroup;

  ngOnInit(): void {
    this.getTypeDiplomes(); 
    this.initializeForms();  // Initialize the form group
  }

  constructor(private typeDiplomeService: TypeDiplomeService,
  private confirmationService: ConfirmationService) {}

  getTypeDiplomes(): void {
    this.typeDiplomeService.getAllTypeDiplomeArchives().subscribe(
      (data) => {
        this.typeDiplomes = data;
      },
      (err) => {
        // Handle error here if needed
      }
    );
  }

desarchiverTypeDiplome(id: number): void {
  this.confirmationService.confirm({
    message: 'Voulez-vous vraiment désarchiver ce type de diplôme ?',
    header: 'Confirmation de désarchivage',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Oui',
    rejectLabel: 'Non',
    acceptButtonStyleClass: 'p-button-success',
    rejectButtonStyleClass: 'p-button-secondary',
    accept: () => {
      this.typeDiplomeService.desarchiverTypeDiplome(id).subscribe({
        next: () => {
          console.log('✅ Type de diplôme désarchivé avec succès');
          this.getTypeDiplomes();
        },
        error: (err) => {
          console.error('❌ Erreur lors du désarchivage du type de diplôme :', err);
        }
      });
    }
  });
}

  showEditDialog(typeDiplome: any): void {
    this.selectedTypeDiplome = { ...typeDiplome };
    this.editTypeDiplomeForm.patchValue(this.selectedTypeDiplome);
    this.visibleEdit = true;
  }

  updateTypeDiplome(): void {
    if (!this.selectedTypeDiplome) return;

    const updatedTypeDiplome = this.editTypeDiplomeForm.value;
    this.typeDiplomeService.updateTypeDiplome(this.selectedTypeDiplome.id, updatedTypeDiplome).subscribe(() => {
      console.log('Type de diplôme mis à jour avec succès');
      
      this.visibleEdit = false;
    });
  }

  // Initialize forms here
  private initializeForms(): void {
    this.editTypeDiplomeForm = new FormGroup({
      libelleTypeDiplome: new FormControl('')  // Make sure to initialize the form controls
    });
  }
  searchText: string = '';

  @ViewChild('dt') dt!: Table; // Ajoutez cette ligne
  
  // ... le reste de vos propriétés existantes

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(filterValue, 'contains'); // Utilisez la méthode filterGlobal
  }
}

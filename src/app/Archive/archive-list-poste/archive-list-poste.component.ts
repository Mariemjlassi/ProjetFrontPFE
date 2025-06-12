import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Poste } from '../../poste/model/poste';
import { PosteService } from '../../poste/service/poste.service';
import { TagModule } from 'primeng/tag';
import { CompetencePoste } from '../../poste/model/competenceposte';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-archive-list-poste',
  imports: [  CommonModule,
      TableModule,
      ButtonModule,
      InputTextModule,
      FormsModule,
      DialogModule,
      TagModule ,
       ConfirmDialogModule
    ],
  templateUrl: './archive-list-poste.component.html',
  styleUrl: './archive-list-poste.component.css',
   providers: [ConfirmationService],
})
export class ArchiveListPosteComponent implements OnInit {
   postes: Poste[] = [];
    selectedPostes: Poste[] = [];
    searchText: string = '';
    visibleUpdateDialog: boolean = false;
    selectedPoste: Poste = new Poste();
    visible: boolean = false;
  competences: CompetencePoste[] = [];
  
    constructor(private posteService: PosteService,private confirmationService: ConfirmationService,) {}
  
    ngOnInit(): void {
      this.loadPostes();
    }
 getCompetencesNames(competencePostes: CompetencePoste[] | undefined): string {
  if (!competencePostes || competencePostes.length === 0) {
    return 'Aucune compétence spécifiée';
  }
  return competencePostes.map(c => '• ' + c.nom).join('<br>');
}

    openEditDialog(poste: Poste): void {
      this.selectedPoste = { ...poste }; // Clonage pour éviter la modification directe dans la liste
      this.visibleUpdateDialog = true; // Affichage du dialogue d'édition
    }
    
  
    loadPostes(): void {
      this.posteService.getAllPostesArchives().subscribe((data: Poste[]) => {
        this.postes = data;
      });
    }
  
deletePoste(poste: Poste): void {
  this.confirmationService.confirm({
    message: `Voulez-vous vraiment désarchiver le poste "${poste.titre}" ?`,
    header: 'Confirmation de suppression',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Oui',
    rejectLabel: 'Non',
    acceptButtonStyleClass: 'p-button-success',
    rejectButtonStyleClass: 'p-button-secondary',
    accept: () => {
      if (poste.id != null) {
        this.posteService.desarchiverPoste(poste.id).subscribe(() => {
          this.postes = this.postes.filter(p => p.id !== poste.id);
        });
      } else {
        console.error("❌ ID du poste manquant !");
      }
    }
  });
}

  
    exportPostes(): void {
      console.log('Exporting postes...');
    }
  
    editPoste(poste: Poste): void {
      this.selectedPoste = { ...poste };
      this.visibleUpdateDialog = true;
    }
  


}
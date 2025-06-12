import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SpeedDialModule } from 'primeng/speeddial';
import { Table, TableModule } from 'primeng/table';
import { Direction } from '../../direction/model/Direction';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { DirectionService } from '../../direction/service/direction.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-archive-list-direction',
  imports: [TableModule,
        DialogModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        CommonModule,
        SpeedDialModule,
       ConfirmDialogModule,],
  templateUrl: './archive-list-direction.component.html',
  styleUrl: './archive-list-direction.component.css',
   providers: [ConfirmationService],
})
export class ArchiveListDirectionComponent implements OnInit {

  directions: Direction[] = [];
  selectedDirections: Direction[] = [];
  visible: boolean = false;
  showDialog: boolean = false;  
  selectedDirection: Direction = { id: 0, nom_direction: '', archive: false };
  newDirection: Direction = { id: 0, nom_direction: '', archive: false };
  
  searchText: string = '';
  @ViewChild('dt') dt!: Table;

  constructor(private directionService: DirectionService,private confirmationService: ConfirmationService) {}


 ngOnInit(): void {
  this.getDirections();
 }
 saveDirection() {
  // Implémente la sauvegarde des modifications
  this.visible = false;
}

 getDirections(): void {
  this.directionService.getAllDirectionsArchivés().subscribe((data: Direction[]) => {
    this.directions = data;
    console.log('Directions chargées:', this.directions);
  });
}







desarchiverDirection(direction: Direction): void {
  if (direction.id === undefined) {
    console.error("Impossible de désarchiver : l'ID de la direction est indéfini.");
    return;
  }

  this.confirmationService.confirm({
    message: `Voulez-vous vraiment désarchiver la direction "${direction.nom_direction}" ?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Oui',
    rejectLabel: 'Non',
    acceptButtonStyleClass: 'p-button-success',
    rejectButtonStyleClass: 'p-button-secondary',
    accept: () => {
      this.directionService.desarchiverDirection(direction.id!).subscribe({
        next: (response) => {
          direction.archive = false;
          console.log('✅ Direction désarchivée avec succès', response);
          this.getDirections();
        },
        error: (err) => {
          console.error('❌ Erreur lors de la désarchivage de la direction', err);
        }
      });
    },
    reject: () => {
      console.log('⛔ Désarchivage annulé');
    }
  });
}




openEditDialog(direction: Direction): void {
  this.selectedDirection = { ...direction };
  this.visible = true;
}

showAddDirectionDialog(): void {
  this.showDialog = true;
  this.newDirection = { id: 0, nom_direction: '', archive: false }; // Ajouter 'archive'
}

addDirection(): void {
 /* if (this.newDirection.nom_direction.trim() !== '') {
    const DirectionSansId = { 
      nom_direction: this.newDirection.nom_direction,
      archive: false // Ajouter la propriété archive ici
    };

    this.directionService.ajouterDirection(DirectionSansId).subscribe({
      next: (directionAjoute) => {
        this.directions.push(directionAjoute);
        console.log('Direction ajoutée avec succès:', directionAjoute);
        this.showDialog = false;
        this.newDirection = { id: 0, nom_direction: '', archive: false }; // Réinitialisation avec 'archive'
      },
      error: (err) => console.error("Erreur lors de l'ajout de la direction:", err)
    });
  } else {
    alert("Le nom de la direction ne peut pas être vide.");
  }*/
}

exportDirections(): void {
  if (this.selectedDirections.length > 0) {
    const csvData = this.convertToCSV(this.selectedDirections); // Utiliser le bon tableau
    this.downloadCSV(csvData);
  } else {
    const csvData = this.convertToCSV(this.directions); // Utiliser le tableau complet si aucun élément n'est sélectionné
    this.downloadCSV(csvData);
  }
}


convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]); 
  const rows = data.map(row => headers.map(header => row[header]).join(','));

  return [headers.join(','), ...rows].join('\n');
}

downloadCSV(csvData: string): void {
  const blob = new Blob([csvData], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'directions.csv';
  link.click();
}}
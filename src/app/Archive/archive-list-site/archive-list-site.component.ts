import { Component, OnInit, ViewChild } from '@angular/core';
import { Site } from '../../site/model/site';
import { Table, TableModule } from 'primeng/table';
import { DirectionService } from '../../direction/service/direction.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { SpeedDialModule } from 'primeng/speeddial';
import { SiteService } from '../../site/service/site.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-archive-list-site',
  imports: [TableModule,
          DialogModule,
          FormsModule,
          ButtonModule,
          InputTextModule,
          CommonModule,
          SpeedDialModule,
        ConfirmDialogModule,],
  templateUrl: './archive-list-site.component.html',
  styleUrl: './archive-list-site.component.css',
  providers: [ConfirmationService],
})
export class ArchiveListSiteComponent  implements OnInit {
  
    sites: Site[] = [];
    selectedSites: Site[] = [];
    visible: boolean = false;
    showDialog: boolean = false;  
    selectedSite: Site = { id: 0, nom_site: '', archive: false };
    newSite: Site = { id: 0, nom_site: '', archive: false };
    
    searchText: string = '';
    @ViewChild('dt') dt!: Table;
  
    constructor(private siteservice: SiteService, private confirmationService: ConfirmationService) {}
  
  
   ngOnInit(): void {
    this.getSites();
   }
   saveDirection() {
    // Implémente la sauvegarde des modifications
    this.visible = false;
  }
  
  getSites(): void {
    this.siteservice.getAllDirectionsArchivés().subscribe((data: Site[]) => {
      this.sites = data;
      console.log('Sites chargés:', this.sites);
    });
  }
  
  
  
  
  
  
  
  
  getItems(site: Site): MenuItem[] {
    return [
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.deleteDirection(site)
      },
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.openEditDialog(site)
      }
    ];
  }
deleteDirection(site: Site): void {
  if (site.id === undefined) {
    console.error("Impossible de supprimer : l'ID du site est indéfini.");
    return;
  }

  if (confirm(`Voulez-vous vraiment désarchiver le ${site.nom_site} ?`)) {
    // Appel du service pour archiver la direction
    this.siteservice.desarchiverSite(site.id).subscribe({
      next: (response) => {
        // Une fois archivée, mettez à jour localement la direction
        site.archive = true;
        console.log('Direction archivée avec succès', response);
      },
      error: (err) => {
        console.error('Erreur lors de l\'archivage de la direction', err);
      }
    });
  }
}

  
  
  openEditDialog(direction: Site): void {
    this.selectedSite = { ...direction };
    this.visible = true;
  }
  
  showAddDirectionDialog(): void {
    this.showDialog = true;
  this.newSite= { id: 0, nom_site: '', archive: false }; // Ajouter 'archive'
  }
  
 
  
  exportDirections(): void {
    if (this.selectedSites.length > 0) {
      const csvData = this.convertToCSV(this.selectedSites); // Utiliser le bon tableau
      this.downloadCSV(csvData);
    } else {
      const csvData = this.convertToCSV(this.sites); // Utiliser le tableau complet si aucun élément n'est sélectionné
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
  }
desarchiverSite(id: number): void {
  this.confirmationService.confirm({
    message: 'Voulez-vous vraiment désarchiver ce site ?',
    header: 'Confirmation de désarchivage',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Oui',
    rejectLabel: 'Non',
    acceptButtonStyleClass: 'p-button-success',
    rejectButtonStyleClass: 'p-button-secondary',
    accept: () => {
      this.siteservice.desarchiverSite(id).subscribe({
        next: () => {
          this.getSites(); // Rafraîchir la liste
        },
        error: (err) => {
          console.error('❌ Erreur lors du désarchivage du site :', err);
        }
      });
    }
  });
}

}
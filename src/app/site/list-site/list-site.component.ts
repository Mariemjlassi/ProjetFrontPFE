import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Site } from '../model/site';
import { SiteService } from '../service/site.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { SpeedDialModule } from 'primeng/speeddial';
import { DialogModule } from 'primeng/dialog';
import { DirectionService } from '../../direction/service/direction.service';
import { Direction } from '../../direction/model/Direction';
import { PickListModule } from 'primeng/picklist';
import { MultiSelectModule } from 'primeng/multiselect';

import { Poste } from '../../poste/model/poste';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';


@Component({
  selector: 'app-list-site',
  imports: [
    TableModule,
    DialogModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CommonModule,
    SpeedDialModule,
    PickListModule,
    MultiSelectModule,
    ToastModule,
    ConfirmDialogModule,
  ],
   providers: [ConfirmationService,MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './list-site.component.html',
  styleUrl: './list-site.component.css'
})
export class ListSiteComponent implements OnInit {
  sites: Site[] = [];
  selectedSites: Site[] = [];
  visible: boolean = false;
  showDialog: boolean = false;  
  selectedSite: Site = { id: 0, nom_site: '', archive: false };
  directions: Direction[] = [];
  newSite: Site = { id: 0, nom_site: '' , archive: false};  
  selectedDirections: Direction[] = [];
  postes: Poste[] = [];
  selectedPostes: Poste[] = [];
  searchText: string = '';
  @ViewChild('dt') dt!: Table;
  mapHeight: string = '300px'; // Valeur initiale de la carte

  constructor(private siteService: SiteService, private directionservice: DirectionService,
    private messageService: MessageService, private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.getSites();
    
  }
  onDirectionsListShow() {
    this.mapHeight = '500px'; // Augmenter la taille de la carte lorsque la liste des directions est ouverte
  }
isDuplicateSiteName(name: string, currentId: number = 0): boolean {
  const cleanedName = name.trim().toLowerCase().replace(/\s+/g, ' ');
  return this.sites.some(site => 
    site.id !== currentId && site.nom_site.trim().toLowerCase().replace(/\s+/g, ' ') === cleanedName
  );
}

  // Fonction appelée lorsque la liste des directions est fermée
  onDirectionsListHide() {
    this.mapHeight = '300px'; // Rétablir la taille initiale de la carte lorsque la liste des directions est fermée
  }

 


  openEditDialog(site: Site): void {
    this.selectedSite = { ...site };  // Cloner l'objet pour éviter les modifications directes
    this.visible = true;
  
    // Vérifier si selectedSite.id est un nombre valide
    const siteId = this.selectedSite.id;
  
    
       
  }
  
  
  



  getSites(): void {
    this.siteService.getAllSites().subscribe((data: Site[]) => {
      this.sites = data;
      console.log('Sites chargés:', this.sites);
    });
  }

  getItems(site: Site): MenuItem[] {
    return [
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.archiveSite(site) // Passer l'objet complet
      },
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.openEditDialog(site)
      }
    ];
  }


archiveSite(site: Site): void {
  if (site.id !== undefined) {
    this.siteService.archiverSite(site.id).subscribe({
      next: (response) => {
        site.archive = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Archivé',
          detail: `Le site "${site.nom_site}" a été archivé avec succès.`,
        });
        this.getSites();
      },
      error: (err) => {
        console.error('Erreur lors de l\'archivage du site', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Impossible d'archiver le site "${site.nom_site}".`,
        });
      }
    });
  } else {
    console.error('L\'ID du site est indéfini');
  }
}

confirmArchive(site: Site): void {
  this.confirmationService.confirm({
    header: 'Confirmation d\'archivage',
    message: `Voulez-vous vraiment archiver le site "${site.nom_site}" ? Cette action est réversible.`,
    icon: 'pi pi-exclamation-triangle',
    acceptButtonProps: {
      label: 'Oui, archiver',
      icon: 'pi pi-check',
       severity: 'danger',
    },
    rejectButtonProps: {
      label: 'Annuler',
      icon: 'pi pi-times',
      severity: 'secondary',
    },
    accept: () => {
      this.archiveSite(site);
    },
    reject: () => {
      this.messageService.add({
        severity: 'info',
        summary: 'Annulé',
        detail: 'Archivage annulé',
      });
    },
  });
}



// Méthode pour éditer un site
editSite(site: Site): void {
  this.openEditDialog(site);
}


  // Afficher la boîte de dialogue pour ajouter un site
  showAddSiteDialog(): void {
    this.showDialog = true; // Ouvrir la boîte de dialogue d'ajout
    this.newSite = { id: 0, nom_site: '', archive: false }; // Réinitialiser le modèle
    this.selectedDirections = [];
  }
// Dans list-site.component.ts
updateSiteName(): void {
  const cleanedName = this.selectedSite.nom_site?.trim();

  if (!cleanedName) {
    this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Le nom du site ne peut pas être vide.' });
    return;
  }

  const id = this.selectedSite.id;
  if (id === undefined || id === null) {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'ID du site manquant.' });
    return;
  }

  if (this.isDuplicateSiteName(cleanedName, id)) {
    this.messageService.add({ severity: 'error', summary: 'Duplication', detail: 'Un site avec ce nom existe déjà.' });
    return;
  }

  this.siteService.updateSiteName(id, cleanedName)
    .subscribe({
      next: (updatedSite) => {
        const index = this.sites.findIndex(site => site.id === updatedSite.id);
        if (index !== -1) this.sites[index] = updatedSite;
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Nom du site mis à jour.' });
        this.visible = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la mise à jour du site.' });
        console.error(err);
      }
    });
}

  

  

 
addSite(): void {
  const cleanedName = this.newSite.nom_site.trim();
  if (cleanedName === '') {
    this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Le nom du site ne peut pas être vide.' });
    return;
  }

  if (this.isDuplicateSiteName(cleanedName)) {
    this.messageService.add({ severity: 'error', summary: 'Duplication', detail: 'Un site avec ce nom existe déjà.' });
    return;
  }

  const siteSansId = {
    nom_site: cleanedName,
    archive: false,
    directionIds: this.selectedDirections.map(d => d.id),
    postesIds: this.selectedPostes.map(p => p.id)
  };

  this.siteService.ajouterSite(siteSansId).subscribe({
    next: (siteAjoute) => {
      this.sites.push(siteAjoute);
      this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Site ajouté avec succès.' });
      this.showDialog = false;
      this.newSite = { id: 0, nom_site: '', archive: false };
      this.selectedDirections = [];
      this.selectedPostes = [];
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de l\'ajout du site.' });
      console.error(err);
    }
  });
}


  
  
  
exportSites(): void {
  const hasSelected = this.selectedSites.length > 0;
  const count = this.selectedSites.length;

  this.confirmationService.confirm({
    header: 'Confirmer l’exportation',
    message: hasSelected
      ? `Voulez-vous exporter les ${count} site${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''} ?`
      : 'Aucun site sélectionné. Voulez-vous exporter tous les sites ?',
    icon: 'pi pi-exclamation-triangle',
    acceptButtonProps: {
      label: 'Oui',
      icon: 'pi pi-check',
      severity: 'success'
    },
    rejectButtonProps: {
      label: 'Non',
      icon: 'pi pi-times',
      severity: 'secondary'
    },
    accept: () => {
      let csvData;
      if (hasSelected) {
        csvData = this.convertToCSV(this.selectedSites);
      } else {
        csvData = this.convertToCSV(this.sites);
      }
      this.downloadCSV(csvData);
    },
    reject: () => {
      this.messageService.add({
        severity: 'info',
        summary: 'Annulé',
        detail: 'Exportation annulée',
      });
    }
  });
}


  //onvertir un tableau d’objets JavaScript en format CSV
  convertToCSV(data: any[]): string {
    const headers = Object.keys(data[0]); // Prendre les noms de propriétés des objets
    const rows = data.map(row =>
      headers.map(header => row[header]).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  }
  
  downloadCSV(csvData: string): void {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sites.csv'; // Nom du fichier exporté
    link.click();
  }
  
  
  
  
  
}
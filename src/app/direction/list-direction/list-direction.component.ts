import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SpeedDialModule } from 'primeng/speeddial';
import { Table, TableModule } from 'primeng/table';
import { Direction } from '../model/Direction';
import { DirectionService } from '../service/direction.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { NgModule } from '@angular/core';
import { DirectionDTO } from '../model/DirectionDTO';
import { Site } from '../../site/model/site';
import { SiteService } from '../../site/service/site.service';
import { PickListModule } from 'primeng/picklist';
import { MultiSelectModule } from 'primeng/multiselect';
import { forkJoin, of } from 'rxjs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';





@Component({
  selector: 'app-list-direction',
  imports: [ TableModule,
      DialogModule,
      FormsModule,
      ButtonModule,
      InputTextModule,
      CommonModule,
      SpeedDialModule,
      SpeedDialModule,
          PickListModule,
          MultiSelectModule,
          ConfirmDialogModule,
           ToastModule,
  FormsModule,
    ReactiveFormsModule,
    ]
    ,
       providers: [ConfirmationService,MessageService],
       schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './list-direction.component.html',
  styleUrl: './list-direction.component.css'
})
export class ListDirectionComponent implements OnInit {

  directions: Direction[] = [];
  selectedDirections: Direction[] = [];
  visible: boolean = false;
  showDialog: boolean = false;  
  selectedDirection: Direction = { id: 0, nom_direction: '', archive: false };
  newDirection: Direction = { id: 0, nom_direction: '', archive: false };
  editVisible: boolean = false;  // Ajout pour gérer la visibilité du formulaire d'édition
  editForm!: FormGroup;  // Ajout du formulaire réactif
  new: DirectionDTO = { 
    id: 0,  // Vous pouvez utiliser null ou 0 si nécessaire
    nom_direction: '', 
    siteIds: [] 
  };
  form!: FormGroup;

  searchText: string = '';
  sites: any[] = []; 
  selectedSites: Site[] = []; // Pour contenir les sites sélectionnés

  @ViewChild('dt') dt!: Table;

  constructor(private directionService: DirectionService, private siteservice : SiteService,
    private messageService: MessageService, private confirmationService: ConfirmationService,private fb: FormBuilder) {this.form = this.fb.group({
    nom_direction: ['', Validators.required],
    siteIds: [[], Validators.required]  
  });}


 ngOnInit(): void {
  this.getDirections();
this.loadSites();

  
 }
 saveDirection() {
  // Implémente la sauvegarde des modifications
  this.visible = false;
}

getDirections(): void {
  forkJoin([
    this.directionService.getAllDirections(),
    this.siteservice.getAllSites()
  ]).subscribe(([directions, allSites]) => {
    this.directions = directions;
    
    const siteRequests = this.directions.map(direction => {
      return direction.id ? 
        this.directionService.getSitesByDirection(direction.id) : 
        of([]);
    });

    forkJoin(siteRequests).subscribe({
      next: (sitesArrays) => {
        this.directions.forEach((direction, index) => {
          direction.sites = sitesArrays[index];
        });
        console.log('Directions avec sites:', this.directions);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des sites:', err);
        this.directions.forEach(direction => direction.sites = []);
      }
    });
  });
}







getItems(direction: Direction): MenuItem[] {
  return [
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => this.archiveDirection(direction)
    },
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => this.openEditDialog(direction)
    }
  ];
}
archiveDirection(direction: Direction): void {
  if (direction.id === undefined) {
    console.error("Impossible d'archiver : l'ID de la direction est indéfini.");
    return;
  }

  this.directionService.archiverDirection(direction.id).subscribe({
    next: (response) => {
      direction.archive = true;
      console.log('Direction archivée avec succès', response);
      this.getDirections();
    },
    error: (err) => {
      console.error('Erreur lors de l\'archivage de la direction', err);
    }
  });
}


confirmArchive(direction: Direction): void {
  this.confirmationService.confirm({
    header: 'Confirmation d\'archivage',
    message: `Voulez-vous vraiment archiver la direction "${direction.nom_direction}" ? Cette action est réversible.`,
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
      this.archiveDirection(direction);
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

openEditDialog(direction: Direction): void {
  if (direction.id === undefined) {
    console.error('ID de la direction est indéfini');
    return;
  }

  this.selectedDirection = { ...direction };
  this.selectedSites = direction.sites ? [...direction.sites] : []; // Copie des sites existants

  this.visible = true;
}


showAddDirectionDialog(): void {
  this.showDialog = true;
  this.newDirection = { id: 0, nom_direction: '', archive: false }; // Ajouter 'archive'
}

addDirection() {
  const rawNom = this.form.get('nom_direction')?.value;
  if (!rawNom || rawNom.trim() === '') {
    this.messageService.add({
      severity: 'error',
      summary: 'Champ requis',
      detail: 'Le nom de la direction est obligatoire.'
    });
    return;
  }
const siteIds = this.form.value.siteIds;

if (!siteIds || siteIds.length === 0) {
  this.messageService.add({
    severity: 'error',
    summary: 'Champ requis',
    detail: 'Veuillez sélectionner au moins un site.'
  });
  return;
}


  const nom = rawNom.trim();
  const cleanedNewName = nom.toLowerCase();

  // 2. Vérification de l'existence
  const exists = this.directions.some(dir =>
    dir.nom_direction.trim().toLowerCase() === cleanedNewName
  );

if (exists) {
  this.messageService.add({
    severity: 'warn', // ✅ Alerte orange
    summary: 'Nom existant',
    detail: 'Une direction avec ce nom existe déjà.'
  });
  return;
}


  // 3. Préparer et envoyer l'objet
  this.new.nom_direction = nom;
  this.new.siteIds = this.selectedSites
    .map(site => site.id)
    .filter(id => id !== undefined) as number[];

  this.directionService.addDirection(this.new).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Direction ajoutée avec succès.'
      });
      this.selectedSites = [];
      this.form.reset(); // Réinitialiser le formulaire
      this.showDialog = false;
      this.getDirections();
    },
    error: (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de l\'ajout de la direction.'
      });
      console.error('Erreur lors de l\'ajout de la direction:', error);
    }
  });
}




  
updateDirection(): void {
  
  if (this.selectedDirection.id) {
    const cleanedUpdatedName = this.selectedDirection.nom_direction.trim().toLowerCase();

    const exists = this.directions.some(dir =>
      dir.nom_direction.trim().toLowerCase() === cleanedUpdatedName &&
      dir.id !== this.selectedDirection.id // Exclure la direction elle-même
    );

    if (exists) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nom existant',
        detail: 'Une autre direction avec ce nom existe déjà.'
      });
      return;
    }

    const updatedDirectionDTO: DirectionDTO = new DirectionDTO(
      this.selectedDirection.id,
      this.selectedDirection.nom_direction.trim(),
      this.selectedSites.map(site => site.id).filter(id => id !== undefined) as number[]
    );

    this.directionService.updateDirection(updatedDirectionDTO).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Direction mise à jour avec succès.'
        });

        const index = this.directions.findIndex(dir => dir.id === this.selectedDirection.id);
        if (index !== -1) {
          this.directions[index] = {
            ...response,
            sites: this.selectedSites
          };
        }

        this.visible = false;
        this.getDirections();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la mise à jour de la direction.'
        });
        console.error('Erreur lors de la mise à jour de la direction', error);
      }
    });
  }
}



exportDirections(): void {
  const hasSelected = this.selectedDirections.length > 0;
  const count = this.selectedDirections.length;

  this.confirmationService.confirm({
    header: 'Confirmer l’exportation',
    message: hasSelected
      ? `Voulez-vous exporter les ${count} direction${count > 1 ? 's' : ''} sélectionnée${count > 1 ? 's' : ''} ?`
      : 'Aucune direction sélectionnée. Voulez-vous exporter toutes les directions ?',
    icon: 'pi pi-exclamation-triangle',
    acceptButtonProps: {
      label: 'Oui',
      icon: 'pi pi-check',
      severity: 'danger'
    },
    rejectButtonProps: {
      label: 'Non',
      icon: 'pi pi-times',
      severity: 'secondary'
    },
    accept: () => {
      let csvData;
      if (hasSelected) {
        csvData = this.convertToCSV(this.selectedDirections);
      } else {
        csvData = this.convertToCSV(this.directions);
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


convertToCSV(data: Direction[]): string {
  const headers = ['id', 'nom_direction', 'archive', 'sites'];
  const rows = data.map(row => [
    row.id,
    `"${row.nom_direction}"`,
    row.archive,
    `"${row.sites?.map(site => site.nom_site).join(';') ?? ''}"`
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}


downloadCSV(csvData: string): void {
  const blob = new Blob([csvData], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'directions.csv';
  link.click();
}

loadSites(): void {
  this.siteservice.getAllSites().subscribe(
    (data: Site[]) => {
      this.sites = data;  // Assigne les sites récupérés à la propriété 'sites'
      console.log('Sites récupérés :', this.sites);  // Vérifie dans la console
    },
    (error: any) => {
      console.error('Erreur lors de la récupération des sites :', error);
    }
  );
}


}
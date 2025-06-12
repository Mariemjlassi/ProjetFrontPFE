import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { CarouselModule } from 'primeng/carousel';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ApiResponse } from '../../formation/model/ApiResponse';
import { FormationService } from '../../formation/service/formation.service';
import { DialogService } from 'primeng/dynamicdialog';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { ProgressBarModule } from 'primeng/progressbar';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
type Severity = "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined;
type Size = "large" | "normal" | "xlarge" | undefined;

@Component({
  selector: 'app-formation-employe',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    TooltipModule,
    CarouselModule,
    DropdownModule,
    TagModule,
    AvatarModule,
    ProgressSpinnerModule,
    FormsModule, 
    CommonModule,
    RatingModule,
    ProgressBarModule,
    TabViewModule,

    CardModule
  ],
  templateUrl: './formation-employe.component.html',
  styleUrls: ['./formation-employe.component.css'],
  providers: [DialogService]
})
export class FormationEmployeComponent implements OnInit {
  @Input() employeId!: number;
  @Output() formationsUpdated = new EventEmitter<void>();
  selectedFormation: ApiResponse | null = null;
displayDetailsDialog: boolean = false;
  formations: ApiResponse[] = [];
  loading = false;
  error: string | null = null;
  activeFilter: string | null = null;
  filterByStat(statType: string): void {
    // Si on clique sur le même filtre, on le désactive
    if (this.activeFilter === statType) {
      this.activeFilter = null;
      return;
    }
    
    this.activeFilter = statType;
  }
  // Configuration des statistiques
  stats = [
    { type: 'total', value: 0, label: 'Total formations', icon: 'pi pi-book' },
    { type: 'success', value: 0, label: 'Réussies', icon: 'pi pi-check-circle' },
    { type: 'warning', value: 0, label: 'Programmes complementaires', icon: 'pi pi-clock' },
    { type: 'danger', value: 0, label: 'Échecs', icon: 'pi pi-times-circle' },
    { type: 'info', value: 0, label: 'En attente', icon: 'pi pi-hourglass' }
  ];
    // Cela semble être la bonne propriété selon l'erreur.
    employe: any = { nom: '', prenom: '', poste: '' };
  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  statusFilters = [
    { label: 'Tous les statuts', value: null },
    { label: 'Réussies', value: 'success' },
    { label: 'Échecs', value: 'failed' },
    { label: 'Programmes complementaires', value: 'in-progress' },
    { label: 'En attente', value: 'pending' }
  ];

  typeFilters = [
    { label: 'Tous les types', value: null },
    { label: 'Interne', value: 'INTERNE' },
    { label: 'Externe', value: 'EXTERNE' },
    { label: 'Certification', value: 'CERTIFICATION' }
  ];

  chartOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      }
    }
  };

  constructor(
    private formationService: FormationService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    if (this.employeId) {
      this.loadFormations();
    }
  }

  private mapApiDataToResponse(data: any[]): ApiResponse[] {
    return data.map(item => ({
      id: item.id,
      employe: item.employe,
      formation: {
        ...item.formation,
        responsableEvaluation: item.formation.responsableEvaluation || item.formation.responsableEvaluation,
        responsableEvaluationExterne: item.formation.responsableEvaluationExterne,
        sousTypeFormation: item.formation.sousTypeFormation,
        typeFormation: item.formation.typeFormation,
        dateDebutPrevue: item.formation.dateDebutPrevue,
        dateFinPrevue: item.formation.dateFinPrevue,
        titrePoste: item.formation.titrePoste,
        valide: item.formation.valide,
        commentaire: item.formation.commentaire,
        commente: item.formation.commente,
        dateDebutReelle: item.formation.dateDebutReelle,
        dateFinReelle: item.formation.dateFinReelle,
        emailEnvoye: item.formation.emailEnvoye,
        fichierPdfUrl: item.formation.fichierPdfUrl,
        employes: item.formation.employes,
        id: item.formation.id,
        titre: item.formation.titre,
        description: item.formation.description
        
      },
      document: item.document,
      evalue: item.evalue,
      resultat: item.resultat,
      res: item.res,
      capabilite: item.capabilite ?? false
    }));
  }

  loadFormations(): void {
    this.loading = true;
    this.error = null;
    
    this.formationService.getFormationsWithDetailsByEmploye(this.employeId).subscribe({
      next: (data) => {
        console.log('Données reçues:', data);
        this.formations = this.mapApiDataToResponse(data);
        
        // Récupérer les infos de l'employé depuis la première formation
        if (this.formations.length > 0) {
          this.employe = this.formations[0].employe;
        } else {
          this.employe = { nom: 'Inconnu', prenom: '', poste: '' };
        }
        
        this.prepareAnalysisData();
        this.updateStats();
        this.loading = false;
      },
      // ...
    });
  }


  refreshFormations(): void {
    this.loadFormations();
    this.formationsUpdated.emit();
  }

  // Méthodes pour les statistiques
  getTotalCount(): number {
    return this.formations.length;
  }

  searchTerm: string = '';

// Correction de la propriété filteredFormations
get filteredFormations(): ApiResponse[] {
  let filtered = this.formations;
  
  // Filtre par recherche textuelle
  if (this.searchTerm) {
    const term = this.searchTerm.toLowerCase();
    filtered = filtered.filter(f => 
      f.formation.titre.toLowerCase().includes(term) ||
      (f.formation.description && f.formation.description.toLowerCase().includes(term)) ||
      (f.formation.typeFormation && f.formation.typeFormation.toLowerCase().includes(term)) ||
      (f.resultat && f.resultat.toLowerCase().includes(term)) ||
      (f.formation.responsableEvaluation?.nom && f.formation.responsableEvaluation.nom.toLowerCase().includes(term)) ||
      (f.formation.responsableEvaluation?.prenom && f.formation.responsableEvaluation.prenom.toLowerCase().includes(term))
    );
  }

  // Filtre par statut si un filtre est actif
  if (this.activeFilter) {
    switch (this.activeFilter) {
      case 'total':
        // Pas de filtre supplémentaire, on garde tout
        break;
      case 'success':
        filtered = filtered.filter(f => f.resultat && f.resultat.toUpperCase() === 'REUSSI');
        break;
      case 'danger':
        filtered = filtered.filter(f => f.resultat && f.resultat.toUpperCase() === 'ECHEC');
        break;
      case 'warning':
        filtered = filtered.filter(f => f.resultat && f.resultat.toUpperCase() === 'PROGRAMME_COMPLEMENTAIRE');
        break;
      case 'info':
        filtered = filtered.filter(f => !f.resultat);
        break;
    }
  }
  
  return filtered;
}






getInProgressCount(): number {
  return this.formations.filter(f => {
    const debut = new Date(f.formation.dateDebutPrevue);
    const fin = new Date(f.formation.dateFinPrevue);
    const now = new Date();
    return debut <= now && fin >= now;
  }).length;
}

  getStatusText(formation: ApiResponse): string {
    if (!formation.resultat) return 'En attente de validation';
    
    switch(formation.resultat.toUpperCase()) {
      case 'REUSSI':
        return 'Réussi';
      case 'ECHEC':
        return 'Échec';
      case 'PROGRAMME_COMPLEMENTAIRE':
        return 'Programme complémentaire';
      default:
        return 'En attente de validation';
    }
  }

  getStatusClass(formation: ApiResponse): string {
    if (!formation.resultat) return 'status-pending';
    
    switch(formation.resultat.toUpperCase()) {
      case 'REUSSI':
        return 'status-success';
      case 'ECHEC':
        return 'status-danger';
      case 'PROGRAMME_COMPLEMENTAIRE':
        return 'status-warning';
      default:
        return 'status-pending';
    }
  }
  getStatusIcon(item: ApiResponse): string {
    if (!item.resultat) return 'pi pi-hourglass';
    
    switch(item.resultat.toUpperCase()) {
      case 'REUSSI':
        return 'pi pi-check-circle';
      case 'ECHEC':
        return 'pi pi-times-circle';
      case 'PROGRAMME_COMPLEMENTAIRE':
        return 'pi pi-exclamation-circle';
      default:
        return 'pi pi-hourglass';
    }
  }
  getStatusSeverity(item: ApiResponse): Severity {
    if (!item.resultat) return 'info';
    
    switch(item.resultat.toUpperCase()) {
      case 'REUSSI':
        return 'success';
      case 'ECHEC':
        return 'danger';
      case 'PROGRAMME_COMPLEMENTAIRE':
        return 'warn';
      default:
        return 'info';
    }
  }

  getResultText(item: ApiResponse): string {
    if (item.res === true) return 'Réussi';
    if (item.res === false) {
      return item.resultat?.includes('COMPLEMENT') 
        ? 'Programme complémentaire' 
        : 'Échec';
    }
    return 'Non évalué';
  }

  showProgressChart(item: ApiResponse): boolean {
    return item.formation.valide === true && item.res !== null;
  }

  getProgressChartData(item: ApiResponse): any {
    return {
      labels: ['Progression'],
      datasets: [
        {
          data: [100],
          backgroundColor: [this.getStatusColor(item)],
          borderWidth: 0
        }
      ]
    };
  }
  getStatusIconColor(item: ApiResponse): string {
    if (!item.resultat) return '#3B82F6'; // bleu pour en attente
    
    switch(item.resultat.toUpperCase()) {
      case 'REUSSI':
        return '#10B981'; // Vert
      case 'ECHEC':
        return '#EF4444'; // Rouge
      case 'PROGRAMME_COMPLEMENTAIRE':
        return '#F59E0B'; // Orange
      default:
        return '#F59E0B';
    }
  }
  

  getStatusColor(item: ApiResponse): string {
    if (item.formation.valide && item.res === true) return '#10B981';
    if (item.formation.valide && item.res === false) return '#EF4444';
    return '#3B82F6';
  }

  canEvaluate(item: ApiResponse): boolean {
    return item.formation.valide === true && item.res === null;
  }

  openEvaluationDialog(item: ApiResponse): void {
    console.log('Évaluation de la formation:', item);
    // Implémentez la logique d'évaluation ici
  }

  showDetails(item: ApiResponse): void {
    this.selectedFormation = item;
    this.displayDetailsDialog = true;
  }

  getAvatarLabel(item: ApiResponse): string {
    const prenom = item.employe.prenom || '';
    const nom = item.employe.nom || '';
    return (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
  }








  getSuccessCount(): number {
    return this.formations.filter(f => 
      f.resultat && f.resultat.toUpperCase() === 'REUSSI'
    ).length;
  }
  
  getFailedCount(): number {
    return this.formations.filter(f => 
      f.resultat && f.resultat.toUpperCase() === 'ECHEC'
    ).length;
  }
  
  getComplementaryProgramCount(): number {
    return this.formations.filter(f => 
      f.resultat && f.resultat.toUpperCase() === 'PROGRAMME_COMPLEMENTAIRE'
    ).length;
  }
  
  get successfulTrainings(): ApiResponse[] {
    return this.formations.filter(f =>
      f.resultat?.toUpperCase() === 'REUSSI'
    );
  }
  
  get potentialPositions(): ApiResponse[] {
    return this.successfulTrainings.filter(f => f.capabilite === true);
  }
  
  get exercisedPositions(): ApiResponse[] {
    return this.successfulTrainings.filter(f => f.capabilite === false);
  }
  




  getPendingValidationCount(): number {
    return this.formations.filter(f => 
      !f.resultat
    ).length;
  }
  private updateStats(): void {
    this.stats = [
      { type: 'total', value: this.getTotalCount(), label: 'Total formations', icon: 'pi pi-book' },
      { type: 'success', value: this.getSuccessCount(), label: 'Réussies', icon: 'pi pi-check-circle' },
      { type: 'danger', value: this.getFailedCount(), label: 'Échecs', icon: 'pi pi-times-circle' },
      { type: 'warning', value: this.getInProgressCount(), label: 'Programmes complementaires', icon: 'pi pi-clock' },
      { type: 'info', value: this.getPendingValidationCount(), label: 'En attente', icon: 'pi pi-hourglass' }
    ];
  }


  getProgressValue(item: ApiResponse): number {
    if (!item.formation.valide) return 0;
    if (item.res === true) return 100;
    if (item.res === false) return 30; // Échec partiel
    return 70; // En cours
  }
  getStatusColorClass(item: ApiResponse): any {
    return {
      'background-color': this.getStatusColor(item),
      'color': 'white',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'width': '40px',
      'height': '40px',
      'border-radius': '50%',
      'font-size': '1.2rem'
    };
  }
  
  getProgressLabel(item: ApiResponse): string {
    const progress = this.getProgressValue(item);
    return `${progress}% complété`;
  }
  
  getFormationSkills(item: ApiResponse): string[] {
    // Implémentez cette méthode selon vos besoins
    return ['Compétence 1', 'Compétence 2'];
  }


  // Dans votre composant principal
displayAnalysisDialog: boolean = false;
analysisData: any;

showAnalysisDialog(): void {
  if (!this.formations || this.formations.length === 0) {
    this.loadFormations(); // Recharge les données si nécessaire
    return;
  }
  
  this.prepareAnalysisData();
  
  if (!this.analysisData) {
    console.error('Les données d analyse n ont pas pu être préparées');
    return;
  }
  
  this.displayAnalysisDialog = true;
  console.log('Dialogue devrait être visible maintenant', this.displayAnalysisDialog);
}

prepareAnalysisData(): void {
  const filteredFormations = this.formations.filter(f => 
    f.resultat === 'REUSSI' &&
    (f.formation.sousTypeFormation === 'POLYVALENCE' || f.formation.sousTypeFormation === 'INTEGRATION')
  );

  const capableFormations = filteredFormations.filter(f => f.capabilite === true);
  const experiencedFormations = filteredFormations.filter(f => f.capabilite === false);

  this.analysisData = {
    capableFormations,
    experiencedFormations,
  };
}


getInitials(nom: string, prenom: string): string {
  return (prenom?.charAt(0) || '') + (nom?.charAt(0) || '');
}

exportAnalysisToPdf(): void {
  // Implémentez l'export PDF ici
  console.log('Export PDF functionality to be implemented');
}
printDialog() {
  const printContents = document.getElementById('analysisDialogContent')?.innerHTML;
  if (printContents) {
    const popupWin = window.open('', '_blank', 'width=800,height=600');
    if (popupWin) {
      popupWin.document.open();
      popupWin.document.write(`
        <html>
          <head>
            <title>Analyse des Compétences</title>
            <style>
              /* Ajoute ici les styles nécessaires à l'impression */
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
              }
              .competency-card {
                border: 1px solid #ddd;
                padding: 10px;
                margin-bottom: 10px;
              }
              h3, h4 {
                margin-bottom: 5px;
              }
              .competency-meta, .competency-application {
                font-size: 14px;
                margin-top: 4px;
              }
              .section-header {
                margin-top: 20px;
              }
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
  background-color: #f8f9fa;
  border-radius: 8px;

  i {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #bdc3c7;
  }

  p {
    margin: 0;
  }
}
  .analysis-synthesis {
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-top: 1px solid #f0f0f0;
  border-radius: 0 0 12px 12px;

  h3 {
    margin-top: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #2c3e50;
    font-size: 1.25rem;
  }

  .synthesis-content {
    p {
      margin: 0.75rem 0;
      line-height: 1.5;
    }
  }
}
.competency-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  }

  .competency-icon {
    font-size: 1.25rem;
    color: white;
    background: var(--primary-color);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 0.25rem;
  }

  .competency-details {
    flex-grow: 1;

    h4 {
      margin: 0 0 0.5rem;
      color: #2c3e50;
      font-size: 1rem;
    }

    .competency-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.85rem;
      color: #7f8c8d;
      margin-bottom: 0.5rem;

      i {
        margin-right: 0.25rem;
      }
    }

    .competency-application {
      font-size: 0.9rem;
      background: rgba(0,0,0,0.03);
      padding: 0.5rem;
      border-radius: 4px;
      margin: 0.5rem 0;

      i {
        margin-right: 0.5rem;
      }
    }

    .mastery-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #7f8c8d;
      margin-top: 0.5rem;

      .p-progressbar {
        flex-grow: 1;
        height: 4px;
      }
    }
  }

  &.potential-card {
    background-color: #FFF9E6;
    border-left-color: #FFC107;

    .competency-icon {
      background-color: #FFC107;
    }
  }

  &.experience-card {
    background-color: #F0F9F0;
    border-left-color: #4CAF50;

    .competency-icon {
      background-color: #4CAF50;
    }
  }
}
  .analysis-section {
  .section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;

    .section-icon {
      font-size: 1.5rem;
      color: var(--primary-color);
      background: rgba(13, 110, 253, 0.1);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #2c3e50;
      flex-grow: 1;
    }

    .section-subtitle {
      margin: 0.25rem 0 0;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .section-badge {
      background-color: #f0f0f0;
      color: #7f8c8d;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
    }
  }

  &.potential-section .section-icon {
    color: #FFC107;
    background: rgba(255, 193, 7, 0.1);
  }

  &.experience-section .section-icon {
    color: #4CAF50;
    background: rgba(76, 175, 80, 0.1);
  }
}

/* Liste des compétences */
.competency-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
  .employee-profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(to right, #f8f9fa, #ffffff);
  border-bottom: 1px solid #f0f0f0;

  .avatar-container {
    position: relative;
    
    .profile-avatar {
      background-color: var(--primary-color);
      color: white;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .employee-status-indicator {
      position: absolute;
      bottom: 5px;
      right: 5px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #e0e0e0;
      border: 2px solid white;

      &.has-potential {
        background-color: #4CAF50;
      }
    }
  }

  .employee-profile-info {
    flex-grow: 1;

    h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
    }

    .employee-position {
      margin: 0.25rem 0 0;
      color: #7f8c8d;
      font-size: 0.95rem;
    }
  }

  .competency-summary {
    display: flex;
    gap: 1.5rem;
    margin-top: 1rem;

    .summary-item {
      text-align: center;
      min-width: 100px;

      .summary-value {
        font-size: 1.5rem;
        font-weight: 600;
        line-height: 1;
      }

      .summary-label {
        font-size: 0.8rem;
        color: #7f8c8d;
        margin-top: 0.25rem;
      }

      &.mastered .summary-value {
        color: #4CAF50;
      }

      &.potential .summary-value {
        color: #FFC107;
      }
    }
  }
}

.professional-analysis-dialog {
  .p-dialog-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #f0f0f0;
    background: #f8f9fa;
    border-radius: 12px 12px 0 0;
  }

  .p-dialog-content {
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
}
.analysis-sections-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem;
}



              
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${printContents}
          </body>
        </html>
      `);
      popupWin.document.close();
    }
  }
}

generateSuccessCertificate(formation: ApiResponse): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Couleurs et dimensions
  const darkBlue = '#002366';
  const gold = '#D4AF37';
  const darkRed = '#8B0000';

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Bandeau bleu en haut
  doc.setFillColor(0, 35, 102);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setTextColor(255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('L\'Accumulateur Tunisien ASSAD', pageWidth / 2, 15, { align: 'center' });

  // Bordure élégante
  doc.setDrawColor(169, 169, 169);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');

  // Logo
  try {
    const logoPath = 'assad.png'; // chemin relatif dans /assets
    doc.addImage(logoPath, 'PNG', margin, 30, 40, 20);
  } catch (error) {
    console.error('Erreur logo :', error);
    doc.text('ASSAD', margin, 40);
  }

  // Titre
  doc.setFontSize(22);
  doc.setTextColor(darkBlue);
  doc.setFont('helvetica', 'bold');
  doc.text('ATTESTATION DE RÉUSSITE', pageWidth / 2, 60, { align: 'center' });

  // Ligne dorée décorative
  doc.setDrawColor(gold);
  doc.setLineWidth(1);
  doc.line(margin, 65, pageWidth - margin, 65);

  // Introduction
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.setFont('helvetica', 'normal');
  let yPos = 80;
  const intro = `Nous soussignés, certifions que Monsieur/Madame ${this.employe.nom.toUpperCase()} ${this.employe.prenom}, 
matricule ${this.employe.matricule}, a suivi avec succès la formation professionnelle suivante :`;
  doc.text(intro, margin, yPos, { maxWidth: contentWidth });

  // Encadré de détails
  yPos += 30;
  doc.setFillColor(245, 245, 245);
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, yPos, contentWidth, 60, 'FD');

  const frameMargin = 5;
  let frameY = yPos + 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Intitulé de la formation :', margin + frameMargin, frameY);
  doc.setFont('helvetica', 'normal');
  doc.text(formation.formation.titre, margin + 60, frameY);

  frameY += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Type :', margin + frameMargin, frameY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formation.formation.typeFormation} (${formation.formation.sousTypeFormation || 'N/A'})`, margin + 60, frameY);

  frameY += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Période :', margin + frameMargin, frameY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Du ${this.formatDate(formation.formation.dateDebutPrevue)} au ${this.formatDate(formation.formation.dateFinPrevue)}`, margin + 60, frameY);

  if (formation.formation.titrePoste) {
    frameY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Poste concerné :', margin + frameMargin, frameY);
    doc.setFont('helvetica', 'normal');
    doc.text(formation.formation.titrePoste, margin + 60, frameY);
  }

  // Validation par responsable
  yPos += 75;
  const responsable = formation.formation.responsableEvaluationExterne || formation.formation.responsableEvaluation;
  if (responsable) {
    const type = formation.formation.responsableEvaluationExterne ? 'Responsable externe' : 'Responsable interne';
    doc.text(`Cette formation est validée par ${type} : M./Mme ${responsable.prenom} ${responsable.nom.toUpperCase()}`, margin, yPos, {
      maxWidth: contentWidth
    });
  }

  // Résultat
  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.text('Résultat :', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formation.resultat || 'Formation validée', margin + 25, yPos);

  // Mention
  yPos += 15;
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(darkBlue);
  doc.text('Cette attestation est délivrée pour servir et valoir ce que de droit.', pageWidth / 2, yPos, { align: 'center' });

  // Date et signature
  const footerY = pageHeight - margin - 30;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Fait à Tunis, le ${this.formatDate(new Date().toString())}`, margin, footerY);

  doc.setDrawColor(darkRed);
  doc.setLineWidth(0.8);
 
 
  const cachetY = footerY - 40; 
  // Cachet
  try {
    const cachetPath = 'cache.jpg'; // chemin relatif vers votre image dans /assets
    const cachetWidth = 30; // largeur en mm
    const cachetHeight = 30; // hauteur en mm (ajuster selon proportions)
    const cachetX = pageWidth - margin - 30 - (cachetWidth/2);
    const cachetY = footerY + 5;
    
    doc.addImage(cachetPath, 'JPEG', cachetX, cachetY, cachetWidth, cachetHeight);
    
    // Optionnel: texte sous le cachet
    doc.setFontSize(7);
    doc.setTextColor(100);
    doc.text('Cachet Officiel', pageWidth - margin - 30, cachetY + cachetHeight + 5, { align: 'center' });
  } catch (error) {
    console.error('Erreur lors du chargement du cachet:', error);
    // Fallback si l'image ne charge pas
    doc.setDrawColor(darkRed);
    doc.setLineWidth(1);
    doc.circle(pageWidth - margin - 30, footerY + 25, 15, 'D');
    doc.setFontSize(7);
    doc.text('Cachet', pageWidth - margin - 30, footerY + 25, { align: 'center' });
  }
  // Enregistrement
  doc.save(`Attestation_Formation_${this.employe.nom.toUpperCase()}.pdf`);
}

private formatDate(dateString: string): string {
  if (!dateString) return '--/--/----';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}


}

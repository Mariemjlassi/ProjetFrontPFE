import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { JournalActionService } from '../utilisateur/service/journal-action.service';
import { UtilisateurService } from '../utilisateur/service/utilisateur.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { TimelineModule } from 'primeng/timeline'; // Ajoutez cette ligne
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { AiDashboardService } from '../services/ai-dashboard.service';
import { ProgressBarModule } from 'primeng/progressbar';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    ButtonModule,
    DatePickerModule,
    TableModule,
    CalendarModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    DialogModule,
    MenuModule,
    TabMenuModule,
    ToolbarModule,
    ButtonGroupModule,
    CardModule,
    ListboxModule,
    TimelineModule,
    ProgressBarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  activityTypeOptions: any[] = [];
  selectedTypeFilter: any = null;
  activities: any[] = [];
  users: any[] = [];
  recentActivities: any[] = [];
  chart: any;
  selectedFilter: 'week' | 'month' | 'year' = 'week';
  timeLabel = 'la semaine';
  timeChart: any;
  showAllActivities = false;
  displayedColumns: string[] = ['action', 'utilisateur', 'description', 'date'];
  filteredActivities: any[] = [];
  activityTypes: string[] = [];
  selectedDateFilter: Date | null = null;
  displayActivitiesDialog: boolean = false;
  chartType: 'line' | 'bar' = 'line';
  timeRangeItems: any[] = [];
  activeTimeRange: any;
  failedAttempts: any[] = [];
  aiStatus: string = '';
activityTrends: string = '';
securityAnalysis: string = '';
isTrainingModel: boolean = false;
trainingProgress: number = 0;

  alertLevels = {
    warning: 'warning',
    danger: 'danger'
  };

  stats = {
    totalUsers: 0,
    lockedAccounts: 0,
    totalActions: 0,
    lastWeekActions: 0,
  };

  exportItems: any[] = [];
  constructor(
    private journalService: JournalActionService,
    private userService: UtilisateurService,
    private aiService: AiDashboardService
    
  ) {}

  // Ajoutez cette propriété à votre classe


// Ajoutez cette méthode pour analyser les données


// Méthode pour appeler l'API OpenAI


  

  ngOnInit(): void {
    this.loadData();
    this.initTimeRangeMenu();
  }

  initTimeRangeMenu() {
  this.timeRangeItems = [
    { label: 'Hebdomadaire', icon: 'pi pi-calendar', command: () => this.setTimeFilter('week') },
    { label: 'Mensuel', icon: 'pi pi-calendar', command: () => this.setTimeFilter('month') },
    { label: 'Annuel', icon: 'pi pi-calendar', command: () => this.setTimeFilter('year') }
  ];
  this.exportItems = [
  {
    label: 'Exporter PDF',
    items: [
      { label: 'Vue actuelle', icon: 'pi pi-file-pdf', command: () => this.exportToPDF('current') },
      { label: 'Cette semaine', icon: 'pi pi-file-pdf', command: () => this.exportToPDF('week') },
      { label: 'Ce mois', icon: 'pi pi-file-pdf', command: () => this.exportToPDF('month') },
      { label: 'Cette année', icon: 'pi pi-file-pdf', command: () => this.exportToPDF('year') }
    ]
  }
];
  this.activeTimeRange = this.timeRangeItems[0];
}

setChartType(type: 'line' | 'bar') {
  this.chartType = type;
  this.initTimeChart();
}

getLegendItems() {
  return [
    { label: 'Activités', color: 'rgb(163, 27, 57)' }
  ];
}

  loadData() {
  this.journalService.getAllJournalActions().subscribe(actions => {
    this.activities = actions;
    this.recentActivities = actions.slice(0, 5);
    this.stats.totalActions = actions.length;
    this.stats.lastWeekActions = this.getLastWeekActions(actions);
    this.activityTypes = [...new Set(actions.map(a => a.action))];

    this.failedAttempts = actions
      .filter(a => a.action === 'TENTATIVE_CONNEXION_ECHOUEE')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

      this.analyzeDataWithAI();
    this.activityTypeOptions = [
      { label: 'Tous les types', value: null },
      ...this.activityTypes.map(type => ({ label: type, value: type }))
    ];

    // Attendre que la vue soit mise à jour avant d'initialiser les graphiques
    this.destroyCharts();
    this.initCharts(); 
  });

  this.userService.getAllUsers().subscribe(users => {
    this.users = users;
    this.stats.totalUsers = users.length;
    this.stats.lockedAccounts = users.filter(u => u.accountLocked).length;
  });
}

  async analyzeDataWithAI() {
  try {
    this.isTrainingModel = true;
    this.trainingProgress = 0;
    
    // Remplacez la simulation par un vrai entraînement
    await this.aiService.trainModel(this.stats);
    
    // Mise à jour de la progression (visuelle seulement)
    const interval = setInterval(() => {
      this.trainingProgress += 10;
      if (this.trainingProgress >= 100) {
        clearInterval(interval);
        this.finalizeAnalysis();
      }
    }, 200);
    
  } catch (error) {
    console.error('Erreur IA:', error);
    this.isTrainingModel = false;
    this.aiStatus = "Erreur lors de l'analyse IA";
  }
}

private async finalizeAnalysis() {
  try {
    this.aiStatus = await this.aiService.predictSystemStatus(this.stats);
    this.activityTrends = this.aiService.analyzeActivityTrends(this.activities);
    
    this.securityAnalysis = this.aiService.detectSecurityAnomalies(
      this.failedAttempts.filter(a => {
        const date = new Date(a.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date > weekAgo;
      })
    );
  } catch (e) {
    console.error(e);
  } finally {
    this.isTrainingModel = false;
  }
}

resetAIAnalysis() {
  this.aiStatus = '';
  this.activityTrends = '';
  this.securityAnalysis = '';
}

  toggleAllActivities() {
    this.displayActivitiesDialog = !this.displayActivitiesDialog;
    if (this.displayActivitiesDialog) {
      this.resetFilters();
    }
  }

  filterByDate(event: any) {
    this.selectedDateFilter = event.value;
    this.applyFilters();
  }
  filterByType(type: string) {
    this.selectedTypeFilter = type;
    this.applyFilters();
  }

  getPrimeNgActivityIcon(action: string): string {
    switch (action.toLowerCase()) {
      case 'Login':
        return 'pi pi-sign-in';
      default:
        return 'pi pi-info-circle';
    }
  }

  getAlertLevel(attempt: any): string {
  // Vérifie si c'est un déverrouillage ou un échec avec 3+ tentatives
  if (attempt.action === 'Déverrouillage' || 
      (attempt.action === 'TENTATIVE_CONNEXION_ECHOUEE' && this.getAttemptCount(attempt) >= 3)) {
    return this.alertLevels.danger;
  }
  return this.alertLevels.warning;
}

getAlertStatus(attempt: any): string {
  const level = this.getAlertLevel(attempt);
  return level === this.alertLevels.danger ? 'Compte bloqué' : 'Avertissement';
}
getAttemptCount(attempt: any): number {
  const attemptMatch = attempt.description.match(/Tentative (\d+)/);
  return attemptMatch ? parseInt(attemptMatch[1], 10) : 0;
}

getAlertIcon(attempt: any): string {
  // Vérifie si c'est un déverrouillage ou un échec avec 3+ tentatives
  if (attempt.action === 'Déverrouillage' || 
      (attempt.action === 'TENTATIVE_CONNEXION_ECHOUEE' && this.getAttemptCount(attempt) >= 3)) {
    return 'pi pi-lock';
  }
  return 'pi pi-exclamation-triangle';
}

  applyFilters() {
    let filtered = [...this.activities];

    // Filtre par date
    if (this.selectedDateFilter) {
      filtered = filtered.filter((activity) => {
        const activityDate = new Date(activity.timestamp);
        return (
          activityDate.toDateString() ===
          this.selectedDateFilter?.toDateString()
        );
      });
    }

    // Filtre par type
    if (this.selectedTypeFilter && this.selectedTypeFilter !== 'all') {
      filtered = filtered.filter(
        (activity) => activity.action === this.selectedTypeFilter
      );
    }

    this.filteredActivities = filtered;
  }

  resetFilters() {
    this.selectedDateFilter = null;
    this.selectedTypeFilter = null;
    this.filteredActivities = [...this.activities];
    this.applyFilters();
  }
  private getLastWeekActions(actions: any[]): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return actions.filter((a) => new Date(a.timestamp) > oneWeekAgo).length;
  }

  // Mettez à jour votre fichier TS pour les couleurs des graphiques
  private initCharts() {
  // Détruire les anciens graphiques proprement
  this.destroyCharts();

  // Attendre que la vue soit mise à jour
  setTimeout(() => {
    this.createActionChart();
    this.createRoleChart();
    this.initTimeChart();
  }, 0);
}

private destroyCharts() {
  if (this.chart) {
    this.chart.destroy();
    this.chart = null;
  }
  if (this.timeChart) {
    this.timeChart.destroy();
    this.timeChart = null;
  }
}

private createActionChart() {
  const ctx = document.getElementById('actionChart') as HTMLCanvasElement;
  if (!ctx) return;

  const actionCounts = this.activities.reduce((acc, curr) => {
    acc[curr.action] = (acc[curr.action] || 0) + 1;
    return acc;
  }, {});

  this.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(actionCounts),
      datasets: [{
        label: 'Nombre d\'actions',
        data: Object.values(actionCounts),
        backgroundColor: 'rgba(255, 121, 121, 0.14)',
        borderColor: 'rgb(201, 22, 22)',
        borderWidth: 2,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(255, 121, 121, 0.29)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Statistiques des Actions',
          color: '#2B3467',
          font: { size: 16 }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#2B3467' } },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { color: '#2B3467' }
        }
      }
    }
  });
}

private createRoleChart() {
  const ctx = document.getElementById('roleChart') as HTMLCanvasElement;
  if (!ctx) return;

  const roleCounts = this.users.reduce((acc, curr) => {
    acc[curr.role] = (acc[curr.role] || 0) + 1;
    return acc;
  }, {});

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(roleCounts),
      datasets: [{
        label: 'Répartition des rôles',
        data: Object.values(roleCounts),
        backgroundColor: ['#133E87', '#608BC1', '#88C273', '#180161', '#180161'],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#2B3467', font: { size: 12 } }
        },
        title: {
          display: true,
          text: 'Répartition des Rôles',
          color: '#2B3467',
          font: { size: 16 }
        }
      },
      cutout: '70%'
    }
  });
}
  private initTimeChart() {
  const ctx = document.getElementById('timeChart') as HTMLCanvasElement;
  if (!ctx) {
  console.warn('Canvas timeChart non trouvé.');
  return;
}

  
  if (this.timeChart) {
    this.timeChart.destroy();
  }

  const { labels, data } = this.prepareTimeData();
  
  const chartConfig: any = {
    type: this.chartType,
    data: {
      labels: labels,
      datasets: [{
        label: 'Nombre d\'actions',
        data: data,
        borderColor: 'rgb(27, 163, 75)',
        backgroundColor: this.chartType === 'bar' ? 'rgba(185, 255, 195, 0.31)' : 'rgba(223, 255, 224, 0.46)',
        borderWidth: 2,
        tension: 0.4,
        fill: this.chartType === 'line'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          display: false,
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 12,
          cornerRadius: 6
        }
      },
      scales: {
        x: {
          grid: { 
            display: false,
            color: 'rgba(0,0,0,0.05)'
          },
          title: {
            display: true,
            text: this.getTimeAxisLabel(),
            font: { weight: 'bold' }
          },
          ticks: {
            font: { size: 12 }
          }
        },
        y: {
          beginAtZero: true,
          grid: { 
            color: 'rgba(0,0,0,0.05)'
          },
          title: {
            display: true,
            text: 'Nombre d\'actions',
            font: { weight: 'bold' }
          },
          ticks: {
            font: { size: 12 }
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuad'
      }
    }
  };

  if (this.chartType === 'bar') {
    chartConfig.options.barPercentage = 0.6;
    chartConfig.options.categoryPercentage = 0.8;
  }

  this.timeChart = new Chart(ctx, chartConfig);
}

  private prepareTimeData() {
  const now = new Date();
  let labels: string[] = [];
  let data: number[] = [];
  let startDate: Date, endDate: Date;

  // Créer une copie de la date actuelle pour éviter les effets de bord
  const currentDate = new Date(now);

  switch (this.selectedFilter) {
    case 'week': {
      const monday = new Date(currentDate);
      monday.setDate(monday.getDate() - monday.getDay() + (monday.getDay() === 0 ? -6 : 1));
      startDate = new Date(monday);
      endDate = new Date(monday);
      endDate.setDate(monday.getDate() + 6);
      break;
    }
    case 'month': {
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      break;
    }
    case 'year': {
      startDate = new Date(currentDate.getFullYear(), 0, 1);
      endDate = new Date(currentDate.getFullYear(), 11, 31);
      break;
    }
    default:
      return { labels: [], data: [] };
  }

  // Cas spécial pour l'année - générer les mois
  if (this.selectedFilter === 'year') {
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(currentDate.getFullYear(), month, 1);
      const key = this.formatDateKey(monthDate, 'month');
      labels.push(key);
      data.push(this.countActionsForDate(monthDate, 'month'));
    }
    return { labels, data };
  }

  // Génération des dates intermédiaires pour semaine et mois
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Exclure le dimanche (jour 0)
    if (d.getDay() === 0) continue;

    const key = this.formatDateKey(new Date(d), 'day');
    
    // Vérifier la duplication
    if (!labels.includes(key)) {
      labels.push(key);
      data.push(this.countActionsForDate(new Date(d), 'day'));
    }
  }

  return { labels, data };
}

private formatDateKey(date: Date, granularity: 'day' | 'month'): string {
  if (this.selectedFilter === 'year') {
    return date.toLocaleDateString('fr-FR', { month: 'long' });
  }
  
  if (granularity === 'month') {
    return date.toLocaleDateString('fr-FR', { month: 'long' });
  }
  
  // Format pour les jours (semaine et mois)
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: this.selectedFilter === 'month' ? 'long' : undefined
  }).replace(/^\w/, c => c.toUpperCase());
}

private countActionsForDate(date: Date, granularity: 'day' | 'month'): number {
  return this.activities.filter(activity => {
    const activityDate = new Date(activity.timestamp);
    
    if (this.selectedFilter === 'year') {
      return activityDate.getMonth() === date.getMonth() && 
             activityDate.getFullYear() === date.getFullYear();
    }
    
    if (granularity === 'day') {
      return activityDate.toDateString() === date.toDateString();
    }
    
    return activityDate.getMonth() === date.getMonth() && 
           activityDate.getFullYear() === date.getFullYear();
  }).length;
}

private getTimeAxisLabel() {
  switch (this.selectedFilter) {
    case 'week': return 'Jours de la semaine (Lun-Sam)';
    case 'month': return 'Jours du mois (Lun-Sam)';
    case 'year': return 'Mois de l\'année';
    default: return '';
  }
}


  private getTimeKey(date: Date): string {
    switch (this.selectedFilter) {
      case 'week':
        return `S${this.getWeekNumber(date)} ${date.getFullYear()}`;
      case 'month':
        return date.toLocaleString('default', { month: 'long' });
      case 'year':
        return date.getFullYear().toString();
      default:
        return '';
    }
  }

  private getWeekNumber(d: Date) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(
      ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
  }

 

  setTimeFilter(filter: 'week' | 'month' | 'year') {
    this.selectedFilter = filter;
    this.timeLabel = this.getTimeLabel();
    this.initTimeChart();
  }

  private getTimeLabel() {
    switch (this.selectedFilter) {
      case 'week':
        return 'la semaine';
      case 'month':
        return 'le mois';
      case 'year':
        return "l'année";
      default:
        return '';
    }
  }
  getActivityIcon(action: string): string {
    switch (action.toLowerCase()) {
      case 'connexion':
        return 'login';
      case 'création':
        return 'add_circle';
      case 'modification':
        return 'edit';
      case 'suppression':
        return 'delete';
      default:
        return 'notifications';
    }
  }

  getActivityIconClass(action: string): string {
    switch (action.toLowerCase()) {
      case 'connexion':
        return 'login-activity';
      case 'création':
        return 'create-activity';
      case 'modification':
        return 'update-activity';
      case 'suppression':
        return 'delete-activity';
      default:
        return 'other-activity';
    }
  }

  async exportToPDF(exportRange: 'current' | 'week' | 'month' | 'year' = 'current') {
  // Déterminer le titre en fonction de la période
  let title = 'Rapport du Tableau de Bord';
  let fileName = 'dashboard-report';
  
  switch(exportRange) {
    case 'week':
      title += ' - Hebdomadaire';
      fileName += '-hebdomadaire';
      break;
    case 'month':
      title += ' - Mensuel';
      fileName += '-mensuel';
      break;
    case 'year':
      title += ' - Annuel';
      fileName += '-annuel';
      break;
    default:
      title += ' - Actuel';
      fileName += '-actuel';
  }

  // Filtrer les données si nécessaire
  let dataToExport = this.activities;
  const now = new Date();
  
  if (exportRange !== 'current') {
    const startDate = new Date();
    
    switch(exportRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    dataToExport = this.activities.filter(a => new Date(a.timestamp) >= startDate);
  }

  // Créer le PDF
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Ajouter le titre
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text(title, 105, 20, { align: 'center' });
  
  // Ajouter la date
  doc.setFontSize(12);
  doc.text(`Généré le: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
  
  // Ajouter les métriques
  doc.setFontSize(14);
  doc.text('Métriques Clés', 20, 45);
  
  // Dessiner des cartes pour les métriques
  this.addMetricCard(doc, 'Utilisateurs', this.stats.totalUsers, 20, 50);
  this.addMetricCard(doc, 'Comptes Verrouillés', this.stats.lockedAccounts, 70, 50);
  this.addMetricCard(doc, 'Activités Total', this.stats.totalActions, 120, 50);
  this.addMetricCard(doc, 'Activités Récentes', dataToExport.length, 170, 50);
  
  // Ajouter les graphiques
  await this.addChartToPDF(doc, 'actionChart', '', 20, 80);
  await this.addChartToPDF(doc, 'timeChart', 'Évolution des Activités', 20, 150);
  await this.addChartToPDF(doc, 'roleChart', '', 110, 80);
  
  // Ajouter les alertes
  doc.setFontSize(14);
  doc.text('Alertes de Sécurité', 20, 220);
  
  const alerts = this.failedAttempts.slice(0, 5);
  alerts.forEach((alert, i) => {
    this.addAlertToPDF(doc, alert, 20, 225 + (i * 15));
  });
  
  // Sauvegarder le PDF
  doc.save(`${fileName}.pdf`);
}

private addMetricCard(doc: jsPDF, title: string, value: number, x: number, y: number) {
  doc.setDrawColor(200);
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(x, y, 45, 25, 2, 2, 'FD');
  doc.setFontSize(12);
  doc.text(title, x + 23, y + 8, { align: 'center' });
  doc.setFontSize(14);
  doc.text(value.toString(), x + 23, y + 16, { align: 'center' });
}

private addAlertToPDF(doc: jsPDF, alert: any, x: number, y: number) {
  doc.setFontSize(10);
  doc.text(`${alert.utilisateur?.username || 'Utilisateur inconnu'} - ${alert.description}`, x, y);
}

private async addChartToPDF(doc: jsPDF, chartId: string, title: string, x: number, y: number) {
  const chartElement = document.getElementById(chartId) as HTMLCanvasElement;
  if (!chartElement) return;
  
  const canvas = await html2canvas(chartElement);
  const imgData = canvas.toDataURL('image/png');
  
  doc.setFontSize(12);
  doc.text(title, x, y - 5);
  doc.addImage(imgData, 'PNG', x, y, 80, 60);
}

// Ajouter en haut du fichier


// Ajouter cette méthode dans la classe
exportFilteredToPDF() {
  const doc = new jsPDF();
  
  // Titre
  doc.setFontSize(18);
  doc.text('Rapport des Activités Filtrées', 15, 20);
  
  // Métadonnées
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Généré le: ${new Date().toLocaleDateString()}`, 15, 27);
  doc.text(`Filtres appliqués: ${this.getCurrentFiltersText()}`, 15, 33);

  // Configuration du tableau
  const columns = ['Action', 'Utilisateur', 'Description', 'Date'];
  const rows = this.filteredActivities.map(activity => [
    activity.action,
    activity.utilisateur?.username || 'Inconnu',
    activity.description,
    new Date(activity.timestamp).toLocaleDateString()
  ]);

  // Génération du tableau
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 40,
    styles: { fontSize: 9 },
    theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  doc.save('activites-filtrees.pdf');
}

private getCurrentFiltersText(): string {
  let filters = [];
  if (this.selectedDateFilter) {
    filters.push(`Date: ${this.selectedDateFilter.toLocaleDateString()}`);
  }
  if (this.selectedTypeFilter) {
    filters.push(`Type: ${this.selectedTypeFilter}`);
  }
  return filters.join(' | ') || 'Aucun filtre';
}
}

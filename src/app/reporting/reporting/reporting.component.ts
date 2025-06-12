import { Component, OnInit } from '@angular/core';
import { EmployeReportingDTO } from '../model/employe-reporting-dto';
import { EmployeReportingService } from '../service/employe-reporting.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { AccordionModule } from 'primeng/accordion';
import { TimelineModule } from 'primeng/timeline';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalendarModule } from 'primeng/calendar';
import { trigger, transition, style, animate } from '@angular/animations';
import { EmoloyeService } from '../../employe/service/emoloye.service';
import 'chartjs-chart-matrix';
import { Chart, registerables } from 'chart.js';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import { DiplomeService } from '../../diplome/service/diplome.service';
import { DirectionService } from '../../direction/service/direction.service';
import { PosteService } from '../../poste/service/poste.service';
interface SocieteGroup {
  [key: string]: Array<{
    'Employé': string;
    'Poste Actuel': string | undefined;
    'Poste dans la société': string;
    'Période': string;
  }>;
}

interface DiplomaDataItem {
  'Diplôme'?: string;
  'Nombre d\'employés'?: number;
  'Nom'?: string;
  'Prénom'?: string;
  'Poste'?: string | undefined;
  'Direction'?: string | undefined;
  'Date d\'Obtention'?: string;
}

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    FormsModule, 
    ReactiveFormsModule, 
    TooltipModule, 
    InputTextModule, 
    IconFieldModule,
    ButtonModule,
    DropdownModule,
    TagModule,
    ChartModule,
    AccordionModule,
    TimelineModule,
    ProgressSpinnerModule,
    DialogModule,
    TabViewModule,
    CalendarModule
  ],
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.css'],
  animations: [
    trigger('slide', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})

export class ReportingComponent implements OnInit {
  showFilters = true;
  employes: EmployeReportingDTO[] = [];
  filteredEmployes: EmployeReportingDTO[] = [];
  isLoading = true;
  displayEmployeeDialog = false;
  selectedEmployee: EmployeReportingDTO | null = null;
  experienceLineChartData: any;

  allDiplomes: any[] = [];
  allDirections: any[] = [];
  allPostes: any[] = [];

  selectedPoste: string = '';
selectedAnnee: number | null = null;
postesDisponibles: string[] = [];
anneesDisponibles: number[] = [];
formationChart: any;

  // Filtres
  nomFilter: string = '';
  prenomFilter: string = '';
  matriculeFilter: string = '';
  emailFilter: string = '';
  posteFilter: string = '';
  diplomeFilter: string = '';
  directionFilter: string = '';
  societeFilter: string = '';
  
  // Options pour les dropdowns
  directions: string[] = [];
  postes: string[] = [];
  diplomes: string[] = [];
  societes: string[] = [];

  // Statistiques
  totalEmployees = 0;

  // Données pour les graphiques
  directionChartData: any;
  posteChartData: any;
  chartOptions: any;
  // Ajoutez ces nouvelles propriétés
lineChartOptions: any;
stackedBarOptions: any;
radarOptions: any;
doughnutOptions: any;

directionLineChartData: any;
diplomaBarChartData: any;
experienceRadarData: any;
posteDoughnutData: any;
Math: any;
formationTitreFilter: string = '';
formationTypeFilter: string = '';
formationSousTypeFilter: string = '';
formationPeriodeStart: Date | null = null;
formationPeriodeEnd: Date | null = null;

formationCalendarData: any;
heatmapOptions: any;

  constructor(
    private reportingService: EmployeReportingService,
    private diplomeService: DiplomeService,
    private directionService: DirectionService,
    private posteService: PosteService
    
  ) {
    Chart.register(MatrixController, MatrixElement, ...registerables);
   }

  private getAnneesFormationsDisponibles(employes: EmployeReportingDTO[]): number[] {
  const annees = new Set<number>();
  employes.forEach(emp => {
    const periodes = emp.periodesFormations?.split(', ') || [];
    periodes.forEach(p => {
      const start = p.split(' - ')[0];
      const year = new Date(start).getFullYear();
      if (!isNaN(year)) annees.add(year);
    });
  });
  return Array.from(annees).sort((a, b) => b - a);
}



  ngOnInit(): void {
    this.loadReporting();
    this.initChartOptions();
    this.prepareAnalyticsData();
  this.loadEmployes();
  }

// reporting.component.ts




  loadEmployes(): void {
  this.reportingService.getEmployeReporting().subscribe(data => {
    this.employes = data;
    this.filteredEmployes = [...data];
    
    this.postesDisponibles = [...new Set(data.map(e => e.posteActuel).filter(Boolean))];
    this.anneesDisponibles = this.getAnneesFormationsDisponibles(data);
    
    this.updateFormationChart();
  });
}

  

  updateFormationChart(): void {
  const filtered = this.employes.filter(emp => {
    const posteOk = !this.selectedPoste || emp.posteActuel === this.selectedPoste;
    const anneeOk = !this.selectedAnnee || this.hasFormationInYear(emp, this.selectedAnnee);
    return posteOk && anneeOk;
  });

  const data = this.getTopFormationsData(filtered);
  const backgroundColors = [
    'rgba(137, 16, 185, 0.1)', 
    'rgba(226, 242, 255, 0.66)', 
    'rgba(217, 255, 203, 0.46)', 
    'rgba(255, 211, 236, 0.52)', 
    '#FF704333'
  ];
  
  this.formationChart = {
    labels: data.labels,
    datasets: [{
      label: 'Formations les plus suivies',
      data: data.data,
      backgroundColor: backgroundColors,
      borderColor: ['#640D6B', 'rgb(18, 0, 78)', 'rgb(50, 131, 20)', 'rgb(131, 20, 83)', '#F4511E'],
      borderWidth: 1
    }]
  };

  this.chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      x: { 
        title: { display: true, text: 'Formations' },
        ticks: { autoSkip: false }
      },
      y: { 
        title: { display: true, text: 'Nombre de participants' },
        beginAtZero: true 
      }
    }
  };
}


  private hasFormationInYear(emp: EmployeReportingDTO, annee: number): boolean {
  const periodes = emp.periodesFormations?.split(', ') || [];
  return periodes.some(p => {
    const start = new Date(p.split(' - ')[0]);
    return start.getFullYear() === annee;
  });
}

  

  loadReporting(): void {
    this.isLoading = true;
    this.reportingService.getEmployeReporting().subscribe({
      next: (data) => {
        this.employes = data;
        this.filteredEmployes = [...this.employes];
        this.totalEmployees = this.employes.length;
        this.initFilterOptions();
        this.prepareChartData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading reporting', err);
        this.isLoading = false;
      }
    });
  }


  
  formationTypes :string[] =[];
  formationSousTypes:string[] =[];
  formationTitres: string[] =[];
  initFilterOptions(): void {
    // Extraire les valeurs uniques pour les filtres
    this.directions = [...new Set(this.employes.map(e => e.direction).filter(Boolean))] as string[];
    this.postes = [...new Set(this.employes.map(e => e.posteActuel).filter(Boolean))] as string[];
    this.diplomes = [...new Set(this.employes.flatMap(e => e.diplomes?.split(', ') || []).filter(Boolean))] as string[];
    this.societes = [...new Set(this.employes.flatMap(e => e.societesExperience?.split(', ') || []).filter(Boolean))] as string[];
    this.formationTypes = [...new Set(this.employes.flatMap(e => e.typesFormations?.split(', ') || []).filter(Boolean))] as string[];
    this.formationSousTypes = [...new Set(this.employes.flatMap(e => e.sousTypesFormations?.split(', ') || []).filter(Boolean))] as string[];
    this.formationTitres = [...new Set(this.employes.flatMap(e => e.titresFormations?.split(', ') || []).filter(Boolean))] as string[];     
  }



// Modifiez initChartOptions
private initChartOptions(): void {
    const textColor = '#374151';
    const gridColor = '#e5e7eb';
    const fontFamily = 'inherit';
    
    // Options de base communes
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: textColor,
                    font: {
                        family: fontFamily,
                        size: 12,
                        weight: '500'
                    },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'rectRounded'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                titleFont: {
                    family: fontFamily,
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    family: fontFamily,
                    size: 12
                },
                padding: 12,
                cornerRadius: 4,
                displayColors: true,
                intersect: false,
                mode: 'index',
                callbacks: {
                    label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += context.raw;
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: gridColor,
                    drawBorder: false
                },
                ticks: {
                    color: textColor,
                    font: {
                        family: fontFamily
                    }
                },
                title: {
                    display: true,
                    color: textColor,
                    font: {
                        family: fontFamily,
                        size: 12,
                        weight: '600'
                    }
                }
            },
            y: {
                grid: {
                    color: gridColor,
                    drawBorder: false,
                    beginAtZero:true
                },
                ticks: {
                    color: textColor,
                    font: {
                        family: fontFamily
                    }
                },
                title: {
                    display: true,
                    color: textColor,
                    font: {
                        family: fontFamily,
                        size: 12,
                        weight: '600'
                    }
                }
            }
        },
        elements: {
            line: {
                tension: 0.4,
                borderWidth: 2
            },
            point: {
                radius: 4,
                hoverRadius: 6
            },
            bar: {
                borderRadius: 4,
                borderWidth: 0
            }
        }
    };

    // Options spécifiques pour chaque type de graphique
    this.lineChartOptions = {
        ...baseOptions,
        plugins: {
            ...baseOptions.plugins,
            legend: {
                ...baseOptions.plugins.legend,
                position: 'top'
            }
        }
    };

    this.stackedBarOptions = {
        ...baseOptions,
        scales: {
            ...baseOptions.scales,
            x: { ...baseOptions.scales.x, stacked: true },
            y: { ...baseOptions.scales.y, stacked: true }
        }
    };

    this.radarOptions = {
        ...baseOptions,
        scales: {
            r: {
                angleLines: {
                    color: gridColor
                },
                grid: {
                    color: gridColor
                },
                pointLabels: {
                    color: textColor,
                    font: {
                        family: fontFamily
                    }
                },
                ticks: {
                    display: false,
                    beginAtZero: true
                }
            }
        }
    };

    this.doughnutOptions = {
        ...baseOptions,
        cutout: '65%',
        plugins: {
            ...baseOptions.plugins,
            legend: {
                ...baseOptions.plugins.legend,
                position: 'right'
            }
        }
    };
}


// Ajouter ces propriétés
employeeTrend: number = 5.2; // À remplacer par votre logique réelle
diplomaTrend: number = 12.4; // À remplacer par votre logique réelle
diplomaTrendData: number[] = [5, 8, 12, 10, 15, 18]; // Exemple de données
topDirections: any[] = [];
topPostes: any[] = [];
maxDirectionCount: number = 0;
maxPostCount: number = 0;
getAbsoluteTrend(trend: number): number {
  return Math.abs(trend);
}
// Ajouter dans ngOnInit() ou loadReporting()


// Nouvelle méthode
prepareAnalyticsData(): void {
    // Directions
    const directionCounts = this.countOccurrences(
        this.employes.map(e => e.direction).filter(d => d)
    );
    this.topDirections = Object.entries(directionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
    
    this.maxDirectionCount = Math.max(...this.topDirections.map(d => d.count));

    // Postes
    const posteCounts = this.countOccurrences(
        this.employes.map(e => e.posteActuel).filter(p => p)
    );
    this.topPostes = Object.entries(posteCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));
    
    this.maxPostCount = Math.max(...this.topPostes.map(p => p.count));
}

// Méthode utilitaire pour le sparkline





// Modifiez prepareChartData
prepareChartData(): void {
    // 1. Graphique linéaire des effectifs par direction
    const directionCounts = this.countOccurrences(this.employes.map(e => e.direction));
    this.directionLineChartData = {
        labels: Object.keys(directionCounts),
        datasets: [{
            label: 'Effectifs',
            data: Object.values(directionCounts),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true
        }]
    };

    // 2. Graphique barres empilées des diplômes par direction
    const diplomaData = this.prepareDiplomaByDirectionData();
    this.diplomaBarChartData = {
        labels: diplomaData.directions,
        datasets: diplomaData.datasets
    };

    
// 3. Graphique linéaire des expériences par société
const societeCounts = this.countOccurrences(this.employes.flatMap(e => e.societesExperience?.split(', ') || []));
this.experienceLineChartData = {
    labels: Object.keys(societeCounts),
    datasets: [{
        label: 'Expérience par société',
        data: Object.values(societeCounts),
        borderColor: '#640D5F',
        backgroundColor: 'rgba(137, 16, 185, 0.1)',
        fill: true
    }]
};




    // 4. Graphique doughnut des postes
    const posteCounts = this.countOccurrences(this.employes.map(e => e.posteActuel));
    const sortedPostes = Object.entries(posteCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
    
    this.posteDoughnutData = {
        labels: sortedPostes.map(item => item[0]),
        datasets: [{
            data: sortedPostes.map(item => item[1]),
            backgroundColor: [
                '#640D5F', '#D91656', '#EB5B00', '#FFB200', 
                '#f43f5e', '#ff5b37'
            ],
            hoverBackgroundColor: [
                '#640D5F', '#D91656', '#EB5B00', '#FFB200', 
                '#f76683', '#ff7c5e'
            ],
            borderWidth: 0
        }]
    };
}

lineOptions: any = {
  responsive: true,
  maintainAspectRatio: false, // Doit être false
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        drawBorder: false
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};




private prepareDiplomaByDirectionData(): any {
    const directions = [...new Set(this.employes.map(e => e.direction).filter(Boolean))];
    const diplomaTypes = [...new Set(this.employes.flatMap(e => e.typesDiplomes?.split(', ') || []).filter(Boolean))];
    
    const datasets = diplomaTypes.map(type => {
        const data = directions.map(dir => {
            return this.employes.filter(e => 
                e.direction === dir && 
                e.typesDiplomes?.includes(type)
            ).length;
        });
        
        return {
            label: type,
            data: data,
            backgroundColor: this.getRandomColor(),
            borderColor: '#ffffff',
            borderWidth: 1
        };
    });
    
    return {
        directions: directions,
        datasets: datasets
    };
}

private getRandomColor(): string {
    return `#${Math.floor(Math.random()*16777215).toString(16)}`;
}


  getDiplomasArray(emp: EmployeReportingDTO): any[] {
    if (!emp.diplomes || !emp.typesDiplomes || !emp.datesObtention) {
        return [];
    }
    
    const diplomes = emp.diplomes.split(', ');
    const types = emp.typesDiplomes.split(', ');
    const dates = emp.datesObtention.split(', ');
    
    return diplomes.map((d, i) => ({
        libelle: d,
        type: types[i] || '-',
        dateObtention: dates[i] || '-'
    }));
}

getTopFormationsData(employes: EmployeReportingDTO[]): { labels: string[], data: number[] } {
  const formationCounts: { [title: string]: number } = {};

  employes.forEach(emp => {
    const titres = emp.titresFormations?.split(',').map(t => t.trim()) || [];
    titres.forEach(titre => {
      if (titre) {
        formationCounts[titre] = (formationCounts[titre] || 0) + 1;
      }
    });
  });

  // Trier par fréquence décroissante et prendre les 5 premiers
  const sortedFormations = Object.entries(formationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    labels: sortedFormations.map(([title]) => title),
    data: sortedFormations.map(([_, count]) => count)
  };
}

  

countOccurrences(items: (string | undefined)[]): { [key: string]: number } {
  return items.reduce((acc: { [key: string]: number }, item) => {
      // Ignore les valeurs vides ou undefined
      if (!item || item.trim() === '') {
          return acc;
      }
      
      // Regroupement des valeurs similaires (insensible à la casse)
      const existingKey = Object.keys(acc).find(k => 
          k.toLowerCase() === item.toLowerCase()
      );
      
      if (existingKey) {
          acc[existingKey] += 1;
      } else {
          acc[item] = 1;
      }
      
      return acc;
  }, {});
}
  applyFilters(): void {
    this.filteredEmployes = this.employes.filter(emp => {
        const matchesBaseFilters = 
            (!this.nomFilter || emp.nom?.toLowerCase().includes(this.nomFilter.toLowerCase())) &&
            (!this.prenomFilter || emp.prenom?.toLowerCase().includes(this.prenomFilter.toLowerCase())) &&
            (!this.matriculeFilter || emp.matricule?.toString().includes(this.matriculeFilter)) &&
            (!this.emailFilter || emp.email?.toLowerCase().includes(this.emailFilter.toLowerCase())) &&
            (!this.posteFilter || emp.posteActuel?.toLowerCase().includes(this.posteFilter.toLowerCase())) &&
            (!this.diplomeFilter || emp.diplomes?.toLowerCase().includes(this.diplomeFilter.toLowerCase())) &&
            (!this.directionFilter || emp.direction?.toLowerCase().includes(this.directionFilter.toLowerCase()))&&
            (!this.societeFilter || emp.societesExperience?.toLowerCase().includes(this.societeFilter.toLowerCase()));

        // Vérification des filtres de formation
        const matchesFormationFilters = 
        (!this.formationTitreFilter || emp.titresFormations?.toLowerCase().includes(this.formationTitreFilter.toLowerCase())) &&
        (!this.formationTypeFilter || emp.typesFormations?.toLowerCase().includes(this.formationTypeFilter.toLowerCase())) &&
        (!this.formationSousTypeFilter || emp.sousTypesFormations?.toLowerCase().includes(this.formationSousTypeFilter.toLowerCase())) &&
        (!this.formationPeriodeStart || !this.formationPeriodeEnd || 
         this.checkFormationPeriod(emp, [this.formationPeriodeStart, this.formationPeriodeEnd]));

    return matchesBaseFilters && matchesFormationFilters;
  });
}

formationDateRange: Date[] = [];

onDateRangeSelect() {
  if (this.formationDateRange && this.formationDateRange.length === 2) {
    this.formationPeriodeStart = this.formationDateRange[0];
    this.formationPeriodeEnd = this.formationDateRange[1];
    this.applyFilters();
  }
}

 checkFormationPeriod(emp: EmployeReportingDTO, [start, end]: [Date | null, Date | null]): boolean {
  if (!emp.periodesFormations || !start || !end) return false;

  const periodes = emp.periodesFormations.split(',').map(p => p.trim());

  return periodes.some(periode => {
    const [debutStr, finStr] = periode.split(' - ').map(d => d.trim());
    
    try {
      // Gérer le format de date venant du backend (dd/MM/yyyy)
      const parseBackendDate = (dateStr: string): Date | null => {
        if (!dateStr || dateStr === '?') return null;
        
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      };

      const debut = parseBackendDate(debutStr);
      const fin = parseBackendDate(finStr);

      if (!debut && !fin) return false;

      // Vérifier si la période de formation est COMPLÈTEMENT incluse dans la période sélectionnée
      const periodeStart = debut || new Date(0); // Si pas de date début, utiliser date minimale
      const periodeEnd = fin || new Date(8640000000000000); // Si pas de date fin, utiliser date maximale

      // La formation doit commencer APRÈS ou EN MÊME TEMPS que la date de début sélectionnée
      // ET se terminer AVANT ou EN MÊME TEMPS que la date de fin sélectionnée
      return periodeStart >= start && periodeEnd <= end;
    } catch (e) {
      console.error('Erreur de parsing de date', e);
      return false;
    }
  });
}



  resetFilters(): void {
    this.nomFilter = '';
    this.prenomFilter = '';
    this.matriculeFilter = '';
    this.emailFilter = '';
    this.posteFilter = '';
    this.diplomeFilter = '';
    this.directionFilter = '';
    this.societeFilter = '';
    this.formationTitreFilter = '';
    this.formationTypeFilter = '';
    this.formationSousTypeFilter = '';
    this.formationPeriodeStart = null;
    this.formationPeriodeEnd = null;
    this.filteredEmployes = [...this.employes];
  }

  getDirectionSeverity(direction: string | undefined): string {
    if (!direction) return 'info';
    
    const hash = direction.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const severities = ['success', 'info', 'warning', 'danger'];
    return severities[Math.abs(hash) % severities.length];
  }

  getExperiences(emp: EmployeReportingDTO): { societe: string, poste: string, periode: string }[] {
    const societes = emp.societesExperience?.split(', ') || [];
    const postes = emp.postesExperience?.split(', ') || [];
    const periodes = emp.periodesExperience?.split(', ') || [];
  
    const result = [];
    
    for (let i = 0; i < societes.length; i++) {
      result.push({
        societe: societes[i] || 'Non spécifié',
        poste: postes[i] || '-',
        periode: periodes[i] || '-'
      });
    }
    
    return result;
}

  getFormationsArray(emp: EmployeReportingDTO): any[] {
  if (!emp.titresFormations || !emp.typesFormations || 
      !emp.sousTypesFormations || !emp.periodesFormations) {
    return [];
  }
  
  const titres = emp.titresFormations.split(', ');
  const types = emp.typesFormations.split(', ');
  const sousTypes = emp.sousTypesFormations.split(', ');
  const periodes = emp.periodesFormations.split(', ');
  
  return titres.map((t, i) => ({
    titre: t,
    type: types[i] || '-',
    sousType: sousTypes[i] || '-',
    periode: periodes[i] || '-'
  }));
}

  viewEmployeeDetails(emp: EmployeReportingDTO): void {
    this.selectedEmployee = emp;
    this.displayEmployeeDialog = true;
  }

 



exportPdf(employe: EmployeReportingDTO) {
  const doc = new jsPDF();
  let yOffset = 10;

  // Stylisation
  doc.setFont('helvetica', 'bold');
  
  // En-tête
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text(`FICHE EMPLOYÉ: ${employe.nom} ${employe.prenom}`, 10, yOffset);
  yOffset += 15;

  // Informations de base
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  
  const baseInfo = [
    `Matricule: ${employe.matricule || 'Non renseigné'}`,
    `Email: ${employe.email || 'Non renseigné'}`,
    `Poste actuel: ${employe.posteActuel || 'Non renseigné'}`,
    `Direction: ${employe.direction || 'Non renseigné'}`
  ];

  baseInfo.forEach((info, index) => {
    doc.text(info, 10, yOffset + (index * 7));
  });
  yOffset += 30;

  // Diplômes
  if (employe.diplomes) {
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text('DIPLÔMES', 10, yOffset);
    yOffset += 8;

    const diplomesData = this.getDiplomasArray(employe).map(d => [
      d.libelle,
      d.type,
      d.dateObtention
    ]);

    autoTable(doc, {
      startY: yOffset,
      head: [['Intitulé', 'Type', 'Date obtention']],
      body: diplomesData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });
    
    yOffset = (doc as any).lastAutoTable.finalY + 10;
  }

  // Expériences
  if (employe.societesExperience) {
    doc.setFontSize(14);
    doc.text('EXPÉRIENCES PROFESSIONNELLES', 10, yOffset);
    yOffset += 8;

    const experiencesData = this.getExperiences(employe).map(e => [
      e.societe,
      e.poste,
      e.periode
    ]);

    autoTable(doc, {
      startY: yOffset,
      head: [['Société', 'Poste occupé', 'Période']],
      body: experiencesData,
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219], textColor: 255 },
    });
    
    yOffset = (doc as any).lastAutoTable.finalY + 10;
  }

  // Formations
  if (employe.titresFormations) {
    doc.setFontSize(14);
    doc.text('FORMATIONS', 10, yOffset);
    yOffset += 8;

    const formationsData = this.getFormationsArray(employe).map(f => [
      f.titre,
      f.type,
      f.sousType,
      f.periode
    ]);

    autoTable(doc, {
      startY: yOffset,
      head: [['Titre', 'Type', 'Sous-type', 'Période']],
      body: formationsData,
      theme: 'plain',
      headStyles: { fillColor: [155, 89, 182], textColor: 255 },
    });
  }

  // Génération du PDF
  doc.save(`Fiche_Employe_${employe.nom}_${employe.prenom}.pdf`);
}

exportEmployeePdf(employe: EmployeReportingDTO) {
  const doc = new jsPDF();
  let yOffset = 10;

  // Style du document
  doc.setFont('helvetica');
  doc.setTextColor(40, 40, 40);

  // En-tête
  doc.setFontSize(18);
  doc.setFont('undefined', 'bold');
  doc.text(`Fiche Employé: ${employe.nom} ${employe.prenom}`, 10, yOffset);
  yOffset += 15;

  // Informations de base
  const baseInfo = [
    `Matricule: ${employe.matricule || 'Non renseigné'}`,
    `Email: ${employe.email || 'Non renseigné'}`,
    `Poste Actuel: ${employe.posteActuel || 'Non renseigné'}`,
    `Direction: ${employe.direction || 'Non renseigné'}`
  ];

  doc.setFontSize(12);
  baseInfo.forEach((info, index) => {
    doc.text(info, 10, yOffset + (index * 7));
  });
  yOffset += 30;

  // Diplômes
  if (employe.diplomes) {
    this.addSection(doc, 'Diplômes', yOffset);
    yOffset += 10;

    autoTable(doc, {
      startY: yOffset,
      head: [['Diplôme', 'Type', 'Date Obtention']],
      body: this.getDiplomasArray(employe).map(d => [d.libelle, d.type, d.dateObtention]),
      theme: 'striped',
    headStyles: { fillColor: [51, 51, 51], textColor: 255 },
    });
    yOffset = (doc as any).lastAutoTable.finalY + 10;
  }

  // Expériences
  if (employe.societesExperience) {
    this.addSection(doc, 'Expériences Professionnelles', yOffset);
    yOffset += 10;

    autoTable(doc, {
      startY: yOffset,
      head: [['Société', 'Poste', 'Période']],
      body: this.getExperiences(employe).map(e => [e.societe, e.poste, e.periode]),
      theme: 'striped',
    headStyles: { fillColor: [51, 51, 51], textColor: 255 },
    });
    yOffset = (doc as any).lastAutoTable.finalY + 10;
  }

  // Formations
  if (employe.titresFormations) {
    this.addSection(doc, 'Formations', yOffset);
    yOffset += 10;

    autoTable(doc, {
      startY: yOffset,
      head: [['Titre', 'Type', 'Sous-type', 'Période']],
      body: this.getFormationsArray(employe).map(f => [f.titre, f.type, f.sousType, f.periode]),
      theme: 'striped',
    headStyles: { fillColor: [51, 51, 51], textColor: 255 },
    });
  }

  doc.save(`fiche_${employe.nom}_${employe.prenom}.pdf`);
}

private addSection(doc: jsPDF, title: string, y: number) {
  doc.setFontSize(14);
  doc.setFont('undefined', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(title, 10, y);
  doc.setFont('undefined', 'normal');
}





// Pour l'export global
exportAllToPdf() {
  const doc = new jsPDF();
  let yOffset = 10;

  doc.setFontSize(16);
  doc.text('Liste complète des employés', 10, yOffset);
  yOffset += 15;

  autoTable(doc, {
    startY: yOffset,
    head: [['Nom', 'Prénom', 'Matricule', 'Poste', 'Direction']],
    body: this.filteredEmployes.map(e => [
      e.nom,
      e.prenom,
      e.matricule,
      e.posteActuel,
      e.direction
    ]),
    theme: 'striped',
    headStyles: { fillColor: [51, 51, 51], textColor: 255 },
  });

  doc.save('liste_employes_complete.pdf');
}


  // Types de rapports disponibles
reportTypes = [
  { label: 'Tous les employés', value: 'all' },
  { label: 'Par direction', value: 'direction' },
  { label: 'Par poste', value: 'poste' }
];
selectedReportType: string = 'all';

// Méthode principale pour exporter vers Excel
exportToExcel(): void {
  switch (this.selectedReportType) {
    case 'all':
      this.exportAllEmployees();
      break;
    case 'direction':
      this.exportByDirection();
      break;
    case 'poste':
      this.exportByPoste();
      break;
    
    case 'societe':
      this.exportBySociete();
      break;
    default:
      this.exportAllEmployees();
  }
}

// Export de tous les employés avec formatage avancé
private exportAllEmployees(): void {
  const dataForExport = this.filteredEmployes.map(emp => ({
    'Matricule': emp.matricule,
    'Nom': emp.nom,
    'Prénom': emp.prenom,
    'Email': emp.email,
    'Poste Actuel': emp.posteActuel,
    'Direction': emp.direction,
    'Diplômes': emp.diplomes?.replace(/, /g, '\n') || '',
    'Types de Diplômes': emp.typesDiplomes?.replace(/, /g, '\n') || '',
    'Dates d\'Obtention': emp.datesObtention?.replace(/, /g, '\n') || '',
    'Sociétés Exp.': emp.societesExperience?.replace(/, /g, '\n') || '',
    'Postes Exp.': emp.postesExperience?.replace(/, /g, '\n') || '',
    'Périodes Exp.': emp.periodesExperience?.replace(/, /g, '\n') || '',
    'Formations': emp.titresFormations?.replace(/, /g, '\n') || '',
    'Types Formations': emp.typesFormations?.replace(/, /g, '\n') || '',
    'Sous-types': emp.sousTypesFormations?.replace(/, /g, '\n') || '',
    'Périodes Formations': emp.periodesFormations?.replace(/, /g, '\n') || ''
  }));

  this.generateExcelFile(dataForExport, 'Rapport_Employes_Complet');
}

// Export par direction
// Export par direction
// Dans la classe ReportingComponent

private exportByDirection(): void {
  const directionGroups: { [direction: string]: EmployeReportingDTO[] } = {};

  for (const emp of this.filteredEmployes) {
    const direction = emp.direction || 'Sans direction';
    if (!directionGroups[direction]) {
      directionGroups[direction] = [];
    }
    directionGroups[direction].push(emp);
  }

  const worksheetData: any[] = [];

  for (const direction of Object.keys(directionGroups)) {
    worksheetData.push({
      Direction: direction,
      Employés: `Total: ${directionGroups[direction].length}`
    });

    // Ajouter les employés un par un sous cette direction
    worksheetData.push(
      ...directionGroups[direction].map(emp => ({
        Nom: emp.nom,
        Prénom: emp.prenom,
        Email: emp.email,
        Matricule: emp.matricule,
        'Poste Actuel': emp.posteActuel,
        'Diplômes': emp.diplomes,
        'Sociétés Expérience': emp.societesExperience,
        'Périodes Expérience': emp.periodesExperience
      }))
    );

    // Ligne vide entre les groupes
    worksheetData.push({});
  }

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Employés par Direction': worksheet },
    SheetNames: ['Employés par Direction']
  };

  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `rapport_employes_par_direction.xlsx`);
}




// Export par poste
private exportByPoste(): void {
  const posteGroups = this.groupBy(this.filteredEmployes, 'posteActuel');
  const dataForExport = [];
  for (const [poste, employees] of Object.entries(posteGroups)) {
    dataForExport.push({ 'Poste': poste || 'Non spécifié', 'Nombre': employees.length });
    employees.forEach(emp => {
      dataForExport.push({
        'Matricule': emp.matricule,
        'Nom Complet': `${emp.nom} ${emp.prenom}`,
        'Direction': emp.direction,
        'Expérience': emp.periodesExperience?.split(', ').length || 0
      });
    });
    dataForExport.push({}); // Ligne vide pour séparer les groupes
  }
  
  this.generateExcelFile(dataForExport, 'Rapport_Par_Poste', true);
}

// Export par diplôme
private exportBySociete(): void {
  const societeGroups: SocieteGroup = {};
  
  this.filteredEmployes.forEach(emp => {
    const societes = emp.societesExperience?.split(', ') || [];
    const postes = emp.postesExperience?.split(', ') || [];
    const periodes = emp.periodesExperience?.split(', ') || [];
    
    societes.forEach((societe, index) => {
      if (!societeGroups[societe]) {
        societeGroups[societe] = [];
      }
      
      societeGroups[societe].push({
        'Employé': `${emp.nom} ${emp.prenom}`,
        'Poste Actuel': emp.posteActuel,
        'Poste dans la société': postes[index] || '',
        'Période': periodes[index] || ''
      });
    });
  });
  
  const workbook = XLSX.utils.book_new();
  
  for (const [societe, employees] of Object.entries(societeGroups)) {
    const worksheet = XLSX.utils.json_to_sheet(employees);
    XLSX.utils.book_append_sheet(workbook, worksheet, societe.substring(0, 31));
  }
  
  XLSX.writeFile(workbook, `Rapport_Par_Societe_${new Date().toISOString().slice(0,10)}.xlsx`);
}


private generateExcelFile(data: any[], fileName: string, withStyles: boolean = false): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapport');
  
  if (withStyles) {
    // Ajouter des styles si nécessaire (nécessiterait une bibliothèque comme xlsx-style)
    // Cette partie est plus complexe et pourrait nécessiter une solution alternative
  }
  
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// Méthode utilitaire pour grouper les données
private groupBy(array: any[], key: string): { [key: string]: any[] } {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
    return result;
  }, {});
}
}
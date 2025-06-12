import { Component, OnInit } from '@angular/core';
import { HabiliteService } from '../service/habilite.service';
import { EmployeHabilitationDto } from '../model/employe-habilitation-dto';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { TabViewModule } from 'primeng/tabview';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { PosteDtoHabilite } from '../model/poste-dto-habilite';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { TooltipItem } from 'chart.js'; 
import { AvatarModule } from 'primeng/avatar';
import { PosteService } from '../../poste/service/poste.service';
@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], field: string, subField: string, value: any): any[] {
    if (!items) return [];
    if (!value) return items;

    return items.filter(item => {
      if (subField) {
        // Pour les tableaux imbriqués (ex: postesHabilites.competencesManquantes)
        return item[field].some((subItem: any) => subItem[subField].length === value);
      } else {
        // Pour les champs simples
        return item[field] === value;
      }
    });
  }
}
@Component({
  selector: 'app-habilite',
  templateUrl: './habilite.component.html',
  styleUrls: ['./habilite.component.css'],
  standalone: true,
  imports: [
    ButtonGroupModule ,
    DropdownModule,
     FilterPipe,
    CommonModule,
    ChartModule,
    TabViewModule,
    ProgressBarModule,
    TooltipModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
      SelectButtonModule,
    FormsModule,
      CommonModule,
    FormsModule,
    DialogModule,
    AccordionModule,
    TagModule,
    ProgressBarModule,
    ButtonModule,
    TabViewModule,
    ChartModule,
   AvatarModule
  ]
})
export class HabiliteComponent implements OnInit {
  employes: EmployeHabilitationDto[] = [];
  filteredEmployes: EmployeHabilitationDto[] = [];
  selectedEmploye: EmployeHabilitationDto | null = null;
  displayDialog: boolean = false;
  searchText: string = '';
  chartData: any;
  chartOptions: any;
  showAllEmployees: boolean = false;
  constructor(private habiliteService: HabiliteService,private posteService : PosteService) {}
ngOnInit(): void {
  this.loadEmployees();
  }

    applyFilters(): void {
    if (this.searchText || this.showAllEmployees) {
      // Afficher tous les employés lors d'une recherche ou si showAllEmployees est true
      this.filteredEmployes = [...this.employes];
    } else {
      // Par défaut, ne montrer que les employés avec au moins 1 poste accessible
      this.filteredEmployes = this.employes.filter(emp => emp.postesHabilites.length > 0);
    }
  }


toggleShowAll(): void {
  this.showAllEmployees = !this.showAllEmployees;
  this.applyFilters();
}


//Calcule la moyenne de ces pourcentages pour tous les employés.

  getAverageAccessPercentage(): number {
    if (this.employes.length === 0) return 0;
    const total = this.employes.reduce((sum, emp) => sum + this.getEmployeAccessPercentage(emp), 0);
    return Math.round(total / this.employes.length);
  }
//(nombre de postes avec habilitation complète / nombre total de postes habilités) × 100
getEmployeAccessPercentage(employe: EmployeHabilitationDto): number {
  const totalPostes = employe.postesHabilites.length;
  const fullAccessCount = employe.postesHabilites.filter(p => p.competencesManquantes.length === 0).length;
  return totalPostes === 0 ? 0 : Math.round((fullAccessCount / totalPostes) * 100);
}

// Dans le composant
getEmployesWithFullAccess(): EmployeHabilitationDto[] {
  return this.filteredEmployes.filter(emp => 
    emp.postesHabilites.length > 0 && // Avoir au moins un poste
    emp.postesHabilites.every(poste => poste.competencesManquantes.length === 0)
  );
}
getEmployesWithMissingCompetences(): EmployeHabilitationDto[] {
  return this.filteredEmployes.filter(emp => 
    emp.postesHabilites.some(poste => poste.competencesManquantes.length > 0)
  );
}

  getProgressBarClass(percentage: number): string {
    if (percentage > 75) return 'high-progress';
    if (percentage > 50) return 'medium-progress';
    return 'low-progress';
  }

  getSkillSize(competence: string): number {
    // Taille basée sur la longueur du texte (exemple simple)
    const baseSize = 0.9;
    const lengthFactor = competence.length / 20;
    return Math.min(baseSize + lengthFactor, 1.5);
  }

  initChart(): void {
    const labels = this.employes.map(e => `${e.prenom} ${e.nom}`);
    const data = this.employes.map(e => this.getEmployeAccessPercentage(e));

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Taux d\'accès complet aux postes',
          backgroundColor: '#42A5F5',
          borderColor: '#1E88E5',
          data: data
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Pourcentage (%)'
          }
        }
      },
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              return `${context.dataset.label}: ${context.raw}%`;
            }
          }
        }
      }
    };
  }

filterEmployes(): void {
  const text = this.searchText.toLowerCase();

  this.filteredEmployes = this.employes.filter(emp => {
    const fullName = `${emp.prenom} ${emp.nom}`.toLowerCase();
    const competences = emp.competences.join(' ').toLowerCase();
    const postes = emp.postesHabilites.map(p => p.titre).join(' ').toLowerCase();
    const matricule = String(emp.matricule || '').toLowerCase(); // ✅ fix ici

    return (
      fullName.includes(text) ||
      competences.includes(text) ||
      postes.includes(text) ||
      matricule.includes(text)
    );
  });
}



  showEmployeDetails(employe: EmployeHabilitationDto): void {
    this.selectedEmploye = employe;
    this.displayDialog = true;
  }

  calculateAccessPercentage(poste: any): number {
    const total = poste.competences.length;
    const missing = poste.competencesManquantes.length;
    return Math.round(((total - missing) / total) * 100);
  }
 // Dans votre composant
viewModes = [
  {icon: 'pi pi-th-large', value: 'grid'},
  {icon: 'pi pi-list', value: 'list'}
];


getWaveColor(employe: any): string {
  const percentage = this.getEmployeAccessPercentage(employe);
  
  if (percentage === 0) return 'rgba(189, 195, 199, 0.3)'; // Gris transparent
  if (percentage > 75) return 'rgba(76, 175, 80, 0.3)';    // Vert transparent
  if (percentage > 50) return 'rgba(255, 152, 0, 0.3)';    // Orange transparent
  return 'rgba(244, 67, 54, 0.3)';                        // Rouge transparent
}
calculateDashArray(employe: any): string {
  const circumference = 2 * Math.PI * 16;
  const progress = this.getEmployeAccessPercentage(employe);
  const offset = circumference - (progress / 100) * circumference;
  return `${circumference} ${circumference}`;
}

isDotActive(dot: number, employe: any): boolean {
  const percentage = this.getEmployeAccessPercentage(employe);
  return percentage >= (dot * 20);
}

getAccessLevelClass(employe: any): string {
  const percentage = this.getEmployeAccessPercentage(employe);
  if (percentage === 0) return 'no-access';
  if (percentage > 75) return 'high-access';
  if (percentage > 50) return 'medium-access';
  return 'low-access';
}

getAccessLevelLabel(employe: any): string {
  const percentage = this.getEmployeAccessPercentage(employe);
  if (percentage === 0) return 'Aucun accès';
  if (percentage > 75) return 'Accès complet';
  if (percentage > 50) return 'Accès moyen';
  return 'Accès limité';
} 

getGlobalAccessLevel(employe: any): string {
    const percentage = this.getEmployeAccessPercentage(employe);
    if (percentage === 0) return 'low';
    if (percentage > 75) return 'high';
    if (percentage > 50) return 'medium';
    return 'low';
}

getGlobalAccessLabel(employe: any): string {
    const percentage = this.getEmployeAccessPercentage(employe);
    if (percentage === 0) return 'Accès limité';
    if (percentage > 75) return 'Accès excellent';
    if (percentage > 50) return 'Accès moyen';
    return 'Accès faible';
}

getSkillColor(competence: string): string {
    // Exemple: générer une couleur basée sur le hash de la compétence
    const hash = competence.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    const colors = [
        'rgba(63, 81, 181, 0.1)',
        'rgba(233, 30, 99, 0.1)',
        'rgba(255, 152, 0, 0.1)',
        'rgba(76, 175, 80, 0.1)',
        'rgba(0, 188, 212, 0.1)'
    ];
    return colors[Math.abs(hash) % colors.length];
}

calculateMatchRate(employe: any): number {
    // Implémentez votre logique de calcul ici
    return Math.round(Math.random() * 40 + 60); // Exemple
}

calculatePotential(employe: any): number {
    // Implémentez votre logique de calcul ici
    return Math.round(Math.random() * 2 + 3); // Exemple
}

// Données pour le graphique radar
radarChartData = {
    labels: ['Technique', 'Management', 'Communication', 'Leadership', 'Innovation'],
    datasets: [
        {
            label: 'Niveau Actuel',
            backgroundColor: 'rgba(33, 150, 243, 0.2)',
            borderColor: 'rgba(33, 150, 243, 1)',
            pointBackgroundColor: 'rgba(33, 150, 243, 1)',
            pointBorderColor: '#fff',
            data: [65, 59, 90, 81, 56]
        },
        {
            label: 'Potentiel',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            borderColor: 'rgba(76, 175, 80, 1)',
            pointBackgroundColor: 'rgba(76, 175, 80, 1)',
            pointBorderColor: '#fff',
            data: [80, 75, 95, 85, 70]
        }
    ]
};

radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        r: {
            angleLines: {
                display: true
            },
            suggestedMin: 0,
            suggestedMax: 100
        }
    }
};










// Ajoutez à votre classe
listePostes: {label: string, value: string}[] = [];
posteSelectionne: string | null = null;
topEmployesData: any;
topEmployesOptions: any;



// Nouvelle méthode pour mettre à jour le graphique des top employés
updateTopEmployesChart(): void {
  if (!this.posteSelectionne) return;

  // 1. Filtrer les employés ayant ce poste dans leurs postesHabilites
  const employesPourPoste = this.employes.filter(emp => 
    emp.postesHabilites.some(p => p.titre === this.posteSelectionne)
  );

  // 2. Calculer un score de compétence pour chaque employé
  const employesAvecScores = employesPourPoste.map(emp => {
    const poste = emp.postesHabilites.find(p => p.titre === this.posteSelectionne)!;
    const score = this.calculateCompetenceScore(poste);
    return { ...emp, score };
  });

  // 3. Trier et prendre les 3 premiers
  const topEmployes = [...employesAvecScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // 4. Préparer les données du graphique
this.topEmployesData = {
    labels: topEmployes.map(e => `${e.prenom} ${e.nom}`),
    datasets: [
      {
        label: `Compétences maîtrisées`,
       backgroundColor: 'rgba(33, 150, 243, 0.3)',

       borderColor: '#1565C0',
        borderWidth: 1,
        borderRadius: 4,
        data: topEmployes.map(e => e.score)
      },
      {
        label: 'Compétences manquantes',
      backgroundColor: 'rgba(244, 67, 54, 0.3)', 
        borderColor: '#C62828',
        borderWidth: 1,
        borderRadius: 4,
        data: topEmployes.map(e => {
          const poste = e.postesHabilites.find(p => p.titre === this.posteSelectionne)!;
          return poste.competencesManquantes.length;
        })
      }
    ]
  };

  this.topEmployesOptions = {
    responsive: true,
   maintainAspectRatio: true, // Changé à true
    aspectRatio: 2, // Ratio largeur/hauteur fixe
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.9)',
        titleFont: {
          size: 16,
          weight: 'bold'
        },
        bodyFont: {
          size: 14
        },
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
        callbacks: {
         label: (context: import('chart.js').TooltipItem<'bar'>) =>  {
            const label = context.dataset.label || '';
            const value = context.raw as number;
            return `${label}: ${value} compétence${value > 1 ? 's' : ''}`;
          },
          afterBody: (context: import('chart.js').TooltipItem<'bar'>[]) =>  {
            const index = context[0].dataIndex;
            const employe = topEmployes[index];
            const poste = employe.postesHabilites.find(p => p.titre === this.posteSelectionne)!;
            
            if (poste.competencesManquantes.length > 0) {
              return [
                '\nCompétences à acquérir:',
                ...poste.competencesManquantes.map(c => `• ${c}`)
              ];
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        stacked: true,
        
        max: Math.max(...topEmployes.map(e => {
          const poste = e.postesHabilites.find(p => p.titre === this.posteSelectionne)!;
          return poste.competences.length;
        })) + 2,
        ticks: {
          stepSize: 1,
          font: {
            size: 12
          }
        },
        title: {
          display: true,
          text: 'Nombre de compétences',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };
   this.initCompetenceCharts();
}


selectRandomPoste(): void {
  if (this.listePostes.length > 0) {
    const randomIndex = Math.floor(Math.random() * this.listePostes.length);
    this.posteSelectionne = this.listePostes[randomIndex].value;
    this.updateTopEmployesChart();
  }
}

// Nouvelle méthode pour calculer un score de compétence
calculateCompetenceScore(poste: PosteDtoHabilite): number {
  const totalCompetences = poste.competences.length;
  const competencesManquantes = poste.competencesManquantes.length;
  const competencesSupplementaires = poste.competencesSupplementaires.length;
  
  // Pondération: 
  // - compétences requises = 1 point
  // - compétences supplémentaires = 0.5 point
  return (totalCompetences - competencesManquantes) + (competencesSupplementaires * 0.5);
}
// Ajouter à la classe
currentView: 'cards' | 'matrix' = 'cards';
allPostes: string[] = [];

initPostesList(): void {
  const postesUniques = [...new Set(this.employes.flatMap(e => e.postesHabilites.map(p => p.titre)))];
  console.log("liste des postes", postesUniques); 
  this.listePostes = postesUniques.map(poste => ({
    label: poste,
    value: poste
  })).sort((a, b) => a.label.localeCompare(b.label));
}
hasAccess(employe: EmployeHabilitationDto, posteTitre: string): boolean {
  return employe.postesHabilites.some(p => p.titre === posteTitre);
}

isFullAccess(employe: EmployeHabilitationDto, posteTitre: string): boolean {
  const poste = employe.postesHabilites.find(p => p.titre === posteTitre);
  return poste ? poste.competencesManquantes.length === 0 : false;
}

getAccessLevelForMatrix(employe: EmployeHabilitationDto, posteTitre: string): string {
  const poste = employe.postesHabilites.find(p => p.titre === posteTitre);
  if (!poste) return 'no-access-cell';
  return poste.competencesManquantes.length === 0 ? 'full-access' : 'partial-access';
}

getTooltipForAccess(employe: EmployeHabilitationDto, posteTitre: string): string {
  const poste = employe.postesHabilites.find(p => p.titre === posteTitre);
  if (!poste) return 'Aucun accès à ce poste';
  
  let tooltip = `<strong>${posteTitre}</strong><br>`;
  
  if (poste.competencesManquantes.length === 0) {
    tooltip += '✅ Accès complet<br>';
  } else {
    tooltip += `⚠️ Accès partiel (${this.calculateAccessPercentage(poste)}%)<br>`;
  }
  
  tooltip += `<br><u>Compétences maîtrisées:</u><br>`;
  tooltip += poste.competences.filter(c => !poste.competencesManquantes.includes(c))
    .map(c => `• ${c}`)
    .join('<br>') || 'Aucune';
  
  if (poste.competencesManquantes.length > 0) {
    tooltip += `<br><br><u>Compétences manquantes:</u><br>`;
    tooltip += poste.competencesManquantes.map(c => `• ${c}`).join('<br>');
  }
  
  return tooltip;
}


// Ajoutez cette propriété à votre classe
currentDisplayMode: 'cards' | 'matrix' = 'cards';



// Dans loadEmployees(), initialisez allPostes
loadEmployees(): void {
  // Charge les employés avec leurs habilitations
  this.habiliteService.getEmployesAvecPostesHabilitesProches().subscribe(data => {
    this.employes = data;
    this.filteredEmployes = [...this.employes];
    this.initChart();
    this.initPostesList();
    this.selectRandomPoste();

    // Charge tous les postes depuis PosteService
    this.posteService.getAllPostes().subscribe(allPostes => {
      this.allPostes = allPostes
        .map(poste => poste.titre) // ou poste.nom selon votre modèle
        .sort((a, b) => a.localeCompare(b));
    });
  });
}





accessDistributionData = {
  labels: ['Accès complets', 'Accès partiels', 'Aucun accès'],
  datasets: [
    {
      data: [30, 45, 25], // Remplacez par vos vraies données
      backgroundColor: [
        'rgba(76, 175, 80, 0.7)',
        'rgba(255, 152, 0, 0.7)',
        'rgba(244, 67, 54, 0.7)'
      ],
      borderColor: [
        'rgba(76, 175, 80, 1)',
        'rgba(255, 152, 0, 1)',
        'rgba(244, 67, 54, 1)'
      ],
      borderWidth: 1
    }
  ]
};

doughnutOptions = {
  cutout: '20%',
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
};

// Retourne le nombre d'étoiles remplies (sur 5) en fonction du pourcentage
filledStars(poste: any): number {
  const percentage = this.calculateAccessPercentage(poste);
  return Math.round((percentage / 100) * 5); // conversion en étoiles
}

// Retourne un tableau pour afficher toujours 5 étoiles
getStars(poste: any): number[] {
  return [1, 2, 3, 4, 5];
}
// Ajoutez ces propriétés à votre classe
// Ajoutez ces propriétés à votre classe HabiliteComponent
combinedCompetenceData: any;
pieChartOptions: any;
ambivalentCompetences: {name: string, mastered: number, missing: number}[] = [];
showExplanation: boolean = false;

initCompetenceCharts(): void {
  if (!this.posteSelectionne) return;

  // 1. Récupérer tous les employés pour ce poste
  const employesPourPoste = this.employes.filter(emp => 
    emp.postesHabilites.some(p => p.titre === this.posteSelectionne)
  );

  // 2. Compter les compétences maîtrisées et manquantes
  const competenceStats: {[key: string]: {mastered: number, missing: number}} = {};

  employesPourPoste.forEach(emp => {
    const poste = emp.postesHabilites.find(p => p.titre === this.posteSelectionne)!;
    
    // Compétences maîtrisées
    poste.competences.forEach(comp => {
      if (!poste.competencesManquantes.includes(comp)) {
        if (!competenceStats[comp]) competenceStats[comp] = {mastered: 0, missing: 0};
        competenceStats[comp].mastered++;
      }
    });
    
    // Compétences manquantes
    poste.competencesManquantes.forEach(comp => {
      if (!competenceStats[comp]) competenceStats[comp] = {mastered: 0, missing: 0};
      competenceStats[comp].missing++;
    });
  });
// Dans initCompetenceCharts(), après avoir calculé competenceStats:

// Détecter les compétences ambivalentes
this.ambivalentCompetences = Object.keys(competenceStats)
  .filter(comp => competenceStats[comp].mastered > 0 && competenceStats[comp].missing > 0)
  .map(comp => ({
    name: comp,
    mastered: competenceStats[comp].mastered,
    missing: competenceStats[comp].missing
  }));

this.showExplanation = this.ambivalentCompetences.length > 0;
  // 3. Trier et sélectionner les top compétences
  const competences = Object.keys(competenceStats);
  
  const topCompetences = [...competences]
    .filter(comp => competenceStats[comp].mastered > 0)
    .sort((a, b) => competenceStats[b].mastered - competenceStats[a].mastered)
    .slice(0, 5);
  
  const weakCompetences = [...competences]
    .filter(comp => competenceStats[comp].missing > 0)
    .sort((a, b) => competenceStats[b].missing - competenceStats[a].missing)
    .slice(0, 5);

  // 4. Préparer les données pour le pie chart combiné
  this.combinedCompetenceData = {
    labels: [
      ...topCompetences.map(comp => `${comp} (Maîtrisée)`),
      ...weakCompetences.map(comp => `${comp} (À améliorer)`)
    ],
    datasets: [{
      data: [
        ...topCompetences.map(comp => competenceStats[comp].mastered),
        ...weakCompetences.map(comp => competenceStats[comp].missing)
      ],
    backgroundColor: [
  'rgba(236, 64, 122, 0.3)',
  'rgba(156, 39, 176, 0.3)',
  'rgba(103, 58, 183, 0.3)',
  'rgba(63, 81, 181, 0.3)',
  'rgba(33, 150, 243, 0.3)',

  'rgba(255, 128, 171, 0.3)',
  'rgba(255, 64, 129, 0.3)',
  'rgba(245, 0, 87, 0.3)',
  'rgba(194, 24, 91, 0.3)',
  'rgba(233, 30, 99, 0.3)'
],
hoverBackgroundColor: [
  'rgba(236, 64, 122, 0.5)',
  'rgba(156, 39, 176, 0.5)',
  'rgba(103, 58, 183, 0.5)',
  'rgba(63, 81, 181, 0.5)',
  'rgba(33, 150, 243, 0.5)',

  'rgba(255, 128, 171, 0.5)',
  'rgba(255, 64, 129, 0.5)',
  'rgba(245, 0, 87, 0.5)',
  'rgba(194, 24, 91, 0.5)',
  'rgba(233, 30, 99, 0.5)'
],

      borderWidth: 1,
      borderColor: '#fff'
    }]
  };

this.pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        boxWidth: 19,
        padding: 15,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      bodyFont: {
        size: 14
      },
      displayColors: false
    }
  },
  cutout: '65%',
  spacing: 5
};
}
// Messages d'aide à la décision
decisionMessages: {
  topEmployees?: string;
  topCompetences?: string;
  weakCompetences?: string;
} = {};




}
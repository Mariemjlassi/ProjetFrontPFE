import { Component, OnInit } from '@angular/core';
import { RecrutementService } from '../service/recrutement.service';
import { CommonModule } from '@angular/common';

import { Candidat } from '../model/candidat';
import { Poste } from '../model/poste';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { MeterGroupModule } from 'primeng/metergroup';

@Component({
  selector: 'app-recrutement',
  imports: [CommonModule, ButtonModule,DropdownModule, ReactiveFormsModule,FormsModule, TableModule, MeterGroupModule ],
  templateUrl: './recrutement.component.html',
  styleUrl: './recrutement.component.css',
  
})
export class RecrutementComponent implements OnInit {
  candidats: Candidat[] = [];
  postes: Poste[] = [];  
  poste!: Poste;
  compatibiliteData: number[] = [];
  candidatNames: string[] = [];
  selectedPoste: number | null = null; 
  public chartData: any;
  public chartOptions: any;

  constructor(private recrutementService: RecrutementService) {}

  ngOnInit(): void {
    this.recrutementService.getPostes().subscribe(postes => {
      this.postes = postes;
    });
  }

  // Lorsque l'utilisateur sélectionne un poste
  onPosteChange(event: any): void {
    const posteId = event.value; // Récupérer l'ID du poste sélectionné

    if (posteId !== null) {
      this.recrutementService.getPosteById(posteId).subscribe(poste => {
        this.poste = poste;

        this.recrutementService.suggererCandidats(posteId).subscribe(candidats => {
          this.candidats = candidats;

          this.calculerCompatibilite();
          this.initChart();
        });
      });
    } else {
      console.error("ID du poste invalide");
    }
  }

  // Calcul de la compatibilité
  calculerCompatibilite(): void {
    this.compatibiliteData = [];
    this.candidatNames = [];
    this.candidats.forEach(candidat => {
      const score = candidat.scoreRecommandation;
      this.compatibiliteData.push(score);
      this.candidatNames.push(candidat.nom);
    });
  }

  // Initialisation du graphique
  initChart(): void {
    this.chartData = {
      labels: this.candidatNames,
      datasets: [
        {
          label: 'Compatibilité des Candidats',
          data: this.compatibiliteData,
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          borderColor: 'rgba(33, 150, 243, 1)',
          borderWidth: 1
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#dee2e6'
          }
        },
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#dee2e6'
          }
        }
      }
    };
  }
}
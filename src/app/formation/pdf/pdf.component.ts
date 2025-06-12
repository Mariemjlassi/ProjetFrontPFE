import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormationPosteService } from '../service/FormationPosteService.service';
import { CommonModule } from '@angular/common';
import { EmoloyeService } from '../../employe/service/emoloye.service';

@Component({
  selector: 'app-pdf',
  standalone: true, // si Angular v14+ standalone
  imports: [CommonModule],
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.css']
})
export class PdfComponent implements OnInit {
  formation: any;
  employee: any;
  poste: any;
  isLoading = true;
  error: string | null = null;
employeeDirection: string = '';

  constructor(
    private route: ActivatedRoute,
    private Emoloyeservice: EmoloyeService,
    private formationPosteService: FormationPosteService
  ) {}

 ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const encodedData = params.get('dataq');

    if (encodedData) {
      try {
        // 1. Décoder base64
        const decodedString = decodeURIComponent(escape(atob(encodedData)));
        console.log('JSON décodé:', decodedString);
        
        // 2. Parser JSON
        const pdfData = JSON.parse(decodedString);

        this.formation = pdfData.formation;
        this.employee = pdfData.employee;
        // Appel pour direction
        if (this.employee && this.employee.id) {
          this.Emoloyeservice.getNomDirectionPosteActuel(this.employee.id).subscribe({
            next: (direction) => {
              this.employeeDirection = direction;
            },
            error: (err) => {
              console.error('Erreur lors de la récupération de la direction', err);
            }
          });
        }

        const formationId = this.formation.id;
        this.getPosteForFormation(formationId);

        this.isLoading = false;
      } catch (e) {
        console.error('Erreur de décodage des données', e);
        this.error = 'Données invalides';
        this.isLoading = false;
      }
    } else {
      this.error = 'Aucune donnée fournie';
      this.isLoading = false;
    }
  });
}

formatDateSimple(dateInput: any): string {
  if (!dateInput) return '';

  // Convertir en Date si ce n'est pas déjà le cas
  const date = new Date(dateInput);
  
  // Vérifier si la date est valide
  if (isNaN(date.getTime())) return '';

  // Formater en MM/JJ/AAAA
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

openPrintWindow() {
  const printContents = document.getElementById('ficheImpression')?.innerHTML;
  const popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');

  if (popupWin && printContents) {
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Impression</title>
          <base href="${document.baseURI}">
          <style>
            @media print {
              @page {
                margin: 2cm;
                @top-center {
                  content: element(print-header);
                }
                @bottom-center {
                  content: element(print-footer);
                }
              }

              body {
                font-family: Arial, sans-serif;
                margin: 0;
              }

              header {
                position: running(print-header);
              }

              footer {
                position: running(print-footer);
              }

              table {
                border-collapse: collapse;
                width: 100%;
              }

              th, td {
                border: 1px solid black;
                padding: 6px;
              }

              textarea {
                border: 1px solid black;
              }

              .no-print {
                display: none !important;
              }

              tr, td, th {
                page-break-inside: avoid;
              }

              main {
                page-break-inside: auto;
              }
            }
          </style>
        </head>
        <body onload="window.print(); window.close()">
          ${printContents}
        </body>
      </html>
    `);
    popupWin.document.close();
  }
}



  getPosteForFormation(formationId: number): void {
    this.formationPosteService.getPosteByFormationId(formationId).subscribe({
      next: (poste) => {
        this.poste = poste;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du poste', err);
        this.error = 'Erreur lors du chargement des données';
        this.isLoading = false;
      }
    });
  }




}
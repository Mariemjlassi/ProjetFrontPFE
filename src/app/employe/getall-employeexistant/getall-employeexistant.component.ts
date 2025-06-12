import { Component, OnInit, ViewChild } from '@angular/core';
import { EmployeExistant } from '../model/EmployeExistant';
import { EmoloyeService } from '../service/emoloye.service';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';


import { InputIconModule } from 'primeng/inputicon';
import { Router } from '@angular/router';



@Component({
  selector: 'app-getall-employeexistant',
  imports: [
    CommonModule,
    TableModule,
    

    FormsModule,
    ToolbarModule,
    ButtonModule,
    FileUploadModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    RadioButtonModule,
    InputNumberModule,
    RatingModule,
    TagModule,
    ConfirmDialogModule,
    InputIconModule,

    
  ],
  templateUrl: './getall-employeexistant.component.html',
  styleUrls: ['./getall-employeexistant.component.css'],
})
export class EmployeListComponent implements OnInit {
  employes: EmployeExistant[] = [];
  selectedEmployees: any[] = [];
  globalFilter: string = ''; 
@ViewChild('dt') dt!: Table;

 applyFilter(): void {
    if (this.dt) {
      this.dt.filterGlobal(this.globalFilter, 'contains');
    }
  }

  clearFilter(): void {
    this.globalFilter = '';
    this.applyFilter();
  }
  storedEmployeInfo: any = null;

  constructor(private employeService: EmoloyeService, private router: Router) {}

  ngOnInit(): void {
  
    // Charger tous les employés au démarrage
    this.loadEmployes();
 // Récupérer l'employé mis à jour de localStorage, si disponible
 const employeData = localStorage.getItem('employe');
 if (employeData) {
   this.storedEmployeInfo = JSON.parse(employeData);
   console.log('Employé récupéré après modification:', this.storedEmployeInfo);
   // Optionnel : ajouter cet employé à la liste d'employés si vous le souhaitez
   this.employes.push(this.storedEmployeInfo);
 } else {
   console.log('Aucun employé trouvé dans localStorage.');
 }
  }



  
  goToEditEmployee(employe: any) {
    employe.ajout = employe.ajout !== undefined ? employe.ajout : false;
    localStorage.setItem('employe', JSON.stringify(employe));
    this.router.navigate(['/add-employe']);
  }
  loadEmployes(): void {
    this.employeService.getAllEmployes().subscribe((data) => {
      this.employes = data;
    });
  }

  openNew(): void {
    console.log('Ouverture du formulaire pour ajouter un employé');
    // Ajouter la logique pour ouvrir un formulaire ou une boîte de dialogue
  }

  editEmployee(employe: EmployeExistant): void {
    console.log('Edit employee:', employe);
    // Logique d'édition d'employé ici
  }

  deleteEmployee(employe: EmployeExistant): void {
    console.log('Delete employee:', employe);
    // Logique de suppression d'employé ici
  }

  deleteSelectedEmployees(): void {
    console.log('Delete selected employees');
    // Logique pour supprimer les employés sélectionnés
  }
}
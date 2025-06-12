import { Component, OnInit } from '@angular/core';
import { Utilisateur } from '../model/utilisateur';
import { Permission } from '../model/permission';
import { UtilisateurService } from '../service/utilisateur.service';
import { PermissionService } from '../service/permission.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CardModule } from 'primeng/card';
import { animate, style, transition, trigger } from '@angular/animations';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-permissions',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    TableModule,
    ToastModule,
    DialogModule,
    ButtonModule,
    PaginatorModule,
  ],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class PermissionsComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  permissions: Permission[] = [];
  newPermissionName: string = '';
  displayModal: boolean = false;
  first: number = 0; // Index du premier élément affiché
  rows: number = 5;  // Nombre d'éléments par page


  searchTerm: string = '';

  constructor(
    private utilisateurService: UtilisateurService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.loadUtilisateurs();
    this.loadPermissions();
  }

  get filteredUtilisateurs(): Utilisateur[] {
    return this.utilisateurs.filter((utilisateur) =>
      utilisateur.username.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  loadUtilisateurs(): void {
    this.utilisateurService
      .getAllUtilisateurs()
      .subscribe((data: Utilisateur[]) => {
        this.utilisateurs = data.map((utilisateur: Utilisateur) => {
          if (!utilisateur.permissions) {
            utilisateur.permissions = [];
          }
          return utilisateur;
        });
      });
  }

  loadPermissions(): void {
    this.permissionService.getAllPermissions().subscribe(
      (data) => {
        this.permissions = data;
        console.log('Permissions chargées:', this.permissions);
      },
      (error) => {
        console.error('Erreur lors du chargement des permissions:', error);
      }
    );
  }

  hasPermission(utilisateur: Utilisateur, permission: Permission): boolean {
    return utilisateur.permissions.some((p) => p.id === permission.id);
  }

  togglePermission(utilisateur: Utilisateur, permission: Permission): void {
    if (this.hasPermission(utilisateur, permission)) {
      this.permissionService
        .removePermission(utilisateur.id, permission.name)
        .subscribe(() => {
          utilisateur.permissions = utilisateur.permissions.filter(
            (p) => p.id !== permission.id
          );
        });
    } else {
      this.permissionService
        .assignPermission(utilisateur.id, permission.name)
        .subscribe(() => {
          utilisateur.permissions.push(permission);
        });
    }
  }

  addPermission(): void {
    if (this.newPermissionName.trim()) {
      this.permissionService.createPermission(this.newPermissionName).subscribe(
        (newPermission) => {
          this.permissions.push(newPermission);
          this.newPermissionName = '';
        },
        (error) => {
          console.error("Erreur lors de l'ajout de la permission :", error);
        }
      );
    }
  }

  toggleAllPermissions(utilisateur: Utilisateur): void {
    const allAssigned =
      utilisateur.permissions.length === this.permissions.length;
    if (allAssigned) {
      this.permissions.forEach((permission) => {
        this.permissionService
          .removePermission(utilisateur.id, permission.name)
          .subscribe(() => {
            utilisateur.permissions = [];
          });
      });
    } else {
      this.permissions.forEach((permission) => {
        if (!this.hasPermission(utilisateur, permission)) {
          this.permissionService
            .assignPermission(utilisateur.id, permission.name)
            .subscribe(() => {
              utilisateur.permissions.push(permission);
            });
        }
      });
    }
  }

  toggleAllForAllUsers(): void {
    const allUsersHaveAllPermissions = this.utilisateurs.every(
      (user) => user.permissions.length === this.permissions.length
    );

    if (allUsersHaveAllPermissions) {
      // Désélectionner toutes les permissions pour tous les utilisateurs
      this.utilisateurs.forEach((user) => {
        this.permissions.forEach((permission) => {
          this.permissionService
            .removePermission(user.id, permission.name)
            .subscribe(() => {
              user.permissions = [];
            });
        });
      });
    } else {
      // Sélectionner toutes les permissions pour tous les utilisateurs
      this.utilisateurs.forEach((user) => {
        this.permissions.forEach((permission) => {
          if (!this.hasPermission(user, permission)) {
            this.permissionService
              .assignPermission(user.id, permission.name)
              .subscribe(() => {
                user.permissions.push(permission);
              });
          }
        });
      });
    }
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
  }
  
  get paginatedUtilisateurs(): Utilisateur[] {
    const start = this.first;
    const end = this.first + this.rows;
    return this.filteredUtilisateurs.slice(start, end);
  }
  
}

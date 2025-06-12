import { Component, OnInit } from '@angular/core';
import { Utilisateur } from '../model/utilisateur';
import { UtilisateurService } from '../service/utilisateur.service';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../auth/service/auth.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { PaginatorModule } from 'primeng/paginator';
import { DateFormatPipe } from "../date-format.pipe";
import { JournalActionService } from '../service/journal-action.service';
import { TabViewModule } from 'primeng/tabview';
import { TimelineModule } from 'primeng/timeline';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-utilisateur',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    CardModule,
    AvatarModule,
    BadgeModule,
    ChipModule,
    InputGroupModule,
    InputGroupAddonModule,
    PaginatorModule,
    TabViewModule,
    TimelineModule,
    ProgressSpinnerModule,
    DividerModule,
    TooltipModule
],
  templateUrl: './utilisateur.component.html',
  styleUrl: './utilisateur.component.css',
  providers: [MessageService, ConfirmationService],
})
export class UtilisateurComponent implements OnInit {
  userActions: any[] = [];
  loadingActions: boolean = false;
  activeTabIndex: number = 0;
  actionsSinceLastLogin: any[] = [];

  utilisateurs: Utilisateur[] = [];
  filteredUsers: Utilisateur[] = [];
  userRole: string | null = null;
  selectedUser: Utilisateur | null = null;
  utilisateurSelectionne: Utilisateur = {} as Utilisateur;
  displayDialog: boolean = false;
  passwordDialogVisible: boolean = false;
  newPassword: string = '';

  // UI States
  detailsDialogVisible: boolean = false;
  editMode: boolean = false;
  viewMode: 'grid' | 'list' = 'grid';
  
  // Search & Filter
  searchTerm: string = '';
  selectedRoles: string[] = [];
  roleOptions = [
    { label: 'Super Admin', value: 'SUPER_ADMIN' },
    { label: 'Administrateur', value: 'ADMIN' },
    { label: 'Directeur', value: 'DIRECTEUR' },
    { label: 'RH', value: 'RH' },
    { label: 'Responsable', value: 'RESPONSABLE' }
  ];

  // Recherche et pagination
  first: number = 0;
  rows: number = 10;
  totalRecords: number = 0;

  constructor(
    private utilisateurService: UtilisateurService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private journalActionService: JournalActionService
  ) {}

  loadUserActions(userId: number): void {
    this.loadingActions = true;
    this.journalActionService.getUserActions(userId).subscribe({
      next: (actions) => {
        this.userActions = actions;
        this.loadingActions = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les actions',
          life: 3000
        });
        this.loadingActions = false;
      }
    });

    // Charger aussi les actions depuis la dernière connexion
    this.journalActionService.getActionsSinceLastLogin(userId).subscribe({
      next: (actions) => {
        this.actionsSinceLastLogin = actions;
      }
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.userRole = this.authService.getUserRole();
    console.log('Données transformées:', this.utilisateurs);

  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterUsers();
  }

  loadUsers(): void {
  this.utilisateurService.getUtilisateurs().subscribe({
    next: (data) => {
      this.utilisateurs = data.map(user => {
        console.log('User from API:', user); // Ajoutez ce log pour vérification
        
        return {
          ...user,
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
          accountLocked: user.accountLocked !== undefined ? user.accountLocked : false
        };
      });
      
      console.log('Utilisateurs après mapping:', this.utilisateurs); // Vérifiez les données
      this.filteredUsers = [...this.utilisateurs];
      this.totalRecords = this.filteredUsers.length;
    },
    error: (err) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger les utilisateurs',
        life: 3000
      });
    }
  });
}
  
  filterUsers(): void {
    let filtered = [...this.utilisateurs];
    
    // Filtre par recherche
    if (this.searchTerm) {
      const searchTermLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        `${user.nom} ${user.prenom} ${user.email} ${user.username} ${user.role}`
          .toLowerCase()
          .includes(searchTermLower)
    )}
    
    // Filtre par rôle
    if (this.selectedRoles && this.selectedRoles.length > 0) {
      filtered = filtered.filter(user => this.selectedRoles.includes(user.role));
    }
    
    this.filteredUsers = filtered;
    this.totalRecords = this.filteredUsers.length;
    this.first = 0;
  }

  countByRole(role: string): number {
    return this.utilisateurs.filter(u => u.role === role).length;
  }


  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
  }

  getSeverity(
    role: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (role) {
      case 'SUPER_ADMIN': 
        return 'secondary';
      case 'ADMIN':
        return 'danger';
      case 'DIRECTEUR':
        return 'warn';
      case 'RH':
        return 'info';
      case 'RESPONSABLE':
        return 'success';
      default:
        return 'secondary';
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return '#EB455F';
      case 'DIRECTEUR': return '#2B3467';
      case 'RH': return '#00A896';
      case 'SUPER_ADMIN': return '#4F1787'
      case 'RESPONSABLE': return '#11468F';
      default: return '#6c757d';
    }
  }

  viewUserDetails(utilisateur: Utilisateur): void {
  console.log('Raw lastLogin:', utilisateur.lastLogin);
  console.log('Converted lastLogin:', utilisateur.lastLogin ? new Date(utilisateur.lastLogin) : null);
  this.selectedUser = utilisateur;
  this.loadUserActions(utilisateur.id);
  this.detailsDialogVisible = true;
}

  getRoleClass(role: string): string {
    return `role-chip-${role.toLowerCase()}`;
  }

  openEditDialog(utilisateur: Utilisateur): void {
    this.utilisateurSelectionne = { ...utilisateur };
    this.displayDialog = true;
  }

  updateUtilisateur(): void {
    if (this.utilisateurSelectionne) {
      this.utilisateurService
        .updateUtilisateur(
          this.utilisateurSelectionne.id,
          this.utilisateurSelectionne
        )
        .subscribe({
          next: (updatedUser) => {
            this.utilisateurs = this.utilisateurs.map((u) =>
              u.id === updatedUser.id ? updatedUser : u
            );
            this.filteredUsers = [...this.utilisateurs];
            this.displayDialog = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Utilisateur mis à jour',
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Échec de la mise à jour',
            });
          },
        });
    }
  }

  openAddUserDialog(): void {
    this.utilisateurSelectionne = {
      id: 0,
      nom: '',
      prenom: '',
      email: '',
      username: '',
      role: 'RH',
      lastLogin: null,
      accountLocked:false
    };
    this.editMode = false;
    this.displayDialog = true;
  }
  deleting: boolean = false;
  deleteUtilisateur(id: number): void {
    this.deleting = true;
    this.confirmationService.confirm({
      header: 'Confirmer la suppression',
      message: 'Cette action est irréversible. Voulez-vous vraiment supprimer cet utilisateur ?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.utilisateurService.deleteUtilisateur(id).subscribe({
          next: () => {
            this.utilisateurs = this.utilisateurs.filter(u => u.id !== id);
            this.filteredUsers = this.filteredUsers.filter(u => u.id !== id);
            this.totalRecords = this.filteredUsers.length;
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Échec de la suppression',
              life: 3000
            });
            this.deleting = false;
          },
          error: (err) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Utilisateur supprimé',
              life: 3000
            });
            this.deleting = false;
          }
        });
      }
    });
  }


  

  resetPassword(userId: number, nom: string): void {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: `Voulez-vous vraiment réinitialiser le mot de passe de ${nom} ?`,
      icon: 'pi pi-exclamation-circle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.utilisateurService.resetPassword(userId).subscribe({
          next: (response) => {
            this.newPassword = response.newPassword;
            this.passwordDialogVisible = true;
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: `Le mot de passe de ${nom} a été réinitialisé.`,
              life: 3000,
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de réinitialiser le mot de passe',
              life: 3000,
            });
          },
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Annulé',
          detail: 'Réinitialisation annulée',
          life: 3000,
        });
      },
    });
  }

  copyToClipboard(input: HTMLInputElement): void {
    input.select();
    document.execCommand('copy');
    input.setSelectionRange(0, 0);
    
    this.messageService.add({
      severity: 'success',
      summary: 'Copié',
      detail: 'Mot de passe copié dans le presse-papiers',
      life: 2000
    });
  }

  capitalizeFirstLetter(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  getActionSeverity(action: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    switch(action) {
      case 'Login':
        return 'info';
      case 'DELETE':
      case 'Suppression':
        return 'danger';
      case 'UPDATE':
      case 'Modification':
        return 'warn';
      case 'CREATE':
        return 'success';
      case 'Réinitialisation_MDP':
        return 'success'; // ✅ Remplace "help" par une valeur autorisée
      case 'Consultation':
        return 'secondary';
      case 'Création_Formation':
        return 'info'
      default:
        return 'warn';
    }
  }

 /* lockAccount(userId: number, username: string): void {
  this.confirmationService.confirm({
    header: 'Confirmer le verrouillage',
    message: `Voulez-vous vraiment verrouiller le compte de ${username} ?`,
    icon: 'pi pi-lock',
    acceptLabel: 'Oui, verrouiller',
    rejectLabel: 'Annuler',
    acceptButtonStyleClass: 'p-button-danger',
    rejectButtonStyleClass: 'p-button-secondary',
    accept: () => {
      this.utilisateurService.lockAccount(userId).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: response.message || `Le compte de ${username} a été verrouillé.`,
            life: 3000
          });
          this.loadUsers();
        },
        error: (err) => {
          console.error('Erreur verrouillage:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err.error?.message || 'Impossible de verrouiller le compte',
            life: 3000
          });
        }
      });
    }
  });
}

unlockAccount(userId: number, username: string): void {
  this.confirmationService.confirm({
    header: 'Confirmer le déverrouillage',
    message: `Voulez-vous vraiment déverrouiller le compte de ${username} ?`,
    icon: 'pi pi-unlock',
    acceptLabel: 'Oui, déverrouiller',
    rejectLabel: 'Annuler',
    acceptButtonStyleClass: 'p-button-secondary',
    rejectButtonStyleClass: 'p-button-danger',
    accept: () => {
      this.utilisateurService.unlockAccount(userId).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: response.message || `Le compte de ${username} a été déverrouillé.`,
            life: 3000
          });
          this.loadUsers();
        },
        error: (err) => {
          console.error('Erreur déverrouillage:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err.error?.message || 'Impossible de déverrouiller le compte',
            life: 3000
          });
        }
      });
    }
  });
}*/
lockAccount(userId: number, username: string): void {
  this.utilisateurService.lockAccount(userId).subscribe({
    next: (response) => {
      const user = this.utilisateurs.find(u => u.id === userId);
      if (user) user.accountLocked = true;
      
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: response.message || `Le compte de ${username} a été verrouillé.`,
        life: 3000
      });
    },
    error: (err) => {
      console.error('Erreur verrouillage:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err.error?.message || 'Impossible de verrouiller le compte',
        life: 3000
      });
    }
  });
}

unlockAccount(userId: number, username: string): void {
  this.utilisateurService.unlockAccount(userId).subscribe({
    next: (response) => {
      const user = this.utilisateurs.find(u => u.id === userId);
      if (user) user.accountLocked = false;
      
      this.messageService.add({
        severity: 'primary',
        summary: 'Succès',
        detail: response.message || `Le compte de ${username} a été déverrouillé.`,
        life: 3000
      });
    },
    error: (err) => {
      console.error('Erreur déverrouillage:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err.error?.message || 'Impossible de déverrouiller le compte',
        life: 3000
      });
    }
  });
}

toggleLockState(utilisateur: Utilisateur): void {
  if (utilisateur.role === 'ADMIN' && !this.authService.isSuperAdmin()) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Action non autorisée',
      detail: 'Seul le Super Admin peut modifier le statut d\'un admin',
      life: 3000
    });
    return;
  }

  const action = utilisateur.accountLocked ? 'déverrouiller' : 'verrouiller';
  
  this.confirmationService.confirm({
    header: 'Confirmation',
    message: `Voulez-vous vraiment ${action} le compte de ${utilisateur.nom} ?`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: `Oui, ${action}`,
    rejectLabel: 'Annuler',
    acceptButtonStyleClass: 'p-button-' + (utilisateur.accountLocked ? 'success' : 'danger'),
    rejectButtonStyleClass: 'p-button-secondary',
    accept: () => {
      if (utilisateur.accountLocked) {
        this.utilisateurService.unlockAccount(utilisateur.id).subscribe({
          next: () => {
            this.loadUsers(); // Recharge complet après l'action
          },
          error: (err) => {
            // Gestion erreur
          }
        });
      } else {
        this.utilisateurService.lockAccount(utilisateur.id).subscribe({
          next: () => {
            this.loadUsers(); // Recharge complet après l'action
          },
          error: (err) => {
            // Gestion erreur
          }
        });
      }
    }
  });
}

}

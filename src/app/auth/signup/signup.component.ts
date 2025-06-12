import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';

@Component({
  selector: 'app-admin-user-create',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    CardModule, FloatLabelModule, InputTextModule, 
    PasswordModule, ButtonModule, DropdownModule,
    MessageModule, ToastModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  providers: [MessageService]
})
export class SignupComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  
  roleOptions = [
    { label: 'Ressources Humaines', value: 'RH' },
    { label: 'Directeur', value: 'DIRECTEUR' },
    { label: 'Responsable', value: 'RESPONSABLE' },
    {
      label:'Administrateur', value:'ADMIN'
    }
  ];

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      email: ['', [Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      role: ['RH', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Autoriser seulement Super Admin et Admin
    const userRole = this.authService.getUserRole();
    
    // Autoriser seulement Super Admin
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
        this.showError("Accès refusé", "Seul le Super Admin peut créer des utilisateurs");
        this.router.navigate(['/dashboard']);
        return;
    }

    // Pas besoin de filtrer les rôles car seul le Super Admin a accès
    this.roleOptions = [...this.roleOptions];
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }
  }

  

  submitForm() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.showError('Formulaire invalide', 'Veuillez corriger les erreurs');
      return;
    }

    this.loading = true;
    const formValue = this.registerForm.value;

    let registrationObservable;
    switch(formValue.role) {
      case 'RH':
        registrationObservable = this.authService.registerRH(formValue);
        break;
      case 'DIRECTEUR':
        registrationObservable = this.authService.registerDirecteur(formValue);
        break;
      case 'RESPONSABLE':
        registrationObservable = this.authService.registerResponsable(formValue);
        break;
      case 'ADMIN':
        registrationObservable = this.authService.registerAdmin(formValue);
        break;
      default:
        this.showError('Erreur', 'Rôle invalide');
        this.loading = false;
        return;
    }

    registrationObservable.subscribe({
      next: (response) => {
        this.showSuccess('Utilisateur créé', `${response.prenom} ${response.nom} a été créé avec succès`);
        this.registerForm.reset({
          role: 'RH'
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la création:', err);
        this.showError('Erreur', err.error?.message || 'Échec de la création');
        this.loading = false;
      }
    });
  }

  isAdmin(): boolean {
    return this.authService.getUserRole() === 'ADMIN';
  }

  isSuperAdmin(): boolean {
    return this.authService.getUserRole() === 'SUPER_ADMIN';
  }

  private showSuccess(summary: string, detail: string) {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 5000
    });
  }

  private showError(summary: string, detail: string) {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 5000
    });
  }
}
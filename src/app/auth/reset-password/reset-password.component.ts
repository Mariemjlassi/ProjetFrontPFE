import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../service/auth.service';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-reset-password',
  imports: [
    ToastModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
  providers: [MessageService],
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  token!: string;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupérer le token depuis l'URL
    this.token = this.route.snapshot.queryParams['token'];

    // Initialiser le formulaire
    this.resetPasswordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: this.passwordsMatch }
    );
  }

  passwordsMatch(group: FormGroup): { [key: string]: boolean } | null {
    return group.get('newPassword')!.value ===
      group.get('confirmPassword')!.value
      ? null
      : { mismatch: true };
  }

  loading = false;

  onSubmit(): void {
  if (this.resetPasswordForm.valid) {
    this.loading = true;
    const { newPassword, confirmPassword } = this.resetPasswordForm.value;
    
    this.authService
      .resetPassword(this.token, newPassword, confirmPassword)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: response.message || 'Mot de passe réinitialisé avec succès !',
          });
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (error) => {
          this.loading = false;
          const errorMsg = error.error?.error || 'Échec de la réinitialisation du mot de passe.';
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: errorMsg
          });
        }
      });
  }
}
}

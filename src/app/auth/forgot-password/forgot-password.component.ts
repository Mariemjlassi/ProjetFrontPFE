import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InputText, InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    FloatLabelModule,
    CommonModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
  providers: [MessageService],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  loading = false;

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
      const email = this.forgotPasswordForm.value.email;
      this.authService.requestPasswordReset(email).subscribe({
        next: (response) => {
          console.log('Réponse du serveur :', response); // Log de la réponse
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail:
              'Un email a été envoyé pour réinitialiser votre mot de passe.',
          });
        },
        error: (error) => {
          console.error('Erreur du serveur :', error); // Log de l'erreur
          this.loading = false;
          if (error.status === 404) {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Email non reconnu.',
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Problème technique. Veuillez réessayer plus tard.',
            });
          }
        },
      });
    }
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import {
  RecaptchaModule,
  RecaptchaFormsModule,
  RecaptchaComponent,
} from 'ng-recaptcha';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RecaptchaModule,
    InputTextModule,
    RecaptchaFormsModule,
    ReactiveFormsModule,
    TooltipModule,
    FloatLabelModule,
    ButtonModule,
    ToastModule,
    FormsModule,
    CheckboxModule,
    PasswordModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [MessageService],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  recaptchaToken: string | null = null;
  showPassword: boolean = false;
  remainingAttempts: number | null = null;
  accountLocked: boolean = false;
  @ViewChild('recaptcha') recaptcha: RecaptchaComponent | undefined;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required],
      recaptcha: ['', Validators.required],
      remember: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    const passwordField = document.getElementById('password') as HTMLInputElement;
    if (passwordField) {
      passwordField.type = this.showPassword ? 'text' : 'password';
    }
  }

  onCaptchaResolved(token: string) {
    this.recaptchaToken = token;
    this.loginForm.patchValue({ recaptcha: token });
  }

  resetCaptcha() {
    this.recaptchaToken = null;
    this.loginForm.patchValue({ recaptcha: '' });
    if (this.recaptcha) {
      this.recaptcha.reset();
    }
  }

  login() {
    if (this.loginForm.valid) {
      const loginData = {
        ...this.loginForm.value,
        captchaToken: this.recaptchaToken,
      };

      this.authService.login(loginData).subscribe(
        (response) => {
          console.log('Login successful:', response);
          localStorage.setItem('jwt', response.jwt);
          localStorage.setItem('userId', response.utilisateurId);

          if (this.authService.getUserRole() === 'RH') {
            this.router.navigate(['/home']);
            localStorage.setItem('RHID', response.utilisateurId); // Stocker l'ID seulement si c'est un RH
            console.log('RH ID stocké:', response.utilisateurId);

            
          } else if (this.authService.getUserRole() === 'DIRECTEUR') {
            this.router.navigate(['/home']);
          } else if (this.authService.getUserRole() === 'RESPONSABLE') {
            this.router.navigate(['/home']);
            localStorage.setItem('RESPONSABLEID', response.utilisateurId);
          }else if(this.authService.getUserRole() === 'ADMIN'){
            this.router.navigate(['/dashboard']);
          }else if (this.authService.getUserRole() === 'SUPER_ADMIN') {
  this.router.navigate(['/dashboard']);
}

          const userRole = this.authService.getUserRole();
          console.log('User role:', userRole);

          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Authentification réussie',
            life: 3000
          });

          
        },
        (error) => {
          console.error('Login error:', error);

          this.remainingAttempts = null;
          this.accountLocked = false;


          if (error.error && typeof error.error === 'string') {
            if (error.error.includes('Trop de tentatives')) {
              this.accountLocked = true;
              this.messageService.add({
                severity: 'error',
                summary: 'Compte verrouillé',
                detail: error.error,
                life: 5000
              });
            } else if (error.error.includes('Tentatives restantes')) {
              const matches = error.error.match(/Tentatives restantes: (\d+)/);
              if (matches && matches[1]) {
                this.remainingAttempts = parseInt(matches[1], 10);
              }
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: error.error,
                life: 5000
              });
            } else if (error.error.includes('Compte temporairement verrouillé')) {
              this.accountLocked = true;
              this.messageService.add({
                severity: 'error',
                summary: 'Compte verrouillé',
                detail: error.error,
                life: 5000
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Identifiant ou mot de passe incorrect',
                life: 3000
              });
            }
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Identifiant ou mot de passe incorrect',
              life: 3000
            });
          }
          
          this.resetCaptcha();
        }
      );
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir tous les champs requis',
        life: 3000
      });
    }
  }
}
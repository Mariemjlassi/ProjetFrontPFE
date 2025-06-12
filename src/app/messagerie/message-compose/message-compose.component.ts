import { Component, OnInit } from '@angular/core';
import { Message } from '../model/message';
import { MessageService } from '../service/message.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/service/auth.service';
import { UtilisateurService } from '../../utilisateur/service/utilisateur.service';
import { Utilisateur } from '../../utilisateur/model/utilisateur';
import { Router, RouterModule } from '@angular/router';
import { EditorModule } from 'primeng/editor';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
@Component({
  selector: 'app-message-compose',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    EditorModule,
    RouterModule,
    MultiSelectModule,
    InputTextModule
  ],
  templateUrl: './message-compose.component.html',
  styleUrl: './message-compose.component.css',
})
export class MessageComposeComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  form: FormGroup;
  expediteurId!: number;
  message: Message = {
    sujet: '',
    contenu: '',
    expediteurId: 0,
    destinataireIds: [],
  };

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private authService: AuthService,
    private utilisateurService: UtilisateurService,
    private router: Router
  ) {
    this.form = this.fb.group({
      destinataireIds: [[], Validators.required],
      sujet: ['', Validators.required],
      contenu: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    const id = this.authService.getUserId();
    if (id) {
      this.expediteurId = id;
    }

    this.utilisateurService.getAllUsers().subscribe(data => {
      this.utilisateurs = data.filter(u => u.id !== this.expediteurId);
    });
  }
  envoyer() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  
    const rawValue = this.form.value;
  
    const message: Message = {
      sujet: rawValue.sujet,
      contenu: rawValue.contenu,
      expediteurId: this.expediteurId,
      destinataireIds: rawValue.destinataireIds.map((u: any) => u.id) 
    };
  
    this.messageService.envoyer(message).subscribe({
      next: () => this.router.navigate(['/messages']),
      error: (err) => {
        console.error(err);
        alert("Échec de l'envoi du message");
      }
    });
  }
  
  getUserColor(nom: string): string {
    const hash = Array.from(nom).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['#FFB19B', '#F66060', '#9A2C80', '#F66060', '#A5BFDD', '#6384B3'];
    return colors[hash % colors.length];
  }

  
}

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/service/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  userDetails: any = {};
  userId: number | null = null;

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('userId'));
    if (this.userId) {
      this.loadUserDetails(this.userId);
    }
  }

  loadUserDetails(userId: number): void {
    this.http.get<any>(`http://localhost:9090/login/utilisateurs/${userId}`)
      .subscribe(
        (response) => {
          this.userDetails = response;
        },
        (error) => {
          console.error('Erreur lors du chargement des détails utilisateur:', error);
        }
      );
  }
}
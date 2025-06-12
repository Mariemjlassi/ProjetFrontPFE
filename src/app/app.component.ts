import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/service/auth.service';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from "./navbar/navbar.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent  {
  title = 'RhAssad';
  constructor(private authService: AuthService, private router: Router) {}
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isExcludedRoute(): boolean {
    const excludedRoutes = ['/login', '/reset-password', '/forgot-password']; 
    const currentUrl = this.router.url.split('?')[0]; 
    return excludedRoutes.includes(currentUrl);
}
}

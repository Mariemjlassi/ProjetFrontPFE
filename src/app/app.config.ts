import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { OAuthModule, OAuthService } from 'angular-oauth2-oidc';
import { routes } from './app.routes';
import { HttpClientModule } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { MyPreset } from '../MyPrset';
import { authConfig } from '../auth.config';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    provideAnimations(),
    providePrimeNG(),
    importProvidersFrom(HttpClientModule, OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: ['http://localhost:9090/'],
        sendAccessToken: true
      }
    })),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false 
        }
      }
    })
  ]
};

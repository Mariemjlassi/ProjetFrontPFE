import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  issuer: 'https://accounts.google.com',
  redirectUri: 'http://localhost:9090/login/oauth2/code/google',
  clientId: '21613997105-4khh6li08g6bf3umh9sdmg4e5qq6jrld.apps.googleusercontent.com',
  responseType: 'code',
  scope: 'openid profile email',
  showDebugInformation: true,
  strictDiscoveryDocumentValidation: false,
};

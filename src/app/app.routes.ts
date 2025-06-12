import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AddEmployeComponent } from './employe/add-employe/add-employe.component';
import { EmployeListComponent } from './employe/getall-employeexistant/getall-employeexistant.component';
import { ListSiteComponent } from './site/list-site/list-site.component';
import { ListDirectionComponent } from './direction/list-direction/list-direction.component';
import { ArchiveListDirectionComponent } from './Archive/archive-list-direction/archive-list-direction.component';
import { ListeArchiveComponent } from './Archive/liste-archive/liste-archive.component';
import { ArchiveListSiteComponent } from './Archive/archive-list-site/archive-list-site.component';
import { ListPosteComponent } from './poste/list-poste/list-poste.component';
import { NavbarexmplComponent } from './navbarexmpl/navbarexmpl.component';
import { ExperienceComponent } from './employe/experience/experience.component';
import { CarteComponent } from './carte/carte.component';
import { TypeDiplomeComponent } from './diplome/type-diplome/type-diplome.component';
import { ListDiplomeComponent } from './diplome/list-diplome/list-diplome.component';
import { ArchiveListeTypediplomeComponent } from './Archive/archive-liste-typediplome/archive-liste-typediplome.component';
import { ArchiveListPosteComponent } from './Archive/archive-list-poste/archive-list-poste.component';
import { adminGuard } from './auth/guard/admin.guard';
import { authGuard } from './auth/guard/auth.guard';
import { ListeEmployeComponent } from './employe/liste-employe/liste-employe.component';
import { ProfileComponent } from './employe/profile/profile.component';
import { PosteComponent } from './employe/poste/poste.component';
import { UtilisateurComponent } from './utilisateur/utilisateur/utilisateur.component';
import { RecrutementComponent } from './compatibilte/recrutement/recrutement.component';
import { ListNotificationsComponent } from './notification/list-notifications/list-notifications.component';
import { guardGuard } from './auth/guard/guard.guard';
import { FormationComponent } from './formation/formation.component';
import { GererDiplomeComponent } from './diplome/gerer-diplome/gerer-diplome.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { PermissionsComponent } from './gestion-permissions/permissions/permissions.component';
import { MessagesComponent } from './messagerie/messages/messages.component';
import { MessageDetailComponent } from './messagerie/message-detail/message-detail.component';
import { MessageComposeComponent } from './messagerie/message-compose/message-compose.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FormationResponsableComponent } from './formation/formation-responsable/formation-responsable.component';
import { FormationEmployeComponent } from './employe/formation-employe/formation-employe.component';
import { HomeComponent } from './home/home.component';
import { CompetencesComponent } from './competence/competence/competence.component';
import { EmployeCompetenceComponent } from './competence/employecompetence/employecompetence.component';
import { PdfComponent } from './formation/pdf/pdf.component';
import { ReportingComponent } from './reporting/reporting/reporting.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HabiliteComponent } from './habilite/habilite/habilite.component';
import { superadminGuard } from './auth/guard/superadmin.guard';
import { adminOrSuperadminGuard } from './auth/guard/admin-or-superadmin.guard';
import { ChatbotComponent } from './chatbot/chatbot/chatbot.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent, canActivate: [adminOrSuperadminGuard] },
  { path: 'sidebar', component: SidebarComponent, canActivate: [authGuard] },
  { path: 'add-employe', component: AddEmployeComponent, canActivate :[authGuard] },
  { path: 'list-employe-existants', component: EmployeListComponent, canActivate : [authGuard] },
  {
    path: 'list-site',
    component: ListSiteComponent,
    canActivate: [guardGuard],
  },
  {
    path: 'list-directions',
    component: ListDirectionComponent,
    canActivate: [authGuard],
  },
  {
    path: 'list-directions-archives',
    component: ArchiveListDirectionComponent,
    canActivate: [guardGuard],
  },
  { path: 'archive', component: ListeArchiveComponent,canActivate: [guardGuard], },
  { path: 'liste-sites-archives', component: ArchiveListSiteComponent,canActivate: [guardGuard], },
  { path: 'navbarexp', component: NavbarexmplComponent ,canActivate: [guardGuard],},
  {
    path: 'experience',
    component: ExperienceComponent,
    canActivate: [guardGuard],
  },
  { path: 'carte', component: CarteComponent },
  {
    path: 'list-types',
    component: TypeDiplomeComponent,
    canActivate: [guardGuard],
  },
  {
    path: 'diplomes',
    component: ListDiplomeComponent,
    canActivate: [guardGuard],
  },
  {
    path: 'gerer-diplomes',
    component: GererDiplomeComponent,
    canActivate: [guardGuard],
  },
  {
    path: 'archive-liste-typediplome',
    component: ArchiveListeTypediplomeComponent,
    canActivate: [guardGuard],
  },
  { path: 'list-Poste', component: ListPosteComponent,canActivate: [authGuard] },
  {
    path: 'archive-liste-Poste',
    component: ArchiveListPosteComponent,
    canActivate: [guardGuard],
  },
  { path: 'ListeEmploye', component: ListeEmployeComponent ,canActivate: [authGuard]},
  { path: 'profile', component: ProfileComponent },
  { path: 'poste', component: PosteComponent, canActivate: [authGuard] },
  { path: 'list-utilisateurs', component: UtilisateurComponent, canActivate: [authGuard] },
  
  {
    path: 'register/:role',
    component: SignupComponent,
    canActivate: [adminOrSuperadminGuard],
  },
 
  { path: 'notifications', component: ListNotificationsComponent, canActivate: [authGuard] },
  { path: 'formations', component: FormationComponent , canActivate:[authGuard]},
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'gestion-permissions', component: PermissionsComponent , canActivate:[adminOrSuperadminGuard]},
  { path: 'messages', component: MessagesComponent, canActivate:[authGuard] },
  { path: 'formation_responsable', component: FormationResponsableComponent ,canActivate:[authGuard]},
  { path: 'formations-employees', component: FormationEmployeComponent ,canActivate:[authGuard]},
  { path: 'messages/thread/:messageId', component: MessageDetailComponent,canActivate:[authGuard] },
  { path: 'messages/nouveau', component: MessageComposeComponent,canActivate:[authGuard] },
  { path: 'home', component: HomeComponent,canActivate:[authGuard] },
  { path: 'formations-responsable', component: FormationResponsableComponent , canActivate:[authGuard]},
  { path: 'competences', component: CompetencesComponent,canActivate:[authGuard] },
  { path: 'employe-competences', component: EmployeCompetenceComponent ,canActivate:[authGuard]},
  {path:'pdf/:dataq', component:PdfComponent, canActivate : [authGuard]},
  { path: 'reporting', component: ReportingComponent,canActivate:[authGuard] },
  { path: 'dashboard', component: DashboardComponent,canActivate:[adminOrSuperadminGuard] },
   { path: 'habilite', component: HabiliteComponent, canActivate: [authGuard] },
    { path: 'chatbot', component: ChatbotComponent }
];

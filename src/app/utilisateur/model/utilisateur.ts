export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  username: string;
  role: string;
  lastLogin: string | Date | null;
  accountLocked: boolean;
  
}

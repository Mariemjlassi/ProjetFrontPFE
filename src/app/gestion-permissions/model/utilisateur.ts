import { Permission } from "./permission";

export interface Utilisateur {
    id: number;
    username: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    permissions: Permission[];
  }
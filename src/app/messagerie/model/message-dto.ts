import { Utilisateur } from "../../utilisateur/model/utilisateur";
import { Message } from "./message";

export interface MessageDto {
  id?: number;
  sujet: string;
  contenu: string;
  expediteur: {
      id: number;
      nom: string;
      prenom: string;
  };
  destinataire: {
      id: number;
      nom: string;
      prenom: string;
  };
  dateEnvoi: string;
  lu?: boolean;
  messageParentId?: number;
  expediteurId: number;       // From Java
  expediteurNom: string;      // From Java
  expediteurPrenom: string;   // From Java
  destinataireId: number;     // From Java
  destinataireNom: string;    // From Java
  destinatairePrenom: string; 
}
  
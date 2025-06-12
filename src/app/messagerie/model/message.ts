export interface Message {
  id?: number;
  sujet: string;
  contenu: string;
  expediteurId: number;
  destinataireId?: number; // <=== ajouter celui-ci
  destinataireIds?: number[]; // tu peux garder si tu veux le champ pour "envoyer"
  dateEnvoi?: string;
  lu?: boolean;
  messageParentId?: number;
  reponses?: Message[];
}

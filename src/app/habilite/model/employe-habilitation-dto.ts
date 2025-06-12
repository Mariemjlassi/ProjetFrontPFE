import { PosteDtoHabilite } from "./poste-dto-habilite";

export interface EmployeHabilitationDto {
     id: number;
     nom: string;
  prenom: string;
  matricule: number;
  email: string;
  competences: string[];
  postesHabilites: PosteDtoHabilite[];
}
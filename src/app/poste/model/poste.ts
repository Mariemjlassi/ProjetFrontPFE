import { CompetencePoste } from "./competenceposte";

export class Poste {
  id?: number;
  titre!: string;
  niveauExperience!: string;
  diplomeRequis!: string;
  competencesRequises!: string;
  
  lesProgrammesDeFormation?: string[] = [];
  competencePostes?: CompetencePoste[] = []; 
}
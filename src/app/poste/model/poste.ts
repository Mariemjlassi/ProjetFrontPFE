import { CompetencePoste } from "./competenceposte";

export class Poste {
  id?: number;
  titre!: string;
  niveauExperience!: string;
  diplomeRequis!: string;
  competencesRequises!: string;
  document?: any;
  lesProgrammesDeFormation?: string[] = [];
  competencePostes?: CompetencePoste[] = []; 
}
export interface PosteDtoHabilite {
  id: number;
  niveauExperience: string;
  diplomeRequis: string;
  titre: string;
  competences: string[];
  competencesManquantes: string[];
  competencesSupplementaires: string[];
}
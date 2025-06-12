export class PosteDTO {
  titre: string;
  niveauExperience: string;
  diplomeRequis: string;
  competencesRequises: string;
  
  directionIds: number[];  // Liste des IDs des directions associées
  document?: File;  // Ajout du champ pour le fichier (facultatif)
  lesProgrammesDeFormation?: string[] = []
  constructor(
      titre: string,
      niveauExperience: string,
      diplomeRequis: string,
      competencesRequises: string,
      lesProgrammesDeFormation: string[] = [],
      directionIds: number[],
      document?: File // Paramètre facultatif pour le fichier
  ) {
    this.lesProgrammesDeFormation = lesProgrammesDeFormation;
      this.titre = titre;
      this.niveauExperience = niveauExperience;
      this.diplomeRequis = diplomeRequis;
      this.competencesRequises = competencesRequises;
      this.directionIds = directionIds;
      this.document = document;
  }
}
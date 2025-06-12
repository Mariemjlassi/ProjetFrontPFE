export interface EmployeReportingDTO {
    nom: string;
    prenom: string;
    matricule: number;
    email: string;
    posteActuel: string;
    diplomes: string;        // Chaîne concaténée des diplômes
    typesDiplomes: string;   // Chaîne concaténée des types
    datesObtention: string;  // Chaîne concaténée des dates
    direction: string;
    societesExperience: string; // Chaîne concaténée des sociétés
    postesExperience: string;   // Chaîne concaténée des postes
    periodesExperience: string; 
    titresFormations:string;
    typesFormations:string;
    sousTypesFormations:string;
    periodesFormations:string;
  }
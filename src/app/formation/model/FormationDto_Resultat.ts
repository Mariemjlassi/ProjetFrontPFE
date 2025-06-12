export interface FormationDto_Resultat {
  titre: string;
  description: string;
  typeFormation: string;
  sousTypeFormation: string;
  dateDebutPrevue: string;
  dateFinPrevue: string;
  responsableEvaluationId?: number;
  responsableEvaluationExterne?: string;
 
  employes: {
    employeId: number;
    resultat: string;
  }[];
}
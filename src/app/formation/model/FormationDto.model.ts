import { Employe } from "../../employe/model/employe";
import { Entete } from "./Entete";
import { PeriodeFormationDto } from "./periode-formation-dto";
import { SousTypeFormation } from "./SousTypeFormation.model";
import { TypeFormation } from "./type-formation.model";

export interface FormationDto {
   id?:number
    titre: string;
    description: string;
    typeFormation: TypeFormation;
    sousTypeFormation: SousTypeFormation;
    dateDebutPrevue: string; 
    dateFinPrevue: string;
    responsableEvaluationId?: number; 
    responsableEvaluationExterne?: string; 
    employeIds: number[];
    responsableEvaluation?: any;
    employes?: Employe[];
    fichierPdf?: File; 
    organisateurId?: number;
    titrePoste?: string; 
    valide?:boolean;
    dateRappel?: string;
    probleme?:boolean;
    annuler?:boolean;
    commentaire?: string; 
    periodes?: PeriodeFormationDto[];
    dateAnnulation?: string;
    entete?: Entete; 
    reference?: string;
    revisionNumber?: number;
    dateApplication?: string;
}
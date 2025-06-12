import { Employe } from "../../employe/model/employe";
import { FormationDto } from "./FormationDto.model";

export interface ApiResponse {
    id: number;
    employe: Employe;
    formation: FormationDto & {
        responsable_evaluation?: any; // ou créez une interface spécifique
        responsable_evaluation_externe?: string;
        sous_type_formation?: string;
        type_formation?: string;
        date_debut_prevue?: string;
        date_fin_prevue?: string;
        titre_poste?: string;
        valide?: boolean;
        commentaire?: string;
        commente?: boolean;
        date_debut_reelle?: string | null;
        date_fin_reelle?: string | null;
        email_envoye?: boolean;
        fichier_pdf_url?: string | null;
        responsableEvaluation?: any; // ou créez une interface spécifique
        employes?: Employe[];
        annuler?: boolean;
    };
    document: string | null;
    evalue: boolean;
    resultat: any | null;
    res: boolean;
    capabilite: boolean;
}
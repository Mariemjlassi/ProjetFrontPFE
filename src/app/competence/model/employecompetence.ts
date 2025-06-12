import { Employe } from "../../employe/model/employe";
import { Competence } from "./competence";

export interface EmployeCompetence {
    id:number;
    competenceId: number;
    niveau: string;
  }
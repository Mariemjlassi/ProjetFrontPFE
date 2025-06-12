import { TypeDiplome } from "./type-diplome";

export interface Diplome {
  id?: number;
  libelle: string;
  employeId?: number;
  typeDiplome: TypeDiplome ;
  dateObtention?: Date | string;
  }
  
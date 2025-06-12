export class Employe {
  nom!: string;
  prenom!: string;
  matricule!: number;
  dateNaissance!: Date;
  dateRecrutement!: Date;
  email!: string;
 
  direction?: string;
  site?: string;
  sexe!: string;
  actif!: boolean; // <-- Changement ici (boolean)
 photo!:string ;
  constructor(data?: Partial<Employe>) {
    Object.assign(this, data);
  }
}

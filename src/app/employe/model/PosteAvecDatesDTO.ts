export class PosteAvecDatesDTO {
  posteId: number;
  titre: string;
  dateDebut: string;  // ou Date, selon ce qui est renvoyé par l'API
  dateFin: string;    // ou Date, selon ce qui est renvoyé par l'API
  directionId: number;
  siteId: number;

  constructor(
    posteId: number,
    titre: string,
    idDirection: number,
    idSite: number,
    dateDebut: string,
    dateFin: string
  ) {
    this.posteId = posteId;
    this.titre = titre;
    this.directionId = idDirection;
    this.siteId = idSite;
    this.dateDebut = dateDebut;
    this.dateFin = dateFin;
  }
}

export class DirectionDTO {
    id: number;  // Ajoutez l'ID comme propriété requise
    nom_direction: string;
    siteIds: number[];

    // Modifiez le constructeur pour accepter l'ID
    constructor(id: number, nom_direction: string, siteIds: number[]) {
        this.id = id;
        this.nom_direction = nom_direction;
        this.siteIds = siteIds;
    }
}

  
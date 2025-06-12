import { Site } from "../../site/model/site";

export class Direction {
    id?: number;
      nom_direction!: string;
      archive: boolean = false;
      sites?: Site[];
    }
    
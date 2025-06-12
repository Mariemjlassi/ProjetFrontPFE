export interface EmployePoste {
  id: number;
  employeId: number; // ID de l'employé

  dateDebut: string; // Date de début (en format ISO 8601)
  dateFin: string;   // Date de fin (en format ISO 8601)
  posteId: number,
  directionId: number,
  siteId: number,
}

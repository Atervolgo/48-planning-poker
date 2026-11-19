export interface Sala {
  id: string;
  nombre: string;
  codigo: string;
  facilitadorUid: string;
  miembros: string[];
  faseActual: "votando" | "revelada" | "consenso";
  historiaActualId: string | null;
}

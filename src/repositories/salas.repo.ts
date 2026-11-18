import { db } from "@/lib/firebase-admin";
import type { VotoGuardado } from "@/services/votos";

// ÚNICO lugar que toca Firestore. Los handlers dependen de estas funciones,
// así en las pruebas se reemplazan con vi.mock sin tocar Firebase.

export interface Sala {
  id: string;
  nombre: string;
  codigo: string;
  facilitadorUid: string;
  miembros: string[];
  faseActual: "votando" | "revelada" | "consenso";
  historiaActualId: string | null;
}

export async function obtenerSala(id: string): Promise<Sala | null> {
  const snap = await db.collection("salas").doc(id).get();
  return snap.exists ? ({ id: snap.id, ...snap.data() } as Sala) : null;
}

export async function listarVotos(salaId: string, hid: string): Promise<VotoGuardado[]> {
  const snap = await db.collection(`salas/${salaId}/historias/${hid}/votos`).get();
  return snap.docs.map((d) => ({ uid: d.id, valor: d.data().valor }));
}

export async function obtenerHistoria(salaId: string, hid: string) {
  const snap = await db.doc(`salas/${salaId}/historias/${hid}`).get();
  return snap.exists ? (snap.data() as { titulo: string; estado: "votando" | "revelada" }) : null;
}

export async function marcarRevelada(salaId: string, hid: string) {
  await db.doc(`salas/${salaId}/historias/${hid}`).update({ estado: "revelada" });
}

// TODO Hito 3: crearSala, unirseASala, guardarVoto, tarjetas de retro, etc.

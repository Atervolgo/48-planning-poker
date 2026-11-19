import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import type { VotoGuardado } from "@/services/votos";
import type { Tarjeta, Columna, HistoriaResumen } from "@/services/retro";

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

const salas = () => db.collection("salas");

// ---------- Salas ----------
export async function obtenerSala(id: string): Promise<Sala | null> {
  const snap = await salas().doc(id).get();
  return snap.exists ? ({ id: snap.id, ...snap.data() } as Sala) : null;
}

export async function obtenerSalaPorCodigo(codigo: string): Promise<Sala | null> {
  const q = await salas().where("codigo", "==", codigo).limit(1).get();
  return q.empty ? null : ({ id: q.docs[0].id, ...q.docs[0].data() } as Sala);
}

export async function listarSalasDeUsuario(uid: string): Promise<Sala[]> {
  const q = await salas().where("miembros", "array-contains", uid).get();
  return q.docs.map((d) => ({ id: d.id, ...d.data() }) as Sala);
}

export async function crearSala(nombre: string, codigo: string, facilitadorUid: string): Promise<Sala> {
  const ref = salas().doc();
  const datos = {
    nombre, codigo, facilitadorUid,
    miembros: [facilitadorUid],
    faseActual: "votando" as const,
    historiaActualId: null,
    creadaEn: new Date().toISOString(),
  };
  await ref.set(datos);
  return { id: ref.id, ...datos };
}

export async function agregarMiembro(salaId: string, uid: string) {
  await salas().doc(salaId).update({ miembros: FieldValue.arrayUnion(uid) });
}

// ---------- Historias y votos ----------
export async function crearHistoria(salaId: string, titulo: string): Promise<string> {
  const ref = salas().doc(salaId).collection("historias").doc();
  await ref.set({ titulo, estado: "votando", resultado: null, creadaEn: new Date().toISOString() });
  await salas().doc(salaId).update({ historiaActualId: ref.id, faseActual: "votando" });
  return ref.id;
}

export async function obtenerHistoria(salaId: string, hid: string) {
  const snap = await db.doc(`salas/${salaId}/historias/${hid}`).get();
  return snap.exists ? (snap.data() as { titulo: string; estado: "votando" | "revelada" }) : null;
}

export async function listarHistorias(salaId: string): Promise<HistoriaResumen[]> {
  const q = await salas().doc(salaId).collection("historias").orderBy("creadaEn").get();
  return q.docs.map((d) => ({ titulo: d.data().titulo, resultado: d.data().resultado ?? null }));
}

export async function guardarVoto(salaId: string, hid: string, uid: string, valor: number | string) {
  await db.doc(`salas/${salaId}/historias/${hid}/votos/${uid}`).set({ valor, votadoEn: new Date().toISOString() });
}

export async function listarVotos(salaId: string, hid: string): Promise<VotoGuardado[]> {
  const snap = await db.collection(`salas/${salaId}/historias/${hid}/votos`).get();
  return snap.docs.map((d) => ({ uid: d.id, valor: d.data().valor }));
}

export async function marcarRevelada(salaId: string, hid: string, resultado: number | string | null) {
  const batch = db.batch();
  batch.update(db.doc(`salas/${salaId}/historias/${hid}`), { estado: "revelada", resultado });
  batch.update(salas().doc(salaId), { faseActual: "revelada" });
  await batch.commit();
}

// ---------- Retrospectiva ----------
export async function listarTarjetas(salaId: string): Promise<Tarjeta[]> {
  const q = await salas().doc(salaId).collection("retro").get();
  // Nunca devolvemos "votantes" (dato interno para evitar votos dobles)
  return q.docs.map((d) => {
    const x = d.data();
    return { id: d.id, columna: x.columna, texto: x.texto, autorUid: x.autorUid, votos: x.votos ?? 0 };
  });
}

export async function crearTarjeta(salaId: string, columna: Columna, texto: string, autorUid: string) {
  const ref = salas().doc(salaId).collection("retro").doc();
  await ref.set({ columna, texto, autorUid, votos: 0, votantes: [] });
  return ref.id;
}

/** Un voto por persona y tarjeta. Devuelve el resultado para que el handler elija el HTTP. */
export async function votarTarjeta(salaId: string, tid: string, uid: string): Promise<"ok" | "ya_voto" | "no_existe"> {
  const ref = salas().doc(salaId).collection("retro").doc(tid);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return "no_existe" as const;
    if ((snap.data()!.votantes ?? []).includes(uid)) return "ya_voto" as const;
    tx.update(ref, { votos: FieldValue.increment(1), votantes: FieldValue.arrayUnion(uid) });
    return "ok" as const;
  });
}

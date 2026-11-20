// Repositorio EN MEMORIA para el modo demo. Misma interfaz que salas.firestore.ts.
// Se guarda en globalThis para que sobreviva a la recarga en caliente de Next.
import type { VotoGuardado } from "@/services/votos";
import type { Tarjeta, Columna, HistoriaResumen } from "@/services/retro";
import type { Sala } from "./tipos";

interface HistoriaMem {
  titulo: string;
  estado: "votando" | "revelada";
  resultado: number | string | null;
  votos: Map<string, number | string>;
}
interface SalaMem extends Sala {
  historias: Map<string, HistoriaMem>;
  tarjetas: Map<string, Tarjeta & { votantes: string[] }>;
}
const g = globalThis as unknown as { __pokerMemoria?: Map<string, SalaMem> };
const salas = (g.__pokerMemoria ??= new Map<string, SalaMem>());

const pub = (s: SalaMem): Sala => ({
  id: s.id, nombre: s.nombre, codigo: s.codigo, facilitadorUid: s.facilitadorUid,
  miembros: [...s.miembros], faseActual: s.faseActual, historiaActualId: s.historiaActualId,
});

export async function obtenerSala(id: string): Promise<Sala | null> {
  const s = salas.get(id);
  return s ? pub(s) : null;
}
export async function obtenerSalaPorCodigo(codigo: string): Promise<Sala | null> {
  for (const s of salas.values()) if (s.codigo === codigo) return pub(s);
  return null;
}
export async function listarSalasDeUsuario(uid: string): Promise<Sala[]> {
  return [...salas.values()].filter((s) => s.miembros.includes(uid)).map(pub);
}
export async function crearSala(nombre: string, codigo: string, facilitadorUid: string): Promise<Sala> {
  const s: SalaMem = {
    id: crypto.randomUUID(), nombre, codigo, facilitadorUid, miembros: [facilitadorUid],
    faseActual: "votando", historiaActualId: null, historias: new Map(), tarjetas: new Map(),
  };
  salas.set(s.id, s);
  return pub(s);
}
export async function agregarMiembro(salaId: string, uid: string) {
  const s = salas.get(salaId);
  if (s && !s.miembros.includes(uid)) s.miembros.push(uid);
}

export async function crearHistoria(salaId: string, titulo: string): Promise<string> {
  const s = salas.get(salaId)!;
  const hid = crypto.randomUUID();
  s.historias.set(hid, { titulo, estado: "votando", resultado: null, votos: new Map() });
  s.historiaActualId = hid;
  s.faseActual = "votando";
  return hid;
}
export async function obtenerHistoria(salaId: string, hid: string) {
  const h = salas.get(salaId)?.historias.get(hid);
  return h ? { titulo: h.titulo, estado: h.estado, resultado: h.resultado } : null;
}
export async function listarHistorias(salaId: string): Promise<HistoriaResumen[]> {
  return [...(salas.get(salaId)?.historias.values() ?? [])].map((h) => ({ titulo: h.titulo, resultado: h.resultado }));
}
export async function guardarVoto(salaId: string, hid: string, uid: string, valor: number | string) {
  salas.get(salaId)?.historias.get(hid)?.votos.set(uid, valor);
}
export async function listarVotos(salaId: string, hid: string): Promise<VotoGuardado[]> {
  const h = salas.get(salaId)?.historias.get(hid);
  return h ? [...h.votos].map(([uid, valor]) => ({ uid, valor })) : [];
}
export async function marcarRevelada(salaId: string, hid: string, resultado: number | string | null) {
  const s = salas.get(salaId);
  const h = s?.historias.get(hid);
  if (!s || !h) return;
  h.estado = "revelada";
  h.resultado = resultado;
  s.faseActual = "revelada";
}

export async function fijarConsenso(salaId: string, hid: string, resultado: number | string) {
  const s = salas.get(salaId);
  const h = s?.historias.get(hid);
  if (!s || !h) return;
  h.resultado = resultado;
  s.faseActual = "consenso";
}

export async function listarTarjetas(salaId: string): Promise<Tarjeta[]> {
  return [...(salas.get(salaId)?.tarjetas.values() ?? [])].map(({ id, columna, texto, autorUid, votos }) => ({ id, columna, texto, autorUid, votos }));
}
export async function crearTarjeta(salaId: string, columna: Columna, texto: string, autorUid: string) {
  const id = crypto.randomUUID();
  salas.get(salaId)?.tarjetas.set(id, { id, columna, texto, autorUid, votos: 0, votantes: [] });
  return id;
}
export async function votarTarjeta(salaId: string, tid: string, uid: string): Promise<"ok" | "ya_voto" | "no_existe"> {
  const t = salas.get(salaId)?.tarjetas.get(tid);
  if (!t) return "no_existe";
  if (t.votantes.includes(uid)) return "ya_voto";
  t.votantes.push(uid);
  t.votos += 1;
  return "ok";
}

// FACHADA: los handlers importan siempre de aquí. Según el modo, delega en
// Firestore (real) o en memoria (demo). Import dinámico = no se carga lo que no se usa.
import type * as Firestore from "./salas.firestore";
import { modoDemoActivo } from "@/lib/demo";

export type { Sala } from "./tipos";
type Repo = typeof Firestore;

async function repo(): Promise<Repo> {
  return modoDemoActivo() ? await import("./salas.memoria") : await import("./salas.firestore");
}

export const obtenerSala: Repo["obtenerSala"] = async (...a) => (await repo()).obtenerSala(...a);
export const obtenerSalaPorCodigo: Repo["obtenerSalaPorCodigo"] = async (...a) => (await repo()).obtenerSalaPorCodigo(...a);
export const listarSalasDeUsuario: Repo["listarSalasDeUsuario"] = async (...a) => (await repo()).listarSalasDeUsuario(...a);
export const crearSala: Repo["crearSala"] = async (...a) => (await repo()).crearSala(...a);
export const agregarMiembro: Repo["agregarMiembro"] = async (...a) => (await repo()).agregarMiembro(...a);
export const crearHistoria: Repo["crearHistoria"] = async (...a) => (await repo()).crearHistoria(...a);
export const obtenerHistoria: Repo["obtenerHistoria"] = async (...a) => (await repo()).obtenerHistoria(...a);
export const listarHistorias: Repo["listarHistorias"] = async (...a) => (await repo()).listarHistorias(...a);
export const guardarVoto: Repo["guardarVoto"] = async (...a) => (await repo()).guardarVoto(...a);
export const listarVotos: Repo["listarVotos"] = async (...a) => (await repo()).listarVotos(...a);
export const marcarRevelada: Repo["marcarRevelada"] = async (...a) => (await repo()).marcarRevelada(...a);
export const listarTarjetas: Repo["listarTarjetas"] = async (...a) => (await repo()).listarTarjetas(...a);
export const crearTarjeta: Repo["crearTarjeta"] = async (...a) => (await repo()).crearTarjeta(...a);
export const votarTarjeta: Repo["votarTarjeta"] = async (...a) => (await repo()).votarTarjeta(...a);

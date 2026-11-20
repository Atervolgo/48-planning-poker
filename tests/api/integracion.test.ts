// @vitest-environment node
// PRUEBA DE INTEGRACIÓN: ruta → servicio → repositorio (en memoria, el "simulado").
// Solo se simula la sesión; todo lo demás es el código real.
import { describe, it, expect, vi, beforeAll } from "vitest";

vi.mock("@/lib/auth", () => ({ requerirUsuario: vi.fn() }));

import { requerirUsuario } from "@/lib/auth";
import { POST as crearSala } from "../../app/api/salas/route";
import { POST as unirse } from "../../app/api/salas/unirse/route";
import { POST as crearHistoria } from "../../app/api/salas/[id]/historias/route";
import { PUT as votar } from "../../app/api/salas/[id]/historias/[hid]/votar/route";
import { POST as revelar } from "../../app/api/salas/[id]/historias/[hid]/revelar/route";
import { POST as consenso } from "../../app/api/salas/[id]/historias/[hid]/consenso/route";
import { GET as estado } from "../../app/api/salas/[id]/estado/route";

const como = (uid: string) => vi.mocked(requerirUsuario).mockResolvedValue({ uid, correo: null, rol: "usuario" });
const req = (metodo: string, cuerpo?: unknown) => new Request("http://x/api", { method: metodo, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
const ctx = (p: Record<string, string>) => ({ params: Promise.resolve(p) });

beforeAll(() => vi.stubEnv("MODO_DEMO", "1")); // usa el repositorio en memoria

describe("flujo crítico completo", () => {
  it("sala → unirse → votar a ciegas → revelar (403 a quien no es facilitador) → consenso", async () => {
    // Ana crea la sala y es la facilitadora
    como("demo:ana");
    const sala = await (await crearSala(req("POST", { nombre: "Sprint 12" }), {})).json();
    expect(sala.codigo).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);

    // Luis se une con el código
    como("demo:luis");
    expect((await unirse(req("POST", { codigo: sala.codigo }), {})).status).toBe(200);

    // Ana abre una historia
    como("demo:ana");
    const h = await (await crearHistoria(req("POST", { titulo: "Login con Google" }), ctx({ id: sala.id }))).json();
    const p = ctx({ id: sala.id, hid: h.id });

    // Ambos votan
    expect((await votar(req("PUT", { valor: 13 }), p)).status).toBe(200);
    como("demo:luis");
    expect((await votar(req("PUT", { valor: 3 }), p)).status).toBe(200);

    // Luis mira el estado ANTES de revelar: ve su voto pero NO el de Ana (criterio 1)
    const antes = await estado(req("GET"), ctx({ id: sala.id }));
    const textoAntes = await antes.text();
    const cuerpoAntes = JSON.parse(textoAntes);
    expect(cuerpoAntes.miVoto).toBe(3);
    expect(cuerpoAntes.votos.every((v: { valor?: unknown }) => v.valor === undefined)).toBe(true);
    expect(textoAntes).not.toContain('"valor"'); // ningún valor ajeno viaja (los ids son UUID aleatorios: no se busca "13")

    // Luis intenta revelar: 403 (criterio 2)
    expect((await revelar(req("POST"), p)).status).toBe(403);

    // Ana revela
    como("demo:ana");
    expect((await revelar(req("POST"), p)).status).toBe(200);

    // Ya revelada: nadie cambia su voto (criterio 3)
    como("demo:luis");
    expect((await votar(req("PUT", { valor: 1 }), p)).status).toBe(409);

    // Ahora sí se ven todos los valores y el resumen
    const despues = await (await estado(req("GET"), ctx({ id: sala.id }))).json();
    expect(despues.votos.find((v: { uid: string }) => v.uid === "demo:ana").valor).toBe(13);
    expect(despues.resumen.mediana).toBe(8);

    // Solo la facilitadora fija el consenso
    expect((await consenso(req("POST", { resultado: 8 }), p)).status).toBe(403);
    como("demo:ana");
    expect((await consenso(req("POST", { resultado: 8 }), p)).status).toBe(200);

    const final = await (await estado(req("GET"), ctx({ id: sala.id }))).json();
    expect(final.fase).toBe("consenso");
    expect(final.historial).toEqual([{ titulo: "Login con Google", resultado: 8 }]);
  });
});

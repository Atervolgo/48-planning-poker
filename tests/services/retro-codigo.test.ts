import { describe, it, expect } from "vitest";
import { generarCodigo } from "@/services/codigo";
import { agruparPorColumna, exportarMarkdown, type Tarjeta } from "@/services/retro";

const t = (id: string, columna: Tarjeta["columna"], votos: number): Tarjeta => ({ id, columna, texto: `texto ${id}`, autorUid: "u", votos });

describe("código de invitación", () => {
  it("tiene 6 caracteres sin letras confusas", () => {
    for (let i = 0; i < 50; i++) expect(generarCodigo()).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
  });
});

describe("retrospectiva", () => {
  it("agrupa por columna y ordena por votos", () => {
    const g = agruparPorColumna([t("1", "bien", 1), t("2", "bien", 5), t("3", "acciones", 2)]);
    expect(g.bien.map((x) => x.id)).toEqual(["2", "1"]);
    expect(g.mejorar).toEqual([]);
    expect(g.acciones).toHaveLength(1);
  });
  it("exporta acuerdos y acciones en Markdown", () => {
    const md = exportarMarkdown("Sala A", [{ titulo: "Login", resultado: 5 }, { titulo: "Sin cerrar", resultado: null }], [t("3", "acciones", 2)]);
    expect(md).toContain("# Sala A");
    expect(md).toContain("- Login: **5**");
    expect(md).not.toContain("Sin cerrar");
    expect(md).toContain("- [ ] texto 3 (2 votos)");
  });
});

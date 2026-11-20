import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RetroBoard from "@/components/RetroBoard";

const grupos = {
  bien: [{ id: "1", columna: "bien", texto: "Buen equipo", autorUid: "u", votos: 2 }],
  mejorar: [],
  acciones: [],
};
const ok = (data: unknown) => vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => data });
afterEach(() => vi.unstubAllGlobals());

describe("RetroBoard", () => {
  it("muestra tres columnas con sus títulos y las tarjetas", async () => {
    vi.stubGlobal("fetch", ok(grupos));
    render(<RetroBoard salaId="s1" />);
    expect(await screen.findByRole("heading", { name: "Qué salió bien" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Qué mejorar" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Acciones" })).toBeInTheDocument();
    expect(screen.getByText("Buen equipo")).toBeInTheDocument();
  });

  it("el botón de votar tiene una etiqueta accesible con el texto y los votos", async () => {
    vi.stubGlobal("fetch", ok(grupos));
    render(<RetroBoard salaId="s1" />);
    expect(await screen.findByRole("button", { name: /Votar: Buen equipo\. Votos actuales 2/ })).toBeInTheDocument();
  });

  it("las columnas sin tarjetas muestran un estado vacío", async () => {
    vi.stubGlobal("fetch", ok(grupos));
    render(<RetroBoard salaId="s1" />);
    expect(await screen.findAllByText("Sin tarjetas todavía.")).toHaveLength(2);
  });

  it("no envía una tarjeta vacía y avisa del error", async () => {
    const fetchMock = ok(grupos);
    vi.stubGlobal("fetch", fetchMock);
    render(<RetroBoard salaId="s1" />);
    await userEvent.click(await screen.findByRole("button", { name: "Agregar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/entre 1 y 280/);
    expect(fetchMock.mock.calls.every(([, init]) => (init as RequestInit | undefined)?.method !== "POST")).toBe(true);
  });

  it("si falla la carga muestra un error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({ error: "x" }) }));
    render(<RetroBoard salaId="s1" />);
    expect(await screen.findByRole("alert")).toHaveTextContent(/no se pudo cargar/i);
  });
});

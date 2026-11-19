import { manejar } from "@/lib/http";
import { requerirMiembro } from "@/lib/acceso";
import { listarHistorias, listarTarjetas } from "@/repositories/salas.repo";
import { exportarMarkdown } from "@/services/retro";

export const runtime = "nodejs";

// GET /api/salas/:id/exportar → acuerdos y acciones en Markdown (RF-06)
export const GET = manejar(async (req, { params }) => {
  const { id } = await params;
  const { sala } = await requerirMiembro(req, id);
  const md = exportarMarkdown(sala.nombre, await listarHistorias(id), await listarTarjetas(id));
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="sala-${id}.md"`,
      "Cache-Control": "no-store",
    },
  });
});

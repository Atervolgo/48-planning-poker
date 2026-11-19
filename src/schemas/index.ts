import { z } from "zod";

// Valores permitidos de las cartas (secuencia tipo Fibonacci + comodines)
export const VALORES_CARTA = [0, 1, 2, 3, 5, 8, 13, 21, "?", "☕"] as const;

// .strict() rechaza campos desconocidos → evita "mass assignment" (sección 9.5)
export const crearSalaSchema = z
  .object({ nombre: z.string().trim().min(3).max(60) })
  .strict();

export const votoSchema = z
  .object({ valor: z.union([z.number().int().min(0).max(100), z.enum(["?", "☕"])]) })
  .strict();

export const crearHistoriaSchema = z
  .object({ titulo: z.string().trim().min(3).max(120) })
  .strict();

export const tarjetaRetroSchema = z
  .object({
    columna: z.enum(["bien", "mejorar", "acciones"]),
    texto: z.string().trim().min(1).max(280),
  })
  .strict();

export type Voto = z.infer<typeof votoSchema>;
export const MAX_PERSONAS_POR_SALA = 15;

export const unirseSchema = z
  .object({ codigo: z.string().trim().length(6).transform((s) => s.toUpperCase()) })
  .strict();

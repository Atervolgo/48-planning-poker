// Código de invitación (RF-01): 6 caracteres, sin letras confusas (0/O, 1/I).
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generarCodigo(longitud = 6): string {
  const bytes = new Uint8Array(longitud);
  crypto.getRandomValues(bytes); // aleatorio seguro (no Math.random)
  return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join("");
}

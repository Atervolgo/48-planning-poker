// Errores de dominio → se convierten a códigos HTTP en un solo lugar (http.ts)
export class ErrorHttp extends Error {
  constructor(
    public status: 400 | 401 | 403 | 404 | 409 | 429,
    message: string,
    public detalles?: { campo: string; mensaje: string }[],
  ) {
    super(message);
  }
}
export const noAutenticado = () => new ErrorHttp(401, "Sesión requerida");
export const prohibido = (m = "No tiene permiso") => new ErrorHttp(403, m);
export const noEncontrado = (m = "No encontrado") => new ErrorHttp(404, m);
export const conflicto = (m: string) => new ErrorHttp(409, m);

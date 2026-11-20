import { useEffect } from "react";

/**
 * Ejecuta `fn` cada `ms` milisegundos, pero SOLO mientras la pestaña está visible
 * (Page Visibility API): ahorra peticiones y cuota de Firestore.
 * `fn` debe ser estable (envuélvala en useCallback).
 */
export function usePolling(fn: () => void | Promise<void>, ms = 3000) {
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const iniciar = () => {
      if (timer) return;
      void fn(); // al volver a la pestaña refresca de inmediato
      timer = setInterval(() => void fn(), ms);
    };
    const detener = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    const onVisibilidad = () => (document.visibilityState !== "hidden" ? iniciar() : detener());

    onVisibilidad();
    document.addEventListener("visibilitychange", onVisibilidad);
    return () => {
      detener();
      document.removeEventListener("visibilitychange", onVisibilidad);
    };
  }, [fn, ms]);
}

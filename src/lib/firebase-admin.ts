// SOLO SERVIDOR. Nunca importar desde un componente "use client".
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Se inicializa la primera vez que se USA (no al importar), así `next build`
// y el modo demo funcionan aunque no existan las credenciales.
function app() {
  return (
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // En Vercel la clave llega con "\n" literales → se convierten a saltos de línea
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    })
  );
}

function perezoso<T extends object>(crear: () => T): T {
  let instancia: T | undefined;
  return new Proxy({} as T, {
    get(_, prop) {
      instancia ??= crear();
      const valor = (instancia as Record<string | symbol, unknown>)[prop];
      return typeof valor === "function" ? valor.bind(instancia) : valor;
    },
  });
}

export const adminAuth = perezoso(() => getAuth(app()));
export const db = perezoso(() => getFirestore(app()));

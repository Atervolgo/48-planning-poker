// SOLO para Auth en el navegador. NUNCA importar firebase/firestore aquí.
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/** Se crea al pulsar el botón, no al cargar la página. */
export function obtenerAuth() {
  const app =
    getApps()[0] ??
    initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
  return getAuth(app);
}

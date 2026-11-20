// Asigna el claim `rol` a una cuenta de Firebase (Hito 4: roles).
// Uso:  node --env-file=.env.local scripts/asignar-rol.mjs correo@dominio.com admin
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const [correo, rol = "usuario"] = process.argv.slice(2);
if (!correo) { console.error("Falta el correo"); process.exit(1); }

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});
const usuario = await getAuth().getUserByEmail(correo);
await getAuth().setCustomUserClaims(usuario.uid, { rol });
console.log(`Rol "${rol}" asignado a ${correo}. La persona debe volver a iniciar sesión.`);

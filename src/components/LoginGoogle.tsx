"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { obtenerAuth } from "@/lib/firebase-client";
import { api } from "@/lib/api";

export default function LoginGoogle() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function entrar() {
    setCargando(true);
    setError(null);
    try {
      const cred = await signInWithPopup(obtenerAuth(), new GoogleAuthProvider());
      const idToken = await cred.user.getIdToken();
      await api("/api/auth/sesion", { method: "POST", body: JSON.stringify({ idToken }) }); // idToken → cookie HttpOnly
      router.push("/salas");
    } catch {
      setError("No se pudo iniciar sesión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <button type="button" onClick={entrar} disabled={cargando}>
        {cargando ? "Entrando…" : "Entrar con Google"}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}

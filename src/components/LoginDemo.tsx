"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginDemo() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api("/api/auth/demo", { method: "POST", body: JSON.stringify({ nombre }) });
      router.push("/salas");
    } catch {
      setError("Escribe un nombre de 2 a 20 caracteres.");
    }
  }

  return (
    <form onSubmit={entrar} noValidate>
      <h2>Modo demo (sin Firebase)</h2>
      <label htmlFor="nombre-demo">Tu nombre</label>
      <input id="nombre-demo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <button type="submit">Entrar en modo demo</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}

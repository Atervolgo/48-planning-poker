"use client";

import { useRouter } from "next/navigation";

export default function BotonSalir() {
  const router = useRouter();
  async function salir() {
    try {
      await fetch("/api/auth/sesion", { method: "DELETE" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }
  return (
    <button type="button" onClick={salir}>
      Salir
    </button>
  );
}

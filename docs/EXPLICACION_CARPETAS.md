# Explicación de carpetas (criterio 4) — una frase por carpeta

| Carpeta / archivo | Qué es | Por qué está separado |
|---|---|---|
| `app/` | Páginas y rutas de Next.js (App Router) | El nombre de la carpeta define la URL |
| `app/api/` | La API REST (Route Handlers) | Backend y frontend viven en el mismo proyecto |
| `app/salas/[id]/poker` | Pantalla de estimación | `[id]` es un parámetro dinámico |
| `app/unirse/[codigo]` | Unirse con código de invitación | Ruta pública de entrada |
| `proxy.ts` | Redirige a login si falta cookie | Mejora UX; NO es seguridad |
| `src/components/` | UI reutilizable y accesible | Evita repetir código |
| `src/hooks/` | `useDebounce`, `usePolling`… | Lógica de React reutilizable |
| `src/schemas/` | Esquemas Zod | Una sola verdad para cliente y servidor |
| `src/services/` | Reglas de negocio puras | Se prueban sin Firebase |
| `src/repositories/` | Acceso a Firestore | Único lugar que toca la base |
| `src/lib/` | Firebase, auth, errores, http | Utilidades de infraestructura |
| `tests/` | Vitest + Testing Library | Demuestra que las reglas funcionan |
| `openapi.yaml` | Contrato de la API | Documentación estándar |
| `bruno/` | Colección de solicitudes | Probar la API a mano |
| `ia/` | Evidencias de la configuración de IA | Se pide en la sustentación |
| `calidad/` | Lighthouse, capturas, axe | Evidencias de calidad (sección 14) |
| `docs/` | Documentación de apoyo | Guía de la explicación |
| `CLAUDE.md` · `.claude/` | Reglas y permisos de la IA | Primer commit |
| `BITACORA_IA.md` | Registro de uso de IA | Auditable |
| `firestore.rules` | Niega todo acceso directo | Regla de oro |
| `.env.example` | Plantilla de variables | El real nunca va a Git |

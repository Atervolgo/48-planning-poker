# Guion de sustentación (≈ 5 min) — Proyecto 48

**1. Qué es (20 s).** "Es una app para que un equipo estime historias con cartas y haga retrospectivas. Un solo proyecto Next.js con interfaz y API; Firebase para autenticación y datos."

**2. Arquitectura de infraestructura (1 min).** Monolito. Mostrar `docs/ARQUITECTURA.md`. Justificar: dominio pequeño, un despliegue, mismo origen. Mencionar que pasaría a monolito modular antes que a servicios.

**3. Arquitectura del repositorio (1 min).** Capas: handler → servicio → repositorio. Abrir `estado/route.ts` y mostrar que NO toca Firestore directo. Abrir `estadisticas.ts` y decir "es pura, por eso la pruebo sin Firebase".

**4. Seguridad (1,5 min).** Demo en vivo:
- DevTools → Red: antes de revelar, la respuesta de `/estado` no trae valores.
- Intentar revelar sin ser facilitador → 403.
- Cookie `HttpOnly` en Application → Cookies.
- `firestore.rules` = `if false`.

**5. Seguridad en el uso de IA (1 min).** Mostrar `CLAUDE.md`, `.claude/settings.json` y `BITACORA_IA.md`. Demostrar que la IA no puede leer `.env.local`.

**6. Carpetas (30 s).** Recorrer `docs/EXPLICACION_CARPETAS.md`.

**7. Cierre.** Qué falta (ver plan de trabajo) y qué cambiarías.

## Preguntas probables
- *¿Por qué no usar Firestore desde el navegador?* Porque las reglas tendrían que expresar "oculta los votos hasta revelar", y eso lo controla mejor el servidor. Además así las reglas son `if false`.
- *¿Para qué sirve `proxy.ts` si cada ruta verifica?* Solo mejora la experiencia (redirige). Si lo quitan, la API sigue protegida.
- *¿Dónde se decide que un voto es ajeno?* En `prepararVotosParaCliente` (servicio) llamado desde `/estado`.
- *¿Qué pasa si un usuario manipula el `uid` en la petición?* No importa: el `uid` sale de la cookie verificada, nunca del cuerpo.
- *¿Por qué Zod con `.strict()`?* Evita *mass assignment*: campos extra se rechazan.
- *¿Cómo sabes que el código de la IA es correcto?* Lo leo, lo pruebo con Vitest, lo registro en la bitácora y decido si lo uso.
- *Modifica algo en vivo:* ejemplo → agregar la carta "40" en `VALORES_CARTA` y ver que aparece (schema + UI).

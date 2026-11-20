# Plan de trabajo por hitos

Leyenda: ✅ escrito · 🧪 escrito pero SIN ejecutar (falta `npm install` y probarlo) · ☐ pendiente

## Hito 1 (semana 4)
- ✅ Esqueleto de carpetas, configuración de IA, bitácora
- 🧪 Mesa de cartas (`/demo`): `aria-pressed`, atajos 1–9, revelado simulado, `aria-live`
- 🧪 `fetch` de datos de ejemplo con estados carga / vacío / error + reintentar
- ✅ Estadísticas puras verificadas con Node (promedio, mediana, dispersión, consenso) y tipos estrictos OK
- ☐ Inicializar con `create-next-app` y verificar `npm run dev`
- ☐ **Hacer el primer commit con la configuración de IA** y subir a GitHub
- ☐ Llenar la bitácora con sus propios usos y tomar las capturas de `ia/`

## Hito 2 (semana 7)
- 🧪 Componentes: `Salas` (formulario controlado con Zod), `RetroBoard`, `UnirseSala`, `LoginGoogle`
- 🧪 Diseño de 1 columna (móvil) a 3 columnas (≥ 768 px)
- 🧪 Pruebas de componente de `MesaCartas` (5)
- ☐ Probar en 360 / 768 / 1024 px y con teclado
- 🧪 Pruebas de `MesaCartas` (6), `RetroBoard` (5) y `Salas` (4)

## Hito 3 (semana 12)
- 🧪 Repositorio completo de Firestore (`src/repositories/salas.repo.ts`)
- 🧪 11 endpoints (ver README) con validación Zod, 401/400/403/404/409
- 🧪 Pruebas de API: revelar, estado (votos ocultos), votar
- ✅ `openapi.yaml` ampliado · ✅ colección Bruno (9 solicitudes)
- 🧪 Pruebas de `unirse`, `retro`, `consenso`, `exportar`, `estado`, `seguridad` (Origin y 429) e **integración** ruta → servicio → repositorio
- ☐ Crear el proyecto de Firebase y llenar `.env.local`

## Extra: modo demo
- ✅ Repositorio en memoria verificado con Node (flujo completo: sala, miembros, votos ocultos, revelar, retro, voto único)
- 🧪 Acceso por nombre (`/api/auth/demo`), fachada de repositorio, Firebase perezoso (el build no exige credenciales)
- ☐ Probar el flujo de dos navegadores completo (`docs/DEMO.md`)

## Hito 4 (semana 15)
- 🧪 Login con Google → cookie de sesión HttpOnly
- ☐ Desplegar en Vercel con variables de entorno
- ☐ Roles/claims y `proxy.ts` revisado
- ☐ `CALIDAD.md`: Lighthouse, axe, 3 retos de excelencia
- ☐ Evidencias de IA en vivo (`ia/`)

## Hecho en la última ronda
- 🧪 `useOptimistic` en `PokerSala` (voto al instante, se revierte si falla)
- 🧪 Fase **consenso** (`useReducer` en `MesaCartas`; endpoint `/consenso` en la sala) y avanzar a la siguiente historia
- 🧪 Historial de estimaciones, tu propio voto tras recargar, botón «Actualizar» (alternativa al sondeo)
- 🧪 Botón «Salir» (revoca tokens), esqueletos de carga, `<fieldset>/<legend>`
- 🧪 `next.config.ts` con CSP y cabeceras · `Origin` · límite 429 · `scripts/asignar-rol.mjs`
- ✅ Verificado con Node: límite de frecuencia, Origin, modo demo desactivado en producción, consenso en memoria

## Pendientes conocidos del código
- Roles: el claim `rol` se lee y se puede asignar con `scripts/asignar-rol.mjs`, pero ninguna pantalla lo usa todavía.
- `BroadcastChannel` (sincronizar pestañas) y `<dialog>` no se implementaron (la sección 5 pide mínimo 2 APIs: ya hay `fetch`+Page Visibility y atajos de teclado).
- El límite de frecuencia es por instancia (memoria); en Vercel se recomienda además el Firewall.
- Con Firebase real, el `uid` se muestra como "Persona N"; falta guardar nombres visibles de los miembros (en demo sí se ve el nombre).

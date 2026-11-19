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
- ☐ Pruebas de `Salas` y `RetroBoard`

## Hito 3 (semana 12)
- 🧪 Repositorio completo de Firestore (`src/repositories/salas.repo.ts`)
- 🧪 11 endpoints (ver README) con validación Zod, 401/400/403/404/409
- 🧪 Pruebas de API: revelar, estado (votos ocultos), votar
- ✅ `openapi.yaml` ampliado · ✅ colección Bruno (9 solicitudes)
- ☐ Pruebas de `unirse`, `retro`, `exportar`
- ☐ Crear el proyecto de Firebase y llenar `.env.local`

## Hito 4 (semana 15)
- 🧪 Login con Google → cookie de sesión HttpOnly
- ☐ Desplegar en Vercel con variables de entorno
- ☐ Roles/claims y `proxy.ts` revisado
- ☐ `CALIDAD.md`: Lighthouse, axe, 3 retos de excelencia
- ☐ Evidencias de IA en vivo (`ia/`)

## Pendientes conocidos del código
- `useOptimistic` (la spec lo menciona): hoy el voto optimista usa `useState` con reversión; se puede migrar.
- Límite de tasa (429) y comprobación de `Origin` en métodos que cambian datos: sin implementar.
- El `uid` se muestra como "Persona N"; falta guardar nombres visibles de los miembros.

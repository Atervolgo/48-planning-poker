# 48 · Planning Poker y Retrospectivas

Sesiones de equipo para estimar historias con cartas y hacer retrospectivas con tarjetas y votos.
Un solo proyecto Next.js (interfaz + API REST) con Firebase Auth y Firestore (solo vía Admin SDK).

## Cómo ejecutarlo

```bash
# 1. Crear la base (SIN --src-dir: este proyecto tiene app/ en la raíz y el resto en src/)
npx create-next-app@latest 48-planning-poker --ts --app --eslint
cd 48-planning-poker
npm i firebase firebase-admin zod
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom

# 2. Copiar encima los archivos de este esqueleto (reemplaza app/layout.tsx, app/page.tsx, app/globals.css)
#    En tsconfig.json cambie el alias a:   "paths": { "@/*": ["./src/*"] }
#    En package.json agregue:              "test": "vitest run"

# 3. Variables de entorno
cp .env.example .env.local     # complete los valores (NUNCA lo suba a Git)
#    Para probar SIN Firebase, deje solo:  MODO_DEMO=1   (ver docs/DEMO.md)

# 4. Correr
npm run dev      # http://localhost:3000/demo  (Hito 1, no necesita Firebase)
npm test
```

## Rutas de la interfaz
| Ruta | Qué es | Requiere sesión |
|---|---|---|
| `/demo` | Mesa de cartas con datos de ejemplo (Hito 1) | No |
| `/login` | Entrar con Google | No |
| `/salas` | Mis salas: crear y listar | Sí |
| `/unirse/[codigo]` | Unirse con código de invitación | Sí |
| `/salas/[id]/poker` | Estimación en vivo (polling) | Sí |
| `/salas/[id]/retro` | Retrospectiva con votos | Sí |

## API (ver `openapi.yaml`)
`POST/DELETE /api/auth/sesion` · `GET /api/auth/yo` · `GET/POST /api/salas` · `POST /api/salas/unirse` ·
`GET /api/salas/:id/estado` · `POST /api/salas/:id/historias` · `PUT …/historias/:hid/votar` ·
`POST …/historias/:hid/revelar` · `POST …/historias/:hid/consenso` · `GET/POST /api/salas/:id/retro` · `POST …/retro/:tid/votar` · `GET /api/salas/:id/exportar`

## Seguridad implementada
Reglas de Firestore `if false` · cookie `HttpOnly/Secure/SameSite=Lax` · sesión verificada en cada ruta · autorización por objeto (404/403) ·
Zod `.strict()` · votos ajenos ocultos en el servidor · **comprobación de `Origin`** y **límite 429** en todos los métodos que escriben (`src/lib/http.ts`) ·
cabeceras de seguridad y CSP (`next.config.ts`) · cierre de sesión que revoca tokens · `npm audit` pendiente.

## Modo demo
`MODO_DEMO=1` + `npm run dev` usa datos en memoria y entra con un nombre (`/login`). Se desactiva solo en producción. Guía de presentación: `docs/DEMO.md`.

## Estado del avance
Ver `docs/PLAN_DE_TRABAJO.md`. Resumen: Hito 1 completo en código; Hitos 2 y 3 adelantados; seguridad de la sección 9.5 implementada. Todo está **sin ejecutar** aún: requiere `npm install` y, para el login real, un proyecto Firebase.

# 48 · Planning Poker y Retrospectivas

Sesiones de equipo para estimar historias con cartas y hacer retrospectivas con tarjetas y votos.
Un solo proyecto Next.js (interfaz + API REST) con Firebase Auth y Firestore (solo vía Admin SDK).

## Cómo ejecutarlo

```bash
# 1. Crear la base del proyecto (una sola vez) y copiar encima estos archivos
npx create-next-app@latest 48-planning-poker --ts --app --eslint --src-dir
cd 48-planning-poker
npm i firebase firebase-admin zod
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom

# 2. Variables de entorno
cp .env.example .env.local     # y complete los valores (NUNCA lo suba a Git)

# 3. Correr
npm run dev
npm test
```

> Nota: `create-next-app --src-dir` pone `app/` dentro de `src/`. En este esqueleto `app/` está en la raíz
> (como pide el documento del proyecto); si usa `--src-dir`, mueva `app/` dentro de `src/` y ajuste el alias `@/`.

## Qué hay hoy (Hito 1 · punto de partida)
- Mesa de cartas con `aria-pressed`, atajos 1–9 y revelado simulado (`src/components/MesaCartas.tsx`).
- Lógica pura de promedio, mediana, dispersión y consenso (`src/services/estadisticas.ts`) con pruebas.
- Filtro que oculta votos ajenos (`src/services/votos.ts`) con pruebas.
- Handlers base: sesión, `/auth/yo`, estado de sala y revelar (403 si no es facilitador).
- Configuración de IA (`CLAUDE.md`, `.claude/settings.json`) y bitácora (`BITACORA_IA.md`).

## Qué falta
Ver `docs/PLAN_DE_TRABAJO.md`.

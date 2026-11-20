# Bitácora de IA

Una fila por cada uso importante de la IA. Se audita en el hito 4.
**Complete la columna "Validación" con lo que USTED comprobó de verdad.**

| Fecha | Propósito (qué le pedí) | Evidencia (qué generó) | Validación (cómo lo comprobé) | Decisión (usé / modifiqué / descarté y por qué) |
|---|---|---|---|---|
| 2026-11-18 | Esqueleto inicial del proyecto 48 | Carpetas, schemas, servicio de estadísticas, handlers base | Verifiqué la lógica pura con Node y tipos con `tsc`; falta `npm test` | Usado como base |
| 2026-11-18 | Avanzar Hitos 1–3: repositorio, 11 endpoints, componentes, pruebas, OpenAPI y Bruno | Ver commits `feat:` del historial | **Pendiente:** correr `npm install`, `npm test`, `npm run lint`, `npm run build` y probar a mano | Pendiente de revisión archivo por archivo |
| 2026-11-19 | Modo demo para mostrar sin Firebase y preparar la presentación | `salas.memoria.ts`, fachada `salas.repo.ts`, `lib/demo.ts`, `/api/auth/demo`, `docs/DEMO.md` | Flujo en memoria ejecutado con Node (pasó); tipos con `tsc`; **falta** probar en navegador | Pendiente de revisión; confirmar que el modo demo no puede activarse en producción |
| 2026-11-20 | Completar requisitos faltantes: consenso, useOptimistic, historial, Origin, 429, CSP, pruebas | Ver commits de la última ronda | Ejecuté con Node: límite, Origin, modo demo y consenso; revisé sintaxis con `tsc`; **falta** `npm test` y probar en navegador | Pendiente de revisión; cambiar el límite 429 si estorba en la demo |
| | | | | |

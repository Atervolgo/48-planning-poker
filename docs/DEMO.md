# Guía para mostrar el proyecto en clase

## 1. Preparación (hágala HOY, no mañana)

```bash
npx create-next-app@latest 48-planning-poker --ts --app --eslint     # SIN --src-dir
cd 48-planning-poker
npm i firebase firebase-admin zod
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
# copie encima los archivos del esqueleto; en tsconfig.json: "paths": { "@/*": ["./src/*"] }
# en package.json agregue "test": "vitest run" y cambie "lint" por "eslint"
```

Cree `.env.local` con una sola línea (no hace falta Firebase para la demo):

```
MODO_DEMO=1
```

Luego `npm run dev` y abra http://localhost:3000/login.

> El modo demo guarda los datos en memoria y entra solo con un nombre. **Solo funciona con `npm run dev`**:
> en producción (`next start`, Vercel) se apaga aunque la variable exista. Dígalo en la sustentación.

## 2. Guion de la demostración (≈ 5 min)

Use **dos navegadores** (uno normal y uno en incógnito) para simular dos personas.

1. **Navegador A:** `/login` → modo demo → nombre «Ana» → crear sala «Sprint 12». Ana es la **facilitadora**.
2. Copie el código de 6 letras. **Navegador B:** entre como «Luis» → abra `/unirse/CODIGO` → «Unirme a la sala».
3. **A:** abra Poker → «Abrir historia» → «Login con Google».
4. **A y B:** voten con las teclas 1 a 9 (o clic). Se ve «ya votó ✓» pero **no el valor**.
5. **Criterio de seguridad (RF-03):** en B abra DevTools → Red → `estado` → Respuesta. Muestre que los valores de los demás **no viajan**.
6. **Criterio de rol (RF-05):** en la consola de B ejecute
   `fetch("/api/salas/ID/historias/HID/revelar",{method:"POST"}).then(r=>r.status)` → **403**. (ID y HID salen de la URL y de la pestaña Red).
7. **A:** «Revelar votos» → aparecen valores, promedio y mediana; el lector de pantalla anuncia el cambio (`aria-live`). Luego **«Fijar consenso»** con el valor acordado: aparece en el *Historial de estimaciones* y se habilita abrir la siguiente historia. Intente votar de nuevo en B: las cartas están bloqueadas (criterio 3).
8. **Retro:** `/salas/ID/retro` → agregue tarjetas en las 3 columnas, vote, y use «Exportar» (RF-06).
9. Muestre `/demo` (Hito 1) y `npm test`. Cierre con **«Salir»**.
10. *(Opcional, seguridad)* En DevTools → Red → cualquier respuesta: muestre `Content-Security-Policy`. En consola, `fetch('/api/salas',{method:'POST',headers:{'Content-Type':'application/json',Origin:'x'}})` no sirve (el navegador fija Origin), pero puede explicar que un sitio ajeno recibiría **403** por la comprobación de `Origin`.

## 3. Qué decir en cada criterio del tablero

| Criterio | Qué muestra |
|---|---|
| Arquitectura de infraestructura | Monolito: un solo `npm run dev` sirve interfaz y API. Firebase es externo. |
| Arquitectura del repositorio | Abrir `app/api/salas/[id]/estado/route.ts` (solo HTTP) → `src/services/votos.ts` (regla) → `src/repositories/salas.repo.ts` (fachada). |
| Seguridad en el uso de IA | `CLAUDE.md`, `.claude/settings.json`, `BITACORA_IA.md` y `ia/README.md` con capturas. |
| Carpetas | `docs/EXPLICACION_CARPETAS.md` |

**Pregunta probable:** «¿Por qué hay dos repositorios (`salas.firestore.ts` y `salas.memoria.ts`)?»
Respuesta: porque los handlers dependen de una **fachada** (`salas.repo.ts`); cambiar de base de datos solo toca la capa de repositorios. Es la prueba de que las capas funcionan.

## 4. Si algo falla (errores probables, sin haberlo ejecutado todavía)

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| `Cannot find module @/...` | Alias sin configurar | `tsconfig.json` → `"paths": {"@/*": ["./src/*"]}` y reiniciar `npm run dev` |
| `npm run lint` falla con `next lint` | Next 16 lo eliminó | Script `"lint": "eslint"` |
| Lint: «setState in effect» | Regla nueva de react-hooks | Es advertencia de estilo; no impide `npm run dev` ni `build` |
| `/salas` redirige siempre a `/login` | Falta la cookie | Entre por `/login`; en demo la cookie se llama `sesion` |
| 404 en `/api/auth/demo` | `MODO_DEMO` no está o no reinició | Crear `.env.local` y **reiniciar** `npm run dev` |
| Las pruebas de componente dejan DOM de la anterior | Falta `tests/setup.ts` (limpieza) | Verificar `setupFiles` en `vitest.config.ts` |
| Pantalla en blanco / bloqueo de scripts en dev | CSP muy estricta | Revisar `next.config.ts` (en dev permite `unsafe-eval`) |
| `429` durante la demo | Más de 120 escrituras por minuto desde la misma IP | Esperar un minuto, o subir el límite en `src/lib/http.ts` |
| Se pierden las salas | Memoria se borra al reiniciar el servidor | Normal en modo demo; cree la sala de nuevo |
| Error de tipos en `route.ts` | Firma de handler | Mostrar el mensaje exacto y se corrige |
| `useReducer`/hook en componente de servidor | Falta `"use client"` | Primera línea del archivo |

## 5. Lista de última hora
- [ ] `npm run dev` abre `/demo` sin errores
- [ ] Flujo de dos navegadores probado **una vez completo**
- [ ] `npm test` ejecutado (anote cuántas pasan)
- [ ] `git log` muestra commits propios; `.env.local` NO está en Git
- [ ] Bitácora de IA y capturas de `ia/` listas
- [ ] Sé explicar qué hace cada archivo que voy a abrir

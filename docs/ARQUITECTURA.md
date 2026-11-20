# Arquitectura (para el criterio 1 y 2 de la sustentación)

## Nivel infraestructura: MONOLITO
Una sola aplicación Next.js se despliega como una unidad en Vercel: contiene la interfaz y la API (`app/api/**`).
Firebase (Auth + Firestore) es un servicio externo administrado; mi código no lo "parte" en microservicios.

**Por qué monolito y no servicios/clean/monolito modular:**
- El dominio es pequeño (salas, votos, retro) y el proyecto es "atómico".
- Un solo despliegue, una sola URL, mismo origen → no hay CORS ni cookies entre dominios.
- Menos piezas = menos superficie de ataque y menos cosas que explicar y mantener.

**Qué haría si creciera:** separar en módulos (poker / retro / auth) dentro del mismo repo (monolito modular) antes de pensar en servicios.

## Nivel repositorio: CAPAS
```text
Navegador ──fetch──▶ Route Handler ──▶ Servicio ──▶ Repositorio ──▶ Firestore (Admin SDK)
 (UI)               app/api/**/route.ts   src/services    src/repositories
                    HTTP + Zod            reglas puras    único que toca Firestore
```
| Capa | Responsabilidad | Ejemplo en el repo |
|---|---|---|
| Route Handler | Leer la petición, validar con Zod, verificar sesión, responder | `app/api/salas/[id]/estado/route.ts` |
| Servicio | Reglas de negocio puras (sin HTTP ni Firebase) | `src/services/estadisticas.ts`, `votos.ts` |
| Repositorio | Hablar con Firestore | `src/repositories/salas.repo.ts` |
| Esquemas | Reglas de validación compartidas cliente/servidor | `src/schemas/index.ts` |
| Lib | Firebase, auth, errores, envoltorio `manejar()` | `src/lib/*` |

**Beneficio de las capas:** puedo probar la lógica sin Firebase y cambiar la base de datos tocando solo `repositories/`.

## Seguridad de la arquitectura
1. El navegador NUNCA habla con Firestore → reglas `allow read, write: if false`.
2. Cookie de sesión `HttpOnly + Secure + SameSite=Lax` (JavaScript no puede robarla).
3. `proxy.ts` solo redirige; **la seguridad real se repite en cada Route Handler** (`requerirUsuario`).
4. Votos ocultos: el servidor filtra (`prepararVotosParaCliente`); no confío en que el cliente "los esconda".
5. Solo el facilitador revela → 403 en el servidor, no solo botón deshabilitado en la interfaz.
6. Secretos solo en variables de servidor; `NEXT_PUBLIC_*` es público.

## Defensas en el envoltorio común (`src/lib/http.ts`)
Todos los Route Handlers pasan por `manejar()`, que en métodos que escriben (POST/PUT/DELETE):
1. comprueba `Origin` (si viene, debe ser el mismo sitio → si no, 403),
2. aplica un límite de frecuencia por IP (120/min en general, 10/min en `/api/auth`) → 429 con `Retry-After`,
3. traduce errores a `{ error, detalles? }` sin filtrar información interna.

`next.config.ts` añade cabeceras (`Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`).

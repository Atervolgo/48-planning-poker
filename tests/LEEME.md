# Pruebas (sección 11)

| Carpeta | Qué prueba | Estado |
|---|---|---|
| `services/` | Reglas puras: estadísticas, votos ocultos, retro, código | ✅ escritas |
| `api/` | Route Handlers con sesión y repositorio simulados (401, 400, 403, 404, 409, votos ocultos) | ✅ escritas |
| `components/` | MesaCartas por rol y etiqueta (carga, vacío, error, aria-pressed, revelar) | ✅ escritas |

Pendiente: pruebas de `unirse` (sala llena → 409), `retro` y de `RetroBoard`/`Salas`; prueba de integración ruta → servicio → repositorio simulado.
Ejecutar: `npm test`

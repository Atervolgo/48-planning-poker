# Pruebas (sección 11)

| Carpeta | Qué prueba |
|---|---|
| `services/` | Reglas puras: estadísticas, votos ocultos, retro, código, repositorio en memoria |
| `api/` | Route Handlers con sesión y repositorio simulados: 401, 400, 403, 404, 409, 429, Origin, votos ocultos, consenso, exportar |
| `api/integracion.test.ts` | **Integración:** ruta → servicio → repositorio (en memoria) en un flujo completo y con los 3 criterios de aceptación |
| `components/` | `MesaCartas`, `RetroBoard`, `Salas` por rol y etiqueta (no por clases CSS) |

Ejecutar: `npm test`

Estado: escritas, **sin ejecutar todavía** (falta `npm install`). Si alguna falla, el mensaje dirá cuál; corregir la prueba o el código según cuál esté mal.

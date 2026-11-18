# Seguridad en el uso de IA (criterio 3)

## Qué configuré
| Riesgo | Control | Dónde |
|---|---|---|
| La IA lee mis claves | Lectura de `.env*`, `*.pem`, `serviceAccount*.json` denegada | `.claude/settings.json` |
| La IA sale de la carpeta | `Read(../**)` denegado | `.claude/settings.json` |
| La IA hace cosas externas sin que yo lo sepa | `git push`, `vercel` piden permiso | `.claude/settings.json` |
| La IA improvisa la arquitectura | Reglas de estructura, stack y prohibiciones | `CLAUDE.md` |
| Código de la IA con errores | Pruebas (Vitest) y ESLint corren sobre todo el código | `npm test`, `npm run lint` |
| Secretos en Git | `.env*` en `.gitignore`; solo `.env.example` | `.gitignore` |

## Hábitos
- No pego claves, tokens ni `FIREBASE_PRIVATE_KEY` en ningún prompt.
- Leo y entiendo cada archivo generado antes de aceptarlo; si no lo entiendo, no lo uso.
- Todo uso importante queda en `BITACORA_IA.md` (propósito, evidencia, validación, decisión).
- Si la IA propone algo inseguro (p. ej. `dangerouslySetInnerHTML`, Firestore desde el navegador) lo rechazo.

## Evidencias
Capturas y pruebas en `ia/` (ver `ia/README.md`). Deben poder demostrarse en vivo.

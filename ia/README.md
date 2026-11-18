# Evidencias de la configuración de IA (sección 15)

Aquí van las pruebas de que las restricciones funcionan. Por completar:

| Restricción | Configurada en | Evidencia (captura / prueba) | Estado |
|---|---|---|---|
| La IA no lee `.env*` ni claves | `.claude/settings.json` (deny) | captura pidiéndole leer `.env.local` y siendo bloqueada | ☐ |
| La IA no sale de la carpeta | `.claude/settings.json` (`Read(../**)`) | captura intentando leer `../otra-carpeta` | ☐ |
| Acciones externas piden permiso | `.claude/settings.json` (ask) | captura de `git push` pidiendo confirmación | ☐ |
| Calidad automática del código | ESLint + Vitest en `npm run lint` / `npm test` | salida de consola | ☐ |
| Reglas del proyecto | `CLAUDE.md` | respuesta de la IA citando las reglas | ☐ |

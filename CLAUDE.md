# Reglas del proyecto para la IA (Proyecto 48 · Planning Poker y Retrospectivas)

## Stack
Next.js 16 (App Router) · React · TypeScript · Tailwind · Zod · Firebase Auth (cliente) + Firebase Admin (solo servidor) · Vitest.

## Comandos
- `npm run dev` · `npm run test` · `npm run lint` · `npm run build`

## Estructura (respetarla)
- `app/api/**/route.ts` → solo HTTP: lee la petición, valida con Zod, llama al servicio. NO toca Firestore.
- `src/services/` → reglas de negocio puras (sin Firebase, sin HTTP). Fáciles de testear.
- `src/repositories/` → ÚNICO lugar que usa Firestore (Admin SDK).
- `src/schemas/` → esquemas Zod compartidos por cliente y servidor.
- `src/lib/` → firebase, auth, errores, helpers HTTP.

## Lo que SÍ
- Componentes de servidor por defecto; `"use client"` solo con estado/eventos.
- HTML semántico, `aria-live` para cambios de fase, todo operable con teclado.
- El `uid` sale SIEMPRE de la sesión verificada, nunca del cuerpo ni de la URL.
- Escribir o actualizar una prueba por cada regla de negocio que se cambie.

## Lo que NO
- No importar `firebase/firestore` en el navegador.
- No leer ni mostrar `.env*`, claves privadas ni credenciales.
- No salir de la carpeta del proyecto. No ejecutar comandos con efecto externo (deploy, push) sin pedir permiso.
- No usar `<div onClick>`, `dangerouslySetInnerHTML` sin sanear, ni `NEXT_PUBLIC_*` para secretos.
- No agregar funciones extra antes de cumplir todos los RF y criterios de aceptación.

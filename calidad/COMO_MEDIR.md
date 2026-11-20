# Cómo obtener las evidencias de calidad (sección 14)

Guarde cada captura o archivo en esta carpeta con la fecha. Mida **la versión desplegada** (o `npm run build && npm start`), no `npm run dev`.

## 1. Lighthouse (rendimiento, accesibilidad, buenas prácticas, SEO)
1. Chrome → DevTools (F12) → pestaña **Lighthouse** → modo **Móvil** → Analizar.
2. Hágalo en `/demo`, `/login` y `/salas`. Guarde captura del informe **antes** y **después** de optimizar.
3. Metas: Rendimiento ≥ 90, Accesibilidad ≥ 95, Buenas prácticas ≥ 95, SEO ≥ 95; LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1.

## 2. Responsive (360 · 768 · 1024 px)
DevTools → modo dispositivo → ancho 360, 768 y 1024. Capture cada ancho y compruebe **que no hay barra de desplazamiento horizontal**. Repita con zoom al 200 %.

## 3. Accesibilidad
- Extensión **axe DevTools** → «Scan all of my page» → guardar el informe sin errores críticos.
- **Teclado:** recorrer `/demo` solo con Tab, Enter y las teclas 1 a 9. El foco debe verse siempre.
- **Lector de pantalla:** NVDA (Windows) o VoiceOver; verificar que «Fase: revelada…» se anuncia.
- Contraste: pestaña Accesibilidad de DevTools o el verificador de contraste de axe.

## 4. HTML válido
Pegue el HTML renderizado en https://validator.w3.org/nu/ y guarde el resultado.

## 5. Seguridad
- `npm audit` → guardar la salida y corregir lo crítico.
- Comprobar que `.env.local` no está en Git: `git log --all -- .env.local` no debe mostrar nada.
- En DevTools → Red → una respuesta → cabeceras: deben verse `Content-Security-Policy` y `X-Content-Type-Options`.

## 6. Retos de excelencia (elija al menos 3)
☐ ______  ☐ ______  ☐ ______

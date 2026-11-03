# Para `docs/asistente/herramientas.md` del Asistente

Lo nuevo del cotizador (2026-10-16 al 2026-10-19) que sirve en otros proyectos. Cada bloque dice en qué sección va. Origen de cada viñeta: [`aprendizajes.md`](../aprendizajes.md) de este repo, entre paréntesis. Al aplicarlo, cambiar el «Actualizado» de `herramientas.md`.

---

## §7. Navegador: una viñeta en §7.5 «Otros»

```text
- **Diagramas más anchos que el panel** (cotizador, 2026-10-16): el panel del navegador mide unos 675 px y un diagrama de `/diagram-design` con ancho mínimo de 960 se ve cortado, con su propio desplazamiento. Para revisarlo: `resize_window` a 1280 × 900, captura y de vuelta a «desktop». (G3)
```

## §8.5 Productos en su propio repo: la viñeta «Rutas al asistente»

Hoy termina con:

```text
Al 2026-10-19, el `CLAUDE.md` del cotizador todavía escribe las rutas completas de un equipo.
```

Queda:

```text
~~Al 2026-10-19, el `CLAUDE.md` del cotizador todavía escribe las rutas completas de un equipo.~~ Desde el 2026-10-19 escribe `<ASISTENTE>`, igual que la app de envío.
```

## §10. Python y scripts: una viñeta nueva

```text
- **Heredoc con rutas de Windows** (cotizador, 2026-10-19): un script pasado con `python - <<'PY'` desde Bash falló con `unicodeescape` porque el texto traía `C:\Users\...` (`\U` es un escape de Python), y el heredoc también estropea los acentos. Escribir el script con la herramienta de archivos y correrlo por su ruta, o editar con Edit. (T4)
```

## §11.4 Hosting estático: tres viñetas nuevas

```text
- **Un sitio estático en Vercel publica todo el repo** (cotizador, comprobado el 2026-10-16): sin paso de compilación, cualquiera abría `/docs/AUDITORIA.md`, `/MEJORAS.md` y `/CHANGELOG.md` en la dirección de la app. Se arregla con un `.vercelignore` en modo de lista permitida: `/*` en la primera línea y después `!index.html`, `!js`, `!css`, etc. ([documentación de Vercel](https://vercel.com/docs/deployments/vercel-ignore)). Después de publicar, comprobar con `curl -o /dev/null -w '%{http_code}'` que esas direcciones den 404. (W1)
- **El plan Hobby de Vercel es solo para uso personal no comercial** ([sus reglas de uso justo](https://vercel.com/docs/limits/fair-use-guidelines), 2026-10-16): cuenta como comercial cualquier proyecto que deje ganancia a quien participe en él. Un producto necesita Vercel Pro (unos 20 USD al mes por persona) o Firebase Hosting, gratis hasta 10 GB de transferencia al mes. Conviene revisar en qué plan están teckio.mx y ventas.teckio.mx. (W2)
- **Firebase Auth en la web** (cotizador, 2026-10-16): entrar con Google por redirección deja de funcionar en navegadores que bloquean el almacenamiento de terceros (Chrome, Firefox y Safari desde 2024), salvo que la app esté en Firebase Hosting con su propio dominio. Con otro hosting, usar ventana emergente ([guía de Firebase](https://firebase.google.com/docs/auth/web/redirect-best-practices)). (W6)
```

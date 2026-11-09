# Cotizador 3D (Calc3D)

Qué es el cotizador de impresión 3D, dónde vive cada cosa, qué decidió Francisco y qué sigue. Las decisiones nuevas viven en el repo del cotizador; este README es el índice.

**Actualizado:** 2026-11-09

**Fuentes:** la app publicada y su código (revisados el 2026-10-15) · repo `frvnciscx/Calculadora3D`: `docs/reglas-de-negocio.md` (D1–D107), `docs/flujos.md`, `docs/modelo-de-datos.md`, `docs/competencia.md`, `docs/aprendizajes.md` y `CHANGELOG.md` (caché `calc3d-v101`), al 2026-11-03 · preparado desde la sesión del producto, en `docs/para-el-asistente/` de su repo · versión anterior: 2026-10-16.

> **No es Teckio.** Es un producto aparte: las reglas 1–5 de [`CLAUDE.md`](../../../CLAUDE.md), `DESIGN.md` e `INSTRUCTIONS.md` no aplican. Sus diagramas usan el estilo neutro de `/diagram-design`.

---

## 1. Qué es

- **Calculadora de costos y cotizador de impresión 3D** del negocio de Francisco, «La Casita del Molde» (Estudio 3D). Calcula el costo real de una pieza (material, energía, depreciación, gastos fijos e indirectos, mantenimiento, desperdicio, post-procesado y diseño), con impresoras FDM y de resina, multicolor AMS y piezas por placa; arma órdenes de varias partidas y las convierte en cotizaciones (PDF, imagen, WhatsApp, QR); lleva clientes, catálogo, inventario de rollos e impresoras.
- **Hoy:** una sola página HTML con JavaScript sin framework, publicada en Vercel. Desde v105 (2026-11-06) hay cuentas y datos en Firebase, con copia en el dispositivo; la conexión la hizo Javi Gama, que colabora en el código. v106 (2026-11-09) corrigió que entrar con cuenta borraba los datos del dispositivo (así se perdieron los de La Casita del Molde, que no se recuperan: D107) y que la app no abría sin conexión.
- **Hacia dónde va** (decisiones del 2026-10-16 al 2026-11-03 en su repo):
  - Producto para otros talleres de impresión 3D en México, publicado primero en Google Play y después en la App Store, con prueba cerrada antes (D34, D38, D43).
  - Nombre provisional «Placa 3D» (D56). ~~«Quotia»~~ se descartó porque ya existe un QUOTIA en español (D54).
  - Firebase para cuentas y datos; Notion sale del proyecto (D33). La versión web sigue, en Firebase Hosting (D49, D55).
  - Gratis al lanzar; los planes, cuando el desarrollo esté terminado (D42).

---

## 2. Dónde vive cada cosa

| Qué | Dónde | Detalle |
|---|---|---|
| App publicada | `calculadora3-d-delta.vercel.app` | Con guion. `calculadora3d-delta` (sin guion) es **otro producto** («3D COST PRO»). El README del repo se corrigió el 2026-11-03 |
| Código | Repo privado `frvnciscx/Calculadora3D`, rama `main` | Las sesiones trabajan en su worktree (`claude/<nombre>`). Francisco hace el commit y publica la rama con GitHub Desktop, y la junta a `main` con un Pull Request en GitHub |
| Proyecto de Claude Code | Una carpeta por equipo, anotada en su `~/.claude/CLAUDE.md` («Repo del cotizador en este equipo») | Su `CLAUDE.md` escribe `<ASISTENTE>` en lugar de la ruta de este repo desde el 2026-10-19 |
| Decisiones | `docs/reglas-de-negocio.md` §2 de su repo | Único registro (D1–D107 al 2026-11-09), también de las que salen de `flujos.md` y `competencia.md`. Con fecha y quién la tomó; nada se borra |
| Flujos | `docs/flujos.md` y `docs/flujos/` de su repo | Los 7 de la primera versión, con diagramas de `/diagram-design` y sus preguntas respondidas al 2026-11-03 |
| Modelo de datos | `docs/modelo-de-datos.md` de su repo | Firebase por negocio, con diagrama, al 2026-11-03. Reemplaza en parte a `BASE-DE-DATOS.md` |
| Competencia | `docs/competencia.md` de su repo | 12 apps y plataformas revisadas el 2026-10-16; la directa en México es Bugeo App |
| Estado anterior documentado | `docs/` de su repo (2026-10-05) | `BASE-DE-DATOS.md`, `MAPA-DE-SITIO.md`, `AUDITORIA.md`, `AUDITORIA-UX.md`, `ANDROID.md` y dos diagramas SVG |
| Lo aprendido | `docs/aprendizajes.md` de su repo | Lo que sirve en otros proyectos se prepara en `docs/para-el-asistente/` |
| Notion | ~~Página «Ventas»~~ | Sale del proyecto (D33, 2026-10-16). La sincronización con «App State — Calc3D» se quitó en v101 (D71); el botón que manda ventas aceptadas sigue hasta la migración |

> **No capturar datos de prueba en la app publicada sin su permiso.** ~~Ajustes › «Sincronizar» sube el estado completo a Notion.~~ Desde v101 ya no existe; ~~v101 llega a la app publicada cuando se junta a `main`~~ v101 está publicado desde el 2026-11-03.

---

## 3. Decisiones

Las del arranque, del 2026-10-15 y 2026-10-16. Desde el 2026-10-16 las decisiones se registran en `docs/reglas-de-negocio.md` del repo del cotizador.

| Decisión | Quién | Fecha |
|---|---|---|
| Producto aparte de Teckio; diagramas con el estilo neutro de `/diagram-design` | Francisco | 2026-10-15 |
| Firebase (Firestore) para empezar; algo más robusto si el proyecto crece | Francisco | 2026-10-15 |
| Ciclo de vida de la cotización: borrador → enviada → aceptada o rechazada → en producción → entregada | Francisco («si») | 2026-10-15 |
| Entran al proyecto: anticipos, fecha de entrega, IVA y datos fiscales, comisiones de marketplace y empaque por pieza | Francisco | 2026-10-15 |
| ~~La planeación se trabaja en su propia carpeta de este repo~~ Reemplazada el 2026-10-16 por la siguiente | Francisco | 2026-10-15 |
| La planeación vive en `docs/` de su repo, que tiene su propio proyecto de Claude Code | Francisco («si, tiene su propio repositorio») | 2026-10-16 |
| ~~La sincronización con Notion queda pendiente: debía conectarse con lo que ya lleva en «Ventas» y creó una base aparte~~ Reemplazada el 2026-10-16 por D33 del repo del cotizador: Notion sale del proyecto | Francisco | 2026-10-15 |

---

## 4. Lo que sigue

1. ~~**`reglas-de-negocio.md`**~~ Cerrado el 2026-10-16; siguen sumándose decisiones desde los flujos.
2. ~~**`flujos.md`:** los 7 flujos están hechos; faltan P86 y P87, del arranque de un negocio nuevo.~~ Cerrado el 2026-11-03 con D87 y D88.
3. ~~**`base-de-datos.md`:** el modelo organizado por negocio (D46), completo aunque la primera versión no use todo, y al día con v100.~~ Hecho el 2026-11-03 como `modelo-de-datos.md`; sus preguntas se respondieron el mismo día (D89–D98).
4. **Borrador del aviso de privacidad** (D51), antes de subir la app a Google Play.
5. ~~**Juntar v101 a `main`:** quita la sincronización sin contraseña y deja de publicar los documentos del repo (D70, D71). La rama está en GitHub desde el 2026-11-03; falta el Pull Request.~~ Hecho el 2026-11-03 (Pull Request #1) y comprobado: los documentos y `/api/sync/` responden 404.
6. **Reglas de seguridad de Firestore:** desde el 2026-11-09 están en `firestore.rules` del repo, con una guía para Javi en `docs/firebase.md` (D108); falta que él las revise y publique, y es urgente: el 2026-11-09 las reglas de la consola dejaban leer a cualquiera. La misma guía trae lo que falta de la integración. Los registros que se borraban con v106 (cotizaciones, clientes y ajustes) se corrigieron en v107.

---

## 5. Cómo se trabaja

- **En su proyecto,** con un `CLAUDE.md` en su repo que apunta a este README, a la forma de trabajo y a los skills del asistente (`diagram-design`, `crd`, `system-design` y `plan`), que se leen desde `<ASISTENTE>` ([herramientas.md §8.5](../../asistente/herramientas.md#85-productos-en-su-propio-repo)). Este README cambia solo si cambia dónde vive algo.
- **Con el método de Teckio:** preguntas en bloques de 10 con lo recomendado; cada decisión con fecha y quién la tomó; nada se borra; lo que una respuesta no deja claro, como «Interpretación:». Si se rediseña la interfaz, el sistema arranca con `/system-design` y su [punto de partida](../../../.agents/skills/system-design/punto-de-partida.md), y cada componente con `/crd`.
- **Forma de trabajo con Francisco:** [docs/asistente/](../../asistente/README.md).

# PROGRESS — Actualización Frontend Sana (fe-update)

Última actualización: 2026-09-11 · Branch: `develop` · Sincronizado con `origin` ✓

## Estado global: Plan completo ✅ (PR1–PR4, todos pusheados)

El plan `DOCS/PLANS/p1-mvp/fe-update.md` (aprobado por el usuario) está 100 % implementado:
CRA → Vite 6 + TypeScript incremental + PWA + antd 5 + TanStack Query/Zustand + rebrand + KPIs reales.

| PR | Fase | Contenido | Commit |
|----|------|-----------|--------|
| PR1 | A | Venta funcional (FE+backend), `GET /sales/dashboard`, dead code, bugs UI | `47043ec` |
| PR2 | B | TanStack Query + Zustand (reemplaza context/reducer/actions) | `1a991e4` |
| PR3 | C | antd 4→5, ConfigProvider #0F766E, rebrand Sana, login seguro, KPIs reales | `c8e2ffd` |
| PR4 | D | Vite 6 + TS incremental + PWA (`vite-plugin-pwa`), íconos, CI/Dockerfile | `0638a54` |

Docs de estado del plan: `6231df8`, `52bef90`, `aa84ddd` + actualización Fase D en `0638a54`.

## Lo que se verificó en PR4
- `pnpm -C apps/web test` → 1/1 pasa (Vitest, `modalContainer.test.jsx`).
- `pnpm -C apps/web build` → OK; PWA genera `dist/sw.js` + `manifest.webmanifest` (14 entries precache).
- Dev server Vite: transforma `.jsx` y `.ts`, proxy `/api → :9000` configurado.
- Íconos 192/512: generador Node propio (44 % cobertura de la "S"); `sips` no rasteriza SVG de forma fiable.
- Backend (Go) no se tocó en PR3/PR4.

## Cambios clave de arquitectura (gotchas)
- **JSX solo en `.jsx`**: Vite 6 no parsea JSX en `.js` (CRA sí). 30 archivos renombrados; importar extensionless o `.jsx`.
- **`vitest.config.js` tiene prioridad** sobre `vite.config.js` (config de test independiente).
- **`vite-plugin-pwa`** requiere peers `workbox-build`/`workbox-window` ^7 (declarados como devDeps).
- Env: `VITE_API_URL` (bundle prod via Dockerfile ARG; relativo `/api` en dev). `config.js` usa `import.meta.env`.
- PWA: `registerSW({immediate: true})` bajo `import.meta.env.PROD` en `src/index.jsx`.

## Pendiente (para siguiente sesión)
- **Smoke manual E2E** con backend (Docker apagado el 2026-09-11): login → venta → inventario → logout → logout con cookie refresh. Verificar que CI web pase en GitHub (test + build).
- Opcional: chunk splitting del bundle JS (1.9 MB min; warning de Vite + eval en `lottie-web`).
- PR4 `type` duplicado en `confirmSale.jsx` (warning no fatal en build).
- Componentes creados antes de la migración están en JS; convertirlos a TS cuando se toquen (política incremental acordada).

## Convenciones vigentes
- Colecciones prefix `sn*`; modelos con `NewX()` + bson tags; passwords bcrypt; JWT secrets de env.
- Transacciones (`WithTransaction`) obligatorias en escrituras de dinero/stock desde Fase 3.
- Access token en memoria; refresh solo en cookie HttpOnly; nunca token en localStorage.
- Comandos FE: `pnpm -C apps/web dev|test|build`; Go desde raíz del workspace.
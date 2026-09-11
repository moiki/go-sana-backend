# Plan: Actualización del Frontend Sana

**Estado:** Aprobado por el usuario el 2026-09-11.
**Siglas:** PR1 = Fase A (bugs + venta + dead code + endpoints), PR2 = Fase B (TanStack Query + Zustand), PR3 = Fase C (antd 5 + rebrand + KPIs), PR4 = Fase D (Vite + PWA).

## Decisiones fijadas por el usuario
- Mantener antd, subir de v4 a v5 (rebranding vía `ConfigProvider` tokens).
- TypeScript incremental (los archivos que se tocan se convierten a TS).
- Vite + PWA entran en esta ronda (Fase D).
- Dashboard con KPIs reales (ventas de hoy, tickets, últimas ventas).
- Fuera de alcance: descuento de stock en venta (Fase 3, `WithTransaction`), Tailwind/shadcn, reportes completos.

## Contexto técnico verificado
- Contrato de venta ya existe: `POST /sales/create` (JWT) en `apps/api/internal/http/sales.routes.go:26`.
  Body = `Sale{details[]: {product_id, inner_quantity, sub_total, discount_type, discount}, client_name, paid_with, change, discount_type, discount, commentary}`.
  El backend **no aplica descuento**: suma `sub_total` crudo (`sales.services.go:22`) y asigna `invoice_number` (último +1).
  El FE debe enviar `sub_total` ya descontado.
- `snSales` indexa `invoice_number` único → secuencial garantizado.
- El modelo `Product` NO tiene stock: el endpoint `low-stock` queda fuera (no existe concepto de inventario en el dominio).
- `moment` solo se usa en `LaboratoriesPanel.js` → swap a `dayjs` en Fase C.

## Fase A — Correcciones base + limpieza
1. Venta funcional (FE + backend):
   - `ConfirmSale` con `callback` → envía `POST /sales/create`.
   - `sub_total` = (precio × cantidad) − descuento aplicado.
   - Éxito → `notification`, reset de carrito/body.
   - Fix descuento (`createSale.js:216`): `onChange` recibe número; selector `%`/monto; recalcular `Amount`.
   - Fix crash `handlePriceTypeOnList` (`createSale.js:48`): guard de `prices`.
2. UI bugs: paginación de productos, logout → limpiar token, link muerto `/sign-up`, tab `INENTARIO`.
3. Backend: `GET /sales/dashboard` (ventas de hoy: total + tickets + últimas 10).
4. Dead code removal (navbars, sidenav legacy, login viejo, `CustomAxiosPromise`, etc.).

## Fase B — TanStack Query + Zustand
1. `useAuthStore` (Zustand) reemplaza context/reducer/actions.
2. `QueryClientProvider` + capa de datos sobre el axios de `rest.js` (interceptor cookie-refresh intacto).
3. Queries: `['products-table', params]`, labs, providers, `['collections']`, `me`.
4. Mutaciones: login, logout, create product/lab/presentation/provider, create sale; invalidación por query key.
5. TS incremental diferido a Fase D (var 2026-09-11: PR2 en JS para mantenerla revisable; conversión de archivos tocados en Vite).

## Fase C — Rebranding + antd 5
1. antd 4 → 5: quitar `antd/dist/antd.css`, `ConfigProvider` con `colorPrimary #0F766E`, tipografía Inter, `radius`.
   v5 cambios: `Modal visible→open`, `Switch`, `Checkbox`, `Input.Group` deprecated. `moment→dayjs`.
2. Brand: logo/favicon/title "Sana", quitar logo React e imagen de fondo 1.7 MB, microcopy español.
3. Login rediseñado: errores reales del server.
4. Dashboard KPIs reales consumiendo `GET /sales/dashboard`.

## Fase D — Vite + TypeScript + PWA
1. CRA → Vite 6: `@vitejs/plugin-react`, `index.html` raíz, proxy `/api→:9000`, `server.js` sirve `dist/`.
2. `VITE_API_URL` por modo; CI (swap script), Dockerfile web.
3. TS: tsconfig `allowJs`, archivos tocados → TS.
4. PWA: `vite-plugin-pwa`, manifest Sana, íconos 192/512, `autoUpdate`, precache shell → offline a login.

## Verificación
`go build ./apps/api/...`, `go vet ./apps/api/...`, `pnpm -C apps/web build`, smoke manual (login → venta → inventario → logout), CI verde por PR.

## Estado
- [x] Fase A (PR1) — commit `47043ec`
- [x] Fase B (PR2) — commit `1a991e4`
- [x] Fase C (PR3) — commits pendientes
- [ ] Fase D (PR4)
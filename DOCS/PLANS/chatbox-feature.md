# Plan: Chatbox Agéntico como Microservicio del Monorepo (Sana)

## 0. Objetivo

Agregar un **microservicio nuevo** (`sana-agent`) dentro del mismo repositorio que
`sana-backend`, siguiendo un estilo tipo *monorepo NestJS* (`apps/` + `libs/`), pero
usando las herramientas nativas de Go para lograr el mismo efecto: **Go Workspaces**
(`go.work`). Este servicio expone un chatbox conversacional que el FE consume, y que
internamente usa un LLM con *tool-calling* contra un subconjunto curado de los
`services/` existentes de `sana-backend`.

No se reescribe `sana-backend`. Se extraen piezas compartidas a una librería interna
y se agrega un servicio nuevo al lado.

---

## 1. Por qué Go Workspaces en vez de "un monorepo a la NestJS" literal

NestJS logra el monorepo con un solo `nest-cli.json` y varios `apps/` que comparten
`libs/` vía path aliases de TypeScript. En Go el equivalente directo es:

- **`go.work`** en la raíz: une varios módulos Go (cada uno con su propio `go.mod`)
  en un mismo espacio de trabajo, sin publicarlos ni usar `replace` manuales.
- Cada "app" de NestJS = **un módulo Go independiente** con su propio `main.go`,
  su propio `go.mod`, y su propio ciclo de build/deploy.
- Cada "lib" de NestJS = **un módulo Go** dentro de `libs/`, importado por nombre
  de módulo normal (gracias a `go.work` no hace falta publicarlo en un registry).

Ventaja clave para este caso: `sana-backend` y `sana-agent` pueden tener **ciclos de
vida y de deploy distintos** (el agente probablemente necesita más memoria, más
timeout, y quizá escala distinto), pero comparten modelos, cliente de Mongo y JWT.

---

## 2. Estructura de carpetas propuesta

```
sana-monorepo/
├── go.work
├── go.work.sum
├── AGENTS.md                     # el que ya tienes, se actualiza (ver sección 8)
├── openspec/                     # ver sección 6
│   ├── project.md
│   ├── specs/
│   └── changes/
├── apps/
│   ├── sana-backend/             # el proyecto actual, movido tal cual
│   │   ├── go.mod                # module go-sana-blackend (se respeta el typo)
│   │   ├── routes/
│   │   ├── services/
│   │   ├── connections/
│   │   ├── models/
│   │   └── main.go
│   └── sana-agent/                # NUEVO microservicio
│       ├── go.mod                 # module go-sana-agent
│       ├── main.go                 # server Fiber en :9100 (por ejemplo)
│       ├── chat/
│       │   ├── handler.go          # POST /chat, GET /chat/stream (SSE)
│       │   ├── session.go          # historial de conversación por snChatSessions
│       │   └── orchestrator.go     # loop de tool-calling con el LLM
│       ├── tools/
│       │   ├── registry.go         # catálogo de tools disponibles + JSON schema
│       │   ├── read_tools.go       # ListProducts, ExpiringSoon, SalesSummary...
│       │   └── write_tools.go      # CreateOrder, AdjustStock... (con confirmación)
│       ├── audit/
│       │   └── logger.go           # snAgentAuditLog: quién, qué tool, qué params
│       └── middlewares/
│           └── forward_auth.go     # revalida el JWT emitido por sana-backend
└── libs/
    ├── sanacore/                   # extraído de sana-backend
    │   ├── go.mod                  # module go-sana-core
    │   ├── connections/             # cliente Mongo compartido (Connect, GetCollection)
    │   ├── models/                  # Product, User, Sale... (una sola fuente de verdad)
    │   └── utils/                   # EnvData, JWT, ParsePipeline, ModelValidation
    └── sanaclient/                  # cliente HTTP interno hacia sana-backend
        ├── go.mod                  # module go-sana-client
        └── client.go                # wrappers tipados: ListProducts(ctx, params)...
```

`go.work` en la raíz:

```go
go 1.18

use (
    ./apps/sana-backend
    ./apps/sana-agent
    ./libs/sanacore
    ./libs/sanaclient
)
```

Con esto, `sana-agent` importa `go-sana-core` y `go-sana-client` como si fueran
paquetes normales, sin `replace` ni publicar nada — igual que un `lib/` de Nest se
importa por alias dentro del mismo repo.

---

## 3. Cómo habla `sana-agent` con `sana-backend`

Dos opciones, y la recomendación es empezar por la primera:

### Opción A (recomendada para empezar): HTTP interno vía `sanaclient`
`sana-agent` NO importa `services/` de `sana-backend` directamente ni toca Mongo.
Llama a los endpoints reales de `sana-backend` (los mismos que usa el FE), propagando
el JWT del usuario que está chateando. Ventajas:
- Cero duplicación de lógica de negocio ni de permisos.
- El agente queda **acotado a lo que el usuario ya puede hacer** — si el JWT no
  tiene permiso para `snSales`, el agente tampoco puede leerlas.
- Más fácil de auditar: cada "tool call" es literalmente una petición HTTP normal
  que ya pasa por `middlewares.JWTProtected()`.

### Opción B (optimización futura): import directo de `services/` vía `sanacore`
Si la latencia HTTP interna se vuelve un problema, se extraen los `services/` que el
agente necesita a `libs/sanacore/services` y `sana-agent` los importa como función Go.
**No empezar por aquí** — añade acoplamiento fuerte y complica el aislamiento de
permisos que da la Opción A.

---

## 4. Diseño de las "tools" del agente

Cada tool que el LLM puede invocar se mapea 1:1 a una capacidad de `sanaclient`, y se
clasifica en dos niveles de riesgo:

| Tipo | Ejemplos | Comportamiento |
|---|---|---|
| **read** | `list_products`, `expiring_soon`, `sales_summary`, `low_stock_alert` | Se ejecuta directo, sin confirmación. |
| **write** | `create_purchase_order`, `adjust_stock`, `apply_discount` | El agente arma la propuesta y la devuelve como "acción pendiente"; el FE la muestra al usuario con botón Confirmar/Cancelar; solo al confirmar se llama al endpoint real. |

Reglas duras (van al `AGENTS.md` de `sana-agent`):
- Ninguna tool `write` se ejecuta sin un paso de confirmación explícito del usuario.
- Toda ejecución (propuesta y confirmada) se escribe en `snAgentAuditLog` con
  `userId`, `tool`, `params`, `status`, `timestamp`.
- El agente nunca usa un JWT distinto al del usuario que inició la conversación
  (nada de "service account con permisos elevados").
- Dado el dominio (farmacia), cualquier tool que toque venta de medicamentos
  controlados queda fuera del alcance inicial — se agrega explícitamente en una
  fase posterior, no por defecto.

---

## 5. Fases de implementación

**Fase 0 — Reestructurar a monorepo (sin tocar lógica)**
1. Mover `sana-backend` a `apps/sana-backend/` tal cual está.
2. Crear `go.work` en la raíz, verificar `go build ./...` desde la raíz.
3. Confirmar que `go run .` sigue funcionando igual dentro de `apps/sana-backend`.

**Fase 1 — Extraer `libs/sanacore`**
4. Mover `connections/`, `models/`, `utils/` a `libs/sanacore/` con su propio `go.mod`.
5. Actualizar imports en `sana-backend` para apuntar a `go-sana-core`.
6. `go build ./...` en todo el workspace, `gofmt -l .` limpio.

**Fase 2 — Especificación antes de código (ver sección 6)**
7. Definir en OpenSpec la primera capability: `agent-chat-readonly`.
8. Validar el spec con el equipo/usuario antes de generar una sola línea de `sana-agent`.

**Fase 3 — Esqueleto de `sana-agent`**
9. `apps/sana-agent` con Fiber, health check en `/health`, `.env.example` propio
   (reusa `MONGO_URI`/`MONGO_DB` si necesita leer `snAgentAuditLog` directo, y
   `JWT_SECRET` para validar tokens entrantes).
10. `libs/sanaclient` con 2-3 wrappers de solo lectura (`ListProducts`, `ExpiringSoon`).
11. Endpoint `POST /chat` sin LLM todavía: solo recibe mensaje, hace echo — valida
    el pipe FE → agente → backend end-to-end.

**Fase 4 — Integrar el LLM (solo tools de lectura)**
12. Loop de tool-calling en `orchestrator.go` (mensaje usuario → LLM decide tool →
    `sanaclient` ejecuta → resultado vuelve al LLM → respuesta final).
13. Streaming de la respuesta al FE vía SSE (`GET /chat/stream`).
14. Registrar cada tool-call en `snAgentAuditLog` desde el día uno, aunque solo
    sean lecturas.

**Fase 5 — Tools de escritura con confirmación**
15. Agregar 1 sola write-tool de bajo riesgo primero (ej. `create_purchase_order`
    en estado "draft", nunca "confirmada" directo).
16. FE implementa el patrón "acción pendiente → confirmar/cancelar".
17. Solo tras validar ese flujo end-to-end, evaluar agregar más write-tools.

**Fase 6 — Endurecer**
18. Rate limiting en `/chat` (evitar que un usuario dispare cientos de llamadas al LLM).
19. Tests — este es el momento de introducir el framework de tests que hoy no
    existe en `sana-backend`; empezar por `sana-agent/tools` porque ahí vive el
    riesgo nuevo. **No asumir un framework sin preguntar al usuario, tal como ya
    indica el `AGENTS.md` actual.**
20. Revisión de seguridad dedicada (mismo espíritu que la skill
    `sana-auth-security`, pero para JWT forwarding y audit log).

---

## 6. SDD / OpenSpec — cómo trabajar esto con `opencode`

### Qué es y por qué aquí
- **SDD (Spec-Driven Development)**: primero se escribe/valida la especificación
  del comportamiento deseado, y el código se genera/revisa contra esa especificación,
  no al revés. Reduce el riesgo de que un agente de código "invente" alcance no
  acordado — muy relevante dado que este proyecto toca inventario y ventas reales.
- **OpenSpec**: formaliza esto con una carpeta `openspec/` versionada en el repo:
  `specs/` (comportamiento actual acordado, por capability) y `changes/` (propuestas
  de cambio, cada una con su propio spec delta, hasta que se aprueba y se "archiva"
  fusionándose al spec base).

### Cómo se integra en este plan
1. Crear `openspec/project.md` con el contexto del proyecto (stack, convenciones del
   `AGENTS.md`, límites de riesgo — ej. "ninguna write-tool sin confirmación").
2. Antes de la Fase 3, crear una `change` en `openspec/changes/agent-chat-readonly/`
   con:
    - `proposal.md` — qué se va a construir y por qué.
    - `spec-delta.md` — comportamiento esperado de `/chat`, de las tools de lectura,
      y del audit log, en términos verificables ("dado X, el sistema debe Y").
    - `tasks.md` — desglose en tareas ejecutables (esto es lo que `opencode` va a
      tomar como plan de trabajo).
3. Indicar explícitamente a `opencode` que trabaje en modo SDD: primero generar/
   revisar el `spec-delta.md` de una capability, esperar aprobación humana, y solo
   entonces implementar las `tasks.md` de esa capability — nunca saltar directo a
   código sin spec aprobado.
4. Cada fase nueva de la sección 5 (tools de escritura, rate limiting, etc.) nace
   como una nueva `change` en OpenSpec, no como edición libre del código.
5. Al terminar y validar una `change`, se archiva: su `spec-delta.md` se fusiona al
   `specs/agent-chat/spec.md` base, que queda como la fuente de verdad viva del
   comportamiento del microservicio — el equivalente a `AGENTS.md` pero para "qué
   hace el sistema" en vez de "cómo está armado el código".

### Instrucción concreta para `opencode` (agregar a su prompt/skill)
> Trabaja este proyecto en modo Spec-Driven Development usando la carpeta
> `openspec/`. Antes de escribir o modificar código en `apps/sana-agent`, verifica
> si existe un `spec-delta.md` aprobado en `openspec/changes/` para el cambio
> solicitado. Si no existe, redáctalo primero (proposal + spec-delta + tasks) y
> espera confirmación antes de generar código. Nunca implementes una write-tool
> que no esté explícitamente descrita y aprobada en un spec.

---

## 7. Riesgos específicos de este dominio a no perder de vista

- **Alucinación de tools**: el LLM podría "inventar" parámetros o intentar llamar
  una tool con datos incompletos — el `tools/registry.go` debe validar contra JSON
  Schema estricto antes de tocar `sanaclient`, igual que ya haces con
  `utils.ModelValidation` en `sana-backend`.
- **Fuga de datos vía el chat**: el `GET /me` de `sana-backend` ya te enseñó que un
  campo sin `json:"-"` se filtra; lo mismo aplica a lo que el LLM ve como resultado
  de una tool — nunca pasar el struct crudo de Mongo al prompt, siempre un DTO
  explícito.
- **Costo/latencia del LLM**: cachear resultados de tools de lectura de corta
  vigencia (ej. `expiring_soon`) para no re-consultar Mongo en cada mensaje.
- **Medicamentos controlados**: cualquier tool relacionada con venta de sustancias
  reguladas queda fuera de alcance hasta tener una revisión legal/compliance aparte
  — no asumir que "es solo una consulta" es inofensivo en este dominio.

---

## 8. Actualizaciones al `AGENTS.md` raíz

Agregar una fila nueva a la tabla de skills y una sección de arquitectura de
monorepo:

```markdown
## Monorepo

Este repo usa Go Workspaces (`go.work`). Apps en `apps/`, librerías compartidas en
`libs/`. Nunca dupliques modelos o el cliente de Mongo — todo lo compartido vive en
`libs/sanacore`. Antes de tocar `apps/sana-agent`, revisa `openspec/specs/` para el
comportamiento acordado y `openspec/changes/` para cambios en curso.

| Skill | Trigger | File |
|---|---|---|
| `sana-agent-tools` | Agregar o modificar una tool del chatbox | `skills/sana-agent-tools/SKILL.md` |
```

---

## 9. Siguiente paso concreto

Si quieres, el siguiente entregable natural sería el `openspec/changes/agent-chat-readonly/`
completo (proposal + spec-delta + tasks) para la Fase 2-4, listo para que `opencode`
lo tome como punto de partida.
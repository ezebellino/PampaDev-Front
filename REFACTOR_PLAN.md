# Plan de Refactorización — PampaDev Front

Este documento describe el plan de refactorización paso a paso basado en el análisis del estado actual del código. Debe ejecutarse antes o durante el desarrollo de próximos features, para que la nueva funcionalidad se construya sobre una base limpia.

---

## Objetivo

Reducir la complejidad de las rutas y módulos más grandes, separar responsabilidades siguiendo los principios de React (un componente = una responsabilidad), y consolidar patrones consistentes en toda la app.

---

## Progreso actual

| Estado | Área | Resultado |
|---|---|---|
| ✅ | Home pública | `app/routes/_index.tsx` quedó como orquestador y se extrajeron `HomeHero`, `HomeStats` y `HomeFeatures`. |
| ✅ | Paso 1 | `app.admin.requests.tsx` ahora usa `useRubroRequests` y componentes dedicados (`RequestsTable`, `RequestDetailModal`). |
| ✅ | Paso 2 | `app.disciplines.tsx` ahora usa `useDisciplines` y componentes dedicados (`DisciplineForm`, `DisciplineList`). |
| ✅ | Paso 3 | `AuthContext.tsx` delega la restauración y refresco de sesión al helper `tokenRefresh.ts`. |
| ✅ | Paso 4 | `logger.ts` quedó reducido a API pública sobre `logFormatter.ts` y `logStorage.ts`. |
| ✅ | Base estable | `npm run typecheck` pasa limpio. |

---

## Paso 0 — Home pública

Estado: completado.

### Resultado aplicado
- `app/routes/_index.tsx` consume hooks y compone la pantalla.
- `app/components/home/HomeHero.tsx` contiene el bloque hero.
- `app/components/home/HomeStats.tsx` contiene las métricas y skeletons.
- `app/components/home/HomeFeatures.tsx` contiene las feature cards.
- `app/lib/disciplines/useDisciplinesPublic.ts` quedó como hook compartido para la data pública.

---

## Paso 1 — Refactor de `app/routes/app.admin.requests.tsx`

Estado: completado.

### Resultado aplicado
- `app/components/admin/RequestsTable.tsx`
- `app/components/admin/RequestDetailModal.tsx`
- `app/components/admin/requestPresentation.ts`
- `app/lib/rubros/useRubroRequests.ts` centraliza carga, creación y revisión.
- `app/lib/rubros/rubroRequests.ts` concentra el tipo y la persistencia local.
- `app/routes/app.admin.requests.new.tsx` ahora crea solicitudes reales usando el hook compartido.

---

## Paso 2 — Refactor de `app/routes/app.disciplines.tsx`

Estado: completado.

### Resultado aplicado
- `app/components/disciplines/DisciplineForm.tsx`
- `app/components/disciplines/DisciplineList.tsx`
- `app/lib/disciplines/useDisciplines.ts` ahora expone `create`, `update`, `remove`, además de `refresh`.
- `app/routes/app.disciplines.tsx` quedó como ruta de orquestación con modales reutilizando el mismo formulario.

---

## Paso 3 — Refactor de `app/lib/auth/AuthContext.tsx`

Estado: completado.

### Resultado aplicado
- `app/lib/auth/authTypes.ts` concentra el tipo `User`.
- `app/lib/auth/tokenRefresh.ts` concentra normalización de roles, restauración de sesión y refresh mediante `/api/Users/me`.
- `app/lib/auth/AuthContext.tsx` quedó enfocado en proveer estado global y acciones públicas.

Nota: el backend actual no expone refresh token dedicado. El helper `tokenRefresh.ts` hoy encapsula la restauración de sesión y el refresco del usuario autenticado a través de `/me`.

---

## Paso 4 — Refactor de `app/lib/utils/logger.ts`

Estado: completado.

### Resultado aplicado
- `app/lib/utils/logFormatter.ts` concentra normalización y formateo.
- `app/lib/utils/logStorage.ts` concentra persistencia, lectura y limpieza.
- `app/lib/utils/logger.ts` quedó reducido a la API pública (`logInfo`, `logWarn`, `logError`, `logApiError`, `logSystem`, `getLogs`, `clearLogs`).

---

## Checklist de ejecución

### Paso 0 — Home pública
- [x] Extraer `HomeHero`
- [x] Extraer `HomeStats`
- [x] Extraer `HomeFeatures`
- [x] Mover la lógica pública de disciplinas a hook compartido
- [x] Reducir la ruta a orquestación

### Paso 1 — `app.admin.requests.tsx`
- [x] Crear `app/components/admin/RequestsTable.tsx`
- [x] Crear `app/components/admin/RequestDetailModal.tsx`
- [x] Verificar que `useRubroRequests` expone `approve` y `reject`
- [x] Reducir la ruta a orquestación
- [x] Verificar que la UI sigue funcionando con persistencia local

### Paso 2 — `app.disciplines.tsx`
- [x] Crear `app/components/disciplines/DisciplineForm.tsx`
- [x] Crear `app/components/disciplines/DisciplineList.tsx`
- [x] Verificar o completar `useDisciplines` con `create`, `update`, `delete`
- [x] Reducir la ruta a orquestación
- [ ] Verificar visualmente la UI en navegador

### Paso 3 — `AuthContext.tsx`
- [x] Crear `app/lib/auth/tokenRefresh.ts`
- [x] Mover la lógica de refresh o restauración de sesión al nuevo archivo
- [x] Verificar que login, logout y sesión persisten correctamente a nivel de tipado y flujo de código

### Paso 4 — `logger.ts`
- [x] Crear `app/lib/utils/logFormatter.ts`
- [x] Crear `app/lib/utils/logStorage.ts` si aplica
- [x] Reducir `logger.ts` a interfaz pública
- [x] Verificar que todos los imports existentes siguen funcionando

---

## Convenciones a respetar durante el refactor

- Rutas: solo orquestan. No deben tener lógica de fetch ni estado complejo.
- Componentes: una responsabilidad visual por componente.
- Hooks: toda lógica de estado y fetch vive en hooks `use*.ts`.
- Servicios: toda comunicación HTTP vive en `app/lib/api/services/`.
- Contextos: solo proveen estado global y delegan lógica a helpers.
- Tipos: definir tipos compartidos en archivos `types.ts` por dominio.
- Tests: si agregás o tocás un hook crítico, es buen momento para sumarle cobertura.

---

## Próximos incrementos sugeridos

1. QA visual manual de Home, Admin Requests, Disciplines, Branches, Rubros y Perfil.
2. Agregar tests a hooks críticos (`useDisciplines`, `useRubroRequests`, helpers de auth y logger).
3. Revisar naming mixto `discipline`/`rubro` para consolidar lenguaje de dominio.
4. Reemplazar mocks locales por endpoints reales donde ya exista backend.

---

Actualizado después de completar home, requests admin, disciplines, auth, logger y dejar `typecheck` limpio.

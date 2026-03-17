# Plan de Refactorización — PampaDev Front

Este documento describe el plan de refactorización y evolución funcional paso a paso basado en el análisis del estado actual del código. Sirve como referencia viva para seguir construyendo nuevas features sobre una base más limpia, consistente y mantenible.

---

## Objetivo

Reducir la complejidad de las rutas y módulos más grandes, separar responsabilidades siguiendo principios consistentes de React, consolidar patrones reutilizables en toda la app y avanzar features reales sin degradar la UX/UI ni la estructura técnica.

---

## Progreso actual

| Estado | Área | Resultado |
|---|---|---|
| ✅ | Home pública | `app/routes/_index.tsx` quedó como orquestador y se extrajeron `HomeHero`, `HomeStats` y `HomeFeatures`. |
| ✅ | Paso 1 | `app.admin.requests.tsx` ahora usa `useRubroRequests` y componentes dedicados (`RequestsTable`, `RequestDetailModal`). |
| ✅ | Paso 2 | `app.disciplines.tsx` ahora usa `useDisciplines` y componentes dedicados (`DisciplineForm`, `DisciplineList`). |
| ✅ | Paso 3 | `AuthContext.tsx` delega la restauración y refresco de sesión al helper `tokenRefresh.ts`. |
| ✅ | Paso 4 | `logger.ts` quedó reducido a API pública sobre `logFormatter.ts` y `logStorage.ts`. |
| ✅ | Horarios | `Admin` planifica apertura semanal y `Instructor` consume esa referencia junto con `Classes/byBranch/{idBranch}`. |
| ✅ | Membresías admin | Existe `app.admin.memberships.tsx` con planes por sucursal y clase particular usando persistencia local. |
| ✅ | Membresías usuario | Existe `app.memberships.tsx` para comparar planes visibles y clase particular desde una pantalla dedicada. |
| ✅ | Navegación | Sidebar, navbar, footer, selector de sucursal y paneles por rol quedaron más consistentes visualmente. |
| ✅ | Privacidad básica | Se retiró el `idUser` visible de la UI de perfil. |
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
- El flujo quedó alineado a roles: `Admin` crea solicitudes y `Devs` revisa el total.

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

## Paso 5 — Horarios y operación por sucursal

Estado: completado en frontend, pendiente de integración completa con backend write.

### Resultado aplicado
- `app/lib/scheduling/types.ts` define la estructura de planificación semanal por sucursal.
- `app/lib/scheduling/storage.ts` y `app/lib/scheduling/useBranchScheduleConfig.ts` sostienen persistencia local por sucursal.
- `app/lib/scheduling/classPresentation.ts` normaliza la respuesta real de `GET /api/Classes/byBranch/{idBranch}`.
- `app/routes/app.admin.horarios.tsx` ahora tiene dos capas:
  - planificación semanal editable por `Admin`
  - agenda real de clases devuelta por backend
- `app/routes/app.instructor.tsx` usa la planificación semanal como referencia operativa y la cruza con la agenda real de clases.

### Próximo paso asociado
- Reemplazar persistencia local de planificación por endpoints reales de creación/edición cuando backend los exponga.

---

## Paso 6 — Membresías y oferta comercial

Estado: completado en frontend, pendiente de integración con backend real.

### Resultado aplicado
- `app/lib/memberships/types.ts` define planes, clase particular y catálogo por sucursal.
- `app/lib/memberships/storage.ts` y `app/lib/memberships/useBranchMembershipCatalog.ts` sostienen persistencia local temporal.
- `app/routes/app.admin.memberships.tsx` permite a `Admin` definir:
  - planes por ciclo (`mensual`, `trimestral`, `semestral`, `anual`)
  - beneficios
  - disciplinas alcanzadas
  - visibilidad y estado
  - opción de clase particular
- `app/routes/app.memberships.tsx` expone la oferta comercial al usuario final en una pantalla dedicada.
- La vista pública de membresías tiene cards con microinteracción visual y un plan recomendado destacado.

### Próximo paso asociado
- Conectar el módulo a endpoints reales de memberships/private classes cuando el backend esté disponible.

---

## Paso 7 — Navegación, dashboards y consistencia visual

Estado: completado en gran parte.

### Resultado aplicado
- `Sidebar`, `Navbar`, `UserMenu` y `Footer` quedaron más coherentes entre sí.
- Se agregó color de acento mínimo y controlado sin perder la base sobria del proyecto.
- Los paneles por rol (`dev`, `admin`, `user`, `instructor`) quedaron alineados visualmente.
- Se agregaron accesos claros a membresías desde dashboard y navegación del usuario.
- Se retiró el `idUser` visible del perfil para evitar exponer un dato sensible sin valor UX.

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

### Paso 5 — Horarios
- [x] Crear módulo `app/lib/scheduling/*`
- [x] Integrar `GET /api/Classes/byBranch/{idBranch}`
- [x] Crear planificación semanal editable para `Admin`
- [x] Mostrar referencia semanal y agenda real en `Instructor`
- [ ] Reemplazar storage local por endpoints reales de write cuando existan

### Paso 6 — Membresías
- [x] Crear módulo `app/lib/memberships/*`
- [x] Crear `app.routes/app.admin.memberships.tsx`
- [x] Crear `app/routes/app.memberships.tsx`
- [x] Exponer membresías en dashboard y sidebar del usuario
- [x] Agregar microinteracción visual y plan recomendado
- [ ] Reemplazar storage local por endpoints reales de memberships/private classes

### Paso 7 — QA y cierre visual
- [x] Mejorar navegación compartida (`Sidebar`, `Navbar`, `Footer`, `UserMenu`)
- [x] Unificar paneles por rol
- [x] Corregir textos rotos y copy técnico visible al usuario
- [ ] QA visual manual completa en navegador
- [ ] Validar responsive final en mobile/tablet/desktop

---

## Convenciones a respetar durante el refactor

- Rutas: solo orquestan o componen la experiencia principal. No deben concentrar lógica desordenada ni fetch duplicado.
- Componentes: una responsabilidad visual por componente.
- Hooks: toda lógica de estado y fetch vive en hooks `use*.ts`.
- Servicios: toda comunicación HTTP vive en `app/lib/api/services/`.
- Contextos: solo proveen estado global y delegan lógica a helpers.
- Tipos: definir tipos compartidos en archivos `types.ts` por dominio.
- UX pública: no exponer detalles técnicos de backend, API, ids internos o estados de desarrollo.
- Integraciones temporales: si backend no existe aún, preferir storage local explícito y fácil de reemplazar.

---

## Paso 8 — Reserva de clase desde user (implementación inmediata)

Estado: en progreso.

### Resultado aplicado
- Instalado `@tanstack/react-query` para manejar fetching/cache/refresh automático.
- `app/root.tsx` está envuelto en `QueryClientProvider`.
- `app/lib/api/services/classes.ts` extiende con `createClassReservation`.
- `app/lib/scheduling/useBranchClassSlots.ts` expone `slots`, `loading`, `error`, `reserveSlot` y revalida query tras reserva.
- `app/routes/app.rubros.$id.tsx` usa API real desde `useBranchClassSlots` (fallback a `mockSlots` cuando no hay datos), y reserva activa con feedback.
- `app/routes/app.profile.tsx` se amplió con carga de photo de perfil local (archivo -> preview -> localStorage), anticipando el endpoint backend de avatar.

### Próximos pasos
- Sincronizar `reservation` con un endpoint backend robusto (`/api/Reservations` con atomicidad de cupos).
- Ajustar en `app.routes/app.instructor.tsx` el listado de solicitudes pendentes / confirmación.
- Agregar `useQuery` a métricas/reportes de `app.admin`. 

## Paso 9 — Validación y consolidación de roles

Estado: completado.

### Objetivo
- Evitar acceso indebido (`user` no puede llevar acciones de `instructor`/`admin` en endpoints).

### Tareas completas
- `app/lib/auth/Roles` + `Protected` ya obliga roles con redirect y evita accesos no autorizados.
- `app/routes/app.instructor.tsx` ahora muestra solicitudes `pending/confirmed` con botones `confirmar/rechazar` y refresco.
- `useBranchClassSlots` ahora añade solicitudes de reserva en localStorage para el instructor tras creación, y `useInstructorReservationRequests` gestiona estado local (pendientes/confirmados).

## Próximos incrementos sugeridos

1. QA visual manual completa de `memberships`, `horarios`, `instructor`, `profile` y paneles por rol.
2. Conectar `memberships` a backend real cuando estén disponibles los endpoints.
3. Conectar la planificación semanal de `horarios` a backend real cuando exista write sobre agenda/configuración.
4. Empezar la capa de contratación o reserva desde la vista de usuario (`contratar plan` / `reservar clase particular`).
5. Agregar tests a hooks críticos (`useDisciplines`, `useRubroRequests`, helpers de auth, logger, scheduling y memberships).
6. Revisar naming mixto `discipline`/`rubro` para consolidar lenguaje de dominio.

---

Actualizado después de completar home, requests admin, disciplines, auth, logger, horarios, membresías, navegación compartida y de dejar `typecheck` limpio.

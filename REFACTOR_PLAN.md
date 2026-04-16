# Plan de Refactorizacion - PampaDev Front

Este documento deja de funcionar como listado abierto de refactors pendientes y pasa a ser un corte de estado del trabajo ya completado, junto con los cierres tecnicos que faltan para salir de los fallbacks locales.

---

## Objetivo actual

Conservar la base ya refactorizada, cerrar integraciones reales con backend en los dominios todavia hibridos y completar QA/cobertura sobre los flujos criticos antes de ampliar alcance funcional.

---

## Estado consolidado

| Estado | Area | Resultado |
|---|---|---|
| OK | Home publica | `_index.tsx` quedo como orquestador con secciones separadas. |
| OK | Requests admin | `useRubroRequests` y componentes dedicados ordenaron el flujo. |
| OK | Disciplines | La ruta paso a composicion con formulario/lista reutilizable. |
| OK | Auth | `AuthContext` delega restauracion/refresco a `tokenRefresh.ts`. |
| OK | Logger | `logger.ts` hoy es API publica sobre formatter/storage. |
| OK | Query base | `QueryClientProvider` ya esta montado en `app/root.tsx`. |
| OK | Scheduling read | Admin e Instructor ya consumen agenda real por sucursal. |
| HYBRID | Scheduling write | La planificacion semanal sigue con persistencia local. |
| HYBRID | Memberships | Ya hay integracion parcial con API, pero sigue existiendo fallback local. |
| OK | Reserva de clase | `app.rubros.$id.tsx` reserva con API real cuando hay datos y fallback cuando no. |
| OK | Navegacion | Shell y paneles por rol quedaron mas consistentes. |
| OK | Tests visibles | Hay cobertura en auth, shell, memberships, scheduling y rubro requests. |

---

## Lo ya resuelto

### Paso 0 - Home publica

Estado: completado.

Resultado aplicado:
- `app/routes/_index.tsx` compone la pantalla.
- `HomeHero`, `HomeStats` y `HomeFeatures` quedaron separados.
- `useDisciplinesPublic` concentra la data publica.

### Paso 1 - Requests admin

Estado: completado.

Resultado aplicado:
- `app.admin.requests.tsx` quedo reducido a orquestacion.
- `RequestsTable`, `RequestDetailModal` y `requestPresentation.ts` separan UI/presentacion.
- `useRubroRequests` concentra carga, revision y persistencia temporal.

### Paso 2 - Disciplines

Estado: completado.

Resultado aplicado:
- `DisciplineForm` y `DisciplineList` separan UI.
- `useDisciplines` expone `create`, `update`, `remove` y `refresh`.

### Paso 3 - Auth

Estado: completado.

Resultado aplicado:
- `authTypes.ts` concentra el tipo `User`.
- `tokenRefresh.ts` encapsula restauracion de sesion y refresh por `/api/Users/me`.
- `AuthContext.tsx` quedo acotado a estado global y acciones publicas.

### Paso 4 - Logger

Estado: completado.

Resultado aplicado:
- `logFormatter.ts` normaliza y formatea.
- `logStorage.ts` persiste y limpia.
- `logger.ts` expone la interfaz publica consumida por la app y el dev panel.

### Paso 5 - Scheduling por sucursal

Estado: resuelto del lado frontend para lectura, pendiente backend write.

Resultado aplicado:
- `useBranchScheduleConfig` sostiene la planificacion semanal local por sucursal.
- `classPresentation.ts` adapta `GET /api/Classes/byBranch/{idBranch}`.
- `app.admin.horarios.tsx` combina planificacion editable con agenda real.
- `app.instructor.tsx` cruza referencia semanal con clases reales.

### Paso 6 - Memberships y oferta comercial

Estado: resuelto del lado UI, pendiente cierre completo de backend.

Resultado aplicado:
- `types.ts`, `storage.ts` y `useBranchMembershipCatalog.ts` consolidan el dominio.
- `useBranchMembershipCatalog` ya usa `React Query` y trata de sincronizar con API antes de caer en fallback local.
- `app.admin.memberships.tsx` administra planes por sucursal y clase particular.
- `app.memberships.tsx` expone la oferta comercial para usuario final.

### Paso 7 - Navegacion y consistencia visual

Estado: completado en gran parte.

Resultado aplicado:
- Sidebar, navbar, footer y user menu quedaron alineados.
- Los paneles por rol quedaron mas consistentes.
- Se corrigieron varios textos y se removio `idUser` visible del perfil.

### Paso 8 - Reserva de clase desde user

Estado: completado de forma hibrida.

Resultado aplicado:
- `@tanstack/react-query` se incorporo como base de cache/fetch.
- `app/root.tsx` usa `QueryClientProvider` sin singleton inseguro en modulo.
- `createClassReservation` existe en servicios.
- `useBranchClassSlots` expone slots, reserva y refresh.
- `app.rubros.$id.tsx` usa API real cuando hay agenda disponible y fallback publicado/local cuando no.

### Paso 9 - Roles y validacion de acceso

Estado: completado.

Resultado aplicado:
- `Protected` restringe acceso por rol con redirect.
- `app.instructor.tsx` ya administra solicitudes pendientes/confirmadas.
- El flujo de reserva deja trazabilidad local para seguimiento del instructor donde todavia no existe backend completo.

---

## Pendientes reales

### Pendiente 1 - Sacar storage local como fuente de verdad

Prioridad: alta.

Aplica a:
- planificacion semanal de `scheduling`
- partes del catalogo y operaciones de `memberships`
- seguimiento local complementario de reservas/instructor

### Pendiente 2 - QA visual/manual completa

Prioridad: alta.

Alcance minimo:
- `memberships`
- `horarios`
- `instructor`
- `profile`
- `rubros`
- shell responsive completo

### Pendiente 3 - Cobertura automatica de flujos

Prioridad: media-alta.

Foco:
- login y rutas protegidas
- cambio de empresa/sucursal
- reserva de clase
- menu movil y shell autenticado

### Pendiente 4 - Unificacion de dominio

Prioridad: media.

Foco:
- naming mixto `rubro` / `discipline`
- ids y contratos compartidos con backend
- adaptadores menos ad-hoc por modulo

---

## Checklist actualizado

- [x] Reducir rutas grandes a orquestacion principal.
- [x] Separar componentes visuales por responsabilidad.
- [x] Delegar logica de auth a helper especializado.
- [x] Reducir logger a API publica con capas separadas.
- [x] Incorporar `React Query` en la raiz.
- [x] Integrar lectura real de agenda/clases por sucursal.
- [x] Implementar reserva de clase desde user con feedback.
- [x] Crear modulo de memberships con administracion y vista usuario.
- [x] Agregar tests visibles sobre helpers/hooks clave.
- [ ] Reemplazar write local de scheduling por backend real.
- [ ] Reemplazar fallback local de memberships por backend real.
- [ ] Completar QA visual/manual de los modulos principales.
- [ ] Agregar tests de humo de flujos criticos.
- [ ] Consolidar naming de dominio con backend.

---

## Siguiente corte recomendado

1. Elegir un vertical: `memberships` o `scheduling`.
2. Cerrar contratos backend y eliminar fallback local de ese vertical.
3. Ejecutar QA visual/manual del modulo cerrado.
4. Agregar tests minimos del flujo antes de pasar al siguiente vertical.

---

Actualizado para reflejar el estado real del repo despues del refactor base, la incorporacion de `React Query`, la reserva de clases hibrida y la existencia de cobertura automatica parcial.


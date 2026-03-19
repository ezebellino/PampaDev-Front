# Roadmap Frontend - PampaDev

Este roadmap reemplaza al plan de mejora ad-hoc y ordena el trabajo del frontend por impacto, riesgo y dependencia con el backend en C#.

## Objetivos

- Reducir deuda tecnica en auth, shell, data fetching y persistencia local.
- Alinear frontend y backend para que la fuente de verdad deje de estar en `localStorage`.
- Mejorar confiabilidad en mobile, estados de carga, errores y sesiones expiradas.
- Incorporar control de cambios con entregas chicas, commits claros y validaciones frecuentes.

## Estado actual

- El menu hamburguesa responsive ya fue corregido.
- `npm run typecheck` esta pasando limpio.
- Persisten modulos importantes con storage local temporal: rubros, memberships y scheduling.
- La capa de fetch y auth todavia necesita endurecimiento para produccion.
- No hay cobertura automatica visible para flujos criticos del frontend.

## Prioridades

### Fase 1 - Shell, Auth y Base Tecnica

Objetivo: evitar pantallas en blanco, mejorar sesion, estabilizar cache y quitar ruido tecnico de produccion.

Tareas:
- Mejorar `Protected` para mostrar feedback visible mientras bootstrap/auth cargan.
- Centralizar manejo de sesion expirada desde la capa API.
- Evitar singletons inseguros de `QueryClient` en SSR.
- Limitar logs de configuracion y ruido de consola fuera de desarrollo.
- Revisar loaders, errores vacios y mensajes de fallback en el shell autenticado.

Criterio de cierre:
- Navegacion protegida sin flashes vacios.
- Logout o limpieza consistente ante `401`.
- Base lista para seguir migrando dominios a backend real.

### Fase 2 - Integracion Real con Backend

Objetivo: sacar la logica de negocio critica del navegador y delegarla al backend.

Tareas:
- Migrar solicitudes de rubros a endpoints reales.
- Migrar catalogo de memberships y clase particular a endpoints reales.
- Migrar configuracion semanal/horarios a endpoints write reales.
- Definir contratos de error y payload con el backend para evitar normalizaciones ad-hoc.
- Revisar naming de dominio compartido: `discipline`, `rubro`, `class`, `membership`, `branch`.

Criterio de cierre:
- Los modulos core ya no dependen de `localStorage` para persistencia de negocio.
- La app refleja datos compartidos entre usuarios y ambientes.

### Fase 3 - Data Layer Unificada

Objetivo: dejar de mezclar hooks manuales con cache parcial y pasar a un patron consistente.

Tareas:
- Migrar hooks de fetch a React Query por dominio.
- Definir query keys y politicas de invalidacion.
- Estandarizar estados `loading/error/empty/success`.
- Consolidar tipos y adaptadores de respuesta API.
- Reducir logica duplicada entre rutas, hooks y servicios.

Criterio de cierre:
- Las rutas quedan orquestando UI y los hooks manejan fetching/mutaciones de forma uniforme.

### Fase 4 - UX, Responsive y Accesibilidad

Objetivo: reforzar la experiencia diaria de uso, especialmente en mobile y contextos de operacion.

Tareas:
- Bloquear scroll del body cuando el menu movil esta abierto.
- Mejorar foco, teclado y cierre de overlays/menus.
- QA manual en mobile/tablet/desktop para navbar, sidebar, user menu y modulos admin.
- Corregir textos con encoding roto y copy inconsistente.
- Revisar contraste, targets tactiles y estados disabled.

Criterio de cierre:
- Shell usable y consistente en escritorio y movil.

### Fase 5 - Calidad y Observabilidad

Objetivo: reducir regresiones y hacer visibles los problemas correctos.

Tareas:
- Agregar tests de humo para login, rutas protegidas, cambio de empresa/sucursal y menu movil.
- Agregar tests para helpers criticos de auth/API/storage.
- Revisar logger para separar modo desarrollo y produccion.
- Definir eventos funcionales minimos para soporte y diagnostico.

Criterio de cierre:
- Los flujos criticos tienen una red minima de seguridad antes de cambios mayores.

## Proximos pasos sugeridos

1. Completar Fase 1 y dejar commit propio.
2. Coordinar con backend contratos y endpoints de Fase 2.
3. Migrar un dominio vertical completo por vez: requests, memberships, scheduling.
4. Incorporar tests justo despues de cada migracion de dominio.

## Politica de versionado

- Commits chicos, atomicos y descriptivos.
- Mantener `typecheck` verde antes de cada commit.
- Hacer push frecuente para dejar trazabilidad real del avance.
- Si una mejora depende del backend aun no disponible, dejar explicito el fallback temporal.
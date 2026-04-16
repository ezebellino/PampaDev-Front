# Roadmap Frontend - PampaDev

Este roadmap reemplaza la version anterior y refleja el estado real del frontend despues de la etapa fuerte de refactor, estabilizacion visual y primeras integraciones con API.

## Objetivos vigentes

- Terminar de sacar persistencia de negocio critica del navegador.
- Consolidar un data layer consistente con `React Query` donde ya haya integracion real.
- Cerrar QA visual y responsive de los modulos ya construidos.
- Aumentar cobertura automatica sobre flujos criticos antes de seguir agregando features.

## Estado actual real

- `npm run typecheck` esta pasando limpio.
- `@tanstack/react-query` ya esta montado en `app/root.tsx`.
- Auth, shell, logger, requests, disciplines, memberships, scheduling y dashboards ya pasaron por una etapa importante de ordenamiento.
- La reserva de clases desde user ya usa API real cuando hay datos disponibles y fallback local/publicado cuando el backend no completa el flujo.
- `memberships` ya tiene integracion parcial con API para alta/actualizacion, pero sigue dependiendo de storage local como fallback y para parte del catalogo.
- `scheduling` sigue usando storage local para la planificacion write de sucursal, aunque ya consume agenda real desde backend.
- Ya existen tests visibles para auth, shell, memberships, scheduling y rubro requests.
- Sigue faltando QA visual/manual completa en navegador y cierre de contratos backend para eliminar fallbacks.

## Prioridades

### Fase 1 - Integracion Real de Dominios

Objetivo: cerrar los modulos que hoy siguen mitad API y mitad storage local.

Tareas:
- Conectar `memberships` a endpoints reales de catalogo, alta, edicion, visibilidad y clase particular.
- Conectar `scheduling` write a endpoints reales de configuracion semanal y agenda.
- Endurecer reserva de clases con endpoint transaccional real para cupos y estados.
- Revisar contratos backend/frontend para evitar normalizaciones ad-hoc.
- Definir criterio unico para ids y naming compartido: `rubro`, `discipline`, `membership`, `class`, `branch`.

Criterio de cierre:
- `memberships`, `scheduling` y reservas ya no dependen de `localStorage` como fuente de verdad.
- Los datos son compartidos entre usuarios, sucursales y sesiones.

### Fase 2 - QA Funcional y Responsive

Objetivo: validar que lo ya construido sea confiable antes de sumar mas alcance.

Tareas:
- QA manual completa de `memberships`, `horarios`, `instructor`, `profile`, `rubros` y paneles por rol.
- Validacion mobile/tablet/desktop de navbar, sidebar, overlays, user menu y flujos de reserva.
- Corregir textos con encoding roto y copy inconsistente que sigan visibles.
- Revisar foco, teclado, estados disabled y mensajes de error/empty.

Criterio de cierre:
- Shell y modulos core usables de punta a punta en escritorio y movil.
- Sin errores visuales obvios en los flujos principales.

### Fase 3 - Cobertura y Observabilidad

Objetivo: bajar riesgo de regresion sobre la base ya estabilizada.

Tareas:
- Agregar tests de humo para login, rutas protegidas, cambio de empresa/sucursal, menu movil y reserva de clase.
- Ampliar tests de hooks/helpers criticos donde hoy hay cobertura parcial.
- Revisar eventos funcionales y logger para diferenciar mejor errores de frontend, backend y fallbacks.
- Definir que eventos sirven para soporte y diagnostico operativo.

Criterio de cierre:
- Los flujos mas sensibles tienen red minima de seguridad automatizada.
- El panel dev y logs entregan señales utiles, no ruido.

### Fase 4 - Consolidacion del Data Layer

Objetivo: terminar de unificar el patron de fetching/mutaciones despues de cerrar backend real.

Tareas:
- Extender `React Query` a dominios que todavia mezclan hooks manuales y storage/eventos.
- Unificar query keys, invalidaciones y estados `loading/error/empty/success`.
- Reducir duplicacion entre rutas, hooks, storage temporal y servicios.
- Alinear adaptadores de respuesta y tipos compartidos por dominio.

Criterio de cierre:
- Las rutas quedan solo como orquestadoras.
- Los hooks concentran fetch, cache, mutaciones y refresh de forma consistente.

## Proximos pasos sugeridos

1. Cerrar un dominio vertical primero: `memberships` o `scheduling`.
2. Si backend write todavia no esta listo, hacer primero QA visual/manual completa y humo funcional.
3. Eliminar fallbacks locales apenas existan endpoints reales estables.
4. Consolidar naming de dominio antes de seguir creciendo superficie funcional.

## Politica de versionado

- Commits chicos, atomicos y descriptivos.
- Mantener `typecheck` verde antes de cada commit.
- Agregar o ajustar tests cuando se cierre una migracion de dominio.
- Si una mejora depende del backend aun no disponible, dejar explicito el fallback temporal y su criterio de salida.

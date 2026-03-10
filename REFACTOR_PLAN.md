# Plan de Refactorización — PampaDev Front

Este documento describe el plan de refactorización paso a paso basado en el análisis del estado actual del código. Debe ejecutarse **antes o durante** el desarrollo del próximo feature, para que la nueva funcionalidad se construya sobre una base limpia.

---

## 🎯 Objetivo

Reducir la complejidad de las rutas y módulos más grandes, separar responsabilidades siguiendo los principios de React (un componente = una responsabilidad), y consolidar patrones consistentes en toda la app.

---

## 📋 Resumen de cambios

| # | Archivo actual | Problema | Acción |
|---|---|---|---|
| 1 | `app/routes/app.admin.requests.tsx` | God Component (299 líneas) | Extraer componentes + delegar a hook existente |
| 2 | `app/routes/app.disciplines.tsx` | UI + lógica mezclada (273 líneas) | Extraer formulario y lista a componentes |
| 3 | `app/lib/auth/AuthContext.tsx` | Creció demasiado (~150 líneas) | Extraer lógica de token refresh |
| 4 | `app/lib/utils/logger.ts` | Módulo monolítico (248 líneas) | Dividir en responsabilidades claras |

---

## 🔴 PASO 1 — Refactor de `app/routes/app.admin.requests.tsx`

**Prioridad: Alta — hacer primero**

Este archivo mezcla fetch, estado, tabla y modal en una sola ruta. El objetivo es que la ruta quede en ~50 líneas solo orquestando.

### 1.1 Crear `app/components/admin/RequestsTable.tsx`

Extraer toda la tabla de requests a un componente dedicado.

```tsx
// app/components/admin/RequestsTable.tsx
type Props = {
  requests: RubroRequest[];
  onSelect: (request: RubroRequest) => void;
};

export function RequestsTable({ requests, onSelect }: Props) {
  // JSX de la tabla aquí
}
```

### 1.2 Crear `app/components/admin/RequestDetailModal.tsx`

Extraer el modal de detalle/aprobación a su propio componente.

```tsx
// app/components/admin/RequestDetailModal.tsx
type Props = {
  request: RubroRequest | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

export function RequestDetailModal({ request, onClose, onApprove, onReject }: Props) {
  // JSX del modal aquí
}
```

### 1.3 Usar `useRubroRequests` desde la ruta

El hook `app/lib/rubros/useRubroRequests.ts` ya existe. Asegurarse que la ruta lo use directamente en lugar de duplicar lógica de fetch/estado.

```tsx
// app/routes/app.admin.requests.tsx — resultado final (~50 líneas)
export default function AdminRequestsPage() {
  const { requests, loading, approve, reject } = useRubroRequests();
  const [selected, setSelected] = useState<RubroRequest | null>(null);

  if (loading) return <ScreenLoader />;

  return (
    <div>
      <PageHeader title="Solicitudes de Rubro" />
      <RequestsTable requests={requests} onSelect={setSelected} />
      <RequestDetailModal
        request={selected}
        onClose={() => setSelected(null)}
        onApprove={approve}
        onReject={reject}
      />
    </div>
  );
}
```

---

## 🔴 PASO 2 — Refactor de `app/routes/app.disciplines.tsx`

**Prioridad: Alta**

### 2.1 Crear `app/components/disciplines/DisciplineForm.tsx`

Extraer el formulario de creación/edición de disciplinas.

```tsx
// app/components/disciplines/DisciplineForm.tsx
type Props = {
  onSubmit: (data: DisciplineFormData) => void;
  initialData?: Partial<DisciplineFormData>;
  loading?: boolean;
};

export function DisciplineForm({ onSubmit, initialData, loading }: Props) {
  // formulario controlado aquí
}
```

### 2.2 Crear `app/components/disciplines/DisciplineList.tsx`

Extraer el listado de disciplinas.

```tsx
// app/components/disciplines/DisciplineList.tsx
type Props = {
  disciplines: Discipline[];
  onEdit: (d: Discipline) => void;
  onDelete: (id: string) => void;
};

export function DisciplineList({ disciplines, onEdit, onDelete }: Props) {
  // listado con acciones
}
```

### 2.3 Verificar que `useDisciplines` cubra toda la lógica de la ruta

Revisar `app/lib/disciplines/useDisciplines.ts` y si le falta exponer `create`, `update` o `delete`, agregarlos ahí — nunca en la ruta.

---

## 🟡 PASO 3 — Refactor de `app/lib/auth/AuthContext.tsx`

**Prioridad: Media — hacer antes de agregar más lógica de auth**

### 3.1 Crear `app/lib/auth/tokenRefresh.ts`

Extraer la lógica de renovación de tokens del contexto.

```ts
// app/lib/auth/tokenRefresh.ts
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  // lógica de llamada al endpoint de refresh
  // retorna el nuevo access token o null si falló
}
```

### 3.2 `AuthContext` debe quedar solo como proveedor de estado

Responsabilidades que deben permanecer en `AuthContext.tsx`:
- Estado: `user`, `isLoading`, `isAuthenticated`
- Acciones: `login(credentials)`, `logout()`
- Consumo de `jwt.ts` para decodificar el token
- Consumo de `authStorage.ts` para persistencia
- Consumo de `tokenRefresh.ts` para renovar sesión

Responsabilidades que deben **salir** de `AuthContext.tsx`:
- Lógica detallada del ciclo de vida del refresh token → `tokenRefresh.ts`
- Cualquier llamada directa a fetch → `app/lib/api/services/auth.ts`

---

## 🟡 PASO 4 — Refactor de `app/lib/utils/logger.ts`

**Prioridad: Media — técnico/interno, no urgente**

### 4.1 Dividir en tres archivos

```
app/lib/utils/
├── logger.ts          # Interfaz pública: log(), warn(), error(), info() (~40 líneas)
├── logFormatter.ts    # Formateo de mensajes, timestamps, colores de consola
└── logStorage.ts      # Persistencia de logs (si aplica)
```

### 4.2 `logger.ts` debe ser la única API expuesta

```ts
// app/lib/utils/logger.ts — solo interfaz pública
import { format } from './logFormatter';
import { persist } from './logStorage';

export const logger = {
  log: (msg: string, ctx?: object) => { ... },
  warn: (msg: string, ctx?: object) => { ... },
  error: (msg: string, ctx?: object) => { ... },
  info: (msg: string, ctx?: object) => { ... },
};
```

---

## ✅ Checklist de ejecución

Usar este checklist al ejecutar el plan. Marcar con ✅ a medida que se completa cada ítem.

### Paso 1 — `app.admin.requests.tsx`
- [ ] Crear `app/components/admin/RequestsTable.tsx`
- [ ] Crear `app/components/admin/RequestDetailModal.tsx`
- [ ] Verificar que `useRubroRequests` expone `approve` y `reject`
- [ ] Reducir la ruta a ~50 líneas
- [ ] Verificar que la UI sigue funcionando igual

### Paso 2 — `app.disciplines.tsx`
- [ ] Crear `app/components/disciplines/DisciplineForm.tsx`
- [ ] Crear `app/components/disciplines/DisciplineList.tsx`
- [ ] Verificar/completar `useDisciplines` con `create`, `update`, `delete`
- [ ] Reducir la ruta a ~50 líneas
- [ ] Verificar que la UI sigue funcionando igual

### Paso 3 — `AuthContext.tsx`
- [ ] Crear `app/lib/auth/tokenRefresh.ts`
- [ ] Mover lógica de refresh al nuevo archivo
- [ ] Verificar que login/logout/sesión persisten correctamente

### Paso 4 — `logger.ts`
- [ ] Crear `app/lib/utils/logFormatter.ts`
- [ ] Crear `app/lib/utils/logStorage.ts` (si aplica)
- [ ] Reducir `logger.ts` a interfaz pública
- [ ] Verificar que todos los `import` existentes de `logger` siguen funcionando

---

## 📐 Convenciones a respetar durante el refactor

- **Rutas**: solo orquestan. No deben tener lógica de fetch ni estado complejo.
- **Componentes**: un componente = una responsabilidad visual.
- **Hooks**: toda lógica de estado y fetch vive en hooks (`use*.ts`).
- **Servicios**: toda comunicación HTTP vive en `app/lib/api/services/`.
- **Contextos**: solo proveen estado global, delegan lógica a helpers.
- **Tipos**: definir tipos compartidos en archivos `types.ts` por dominio.
- **Tests**: si agregás un hook nuevo, es el momento ideal para agregarle un test.

---

## 🚀 Orden de ejecución recomendado

```
Paso 1 (requests) → Paso 2 (disciplines) → Paso 3 (auth) → Paso 4 (logger)
```

Los pasos 1 y 2 son independientes entre sí y pueden hacerse en paralelo si hay más de una persona trabajando. Los pasos 3 y 4 son más internos y pueden hacerse después sin bloquear el feature.

---

*Generado automáticamente por análisis de código — PampaDev Front — Marzo 2026*

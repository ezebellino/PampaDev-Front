# CLAUDE.md — PampaDev Front

Este archivo provee contexto sobre el proyecto para asistentes de IA (como Claude) que trabajen en este repositorio.

---

## 🧭 ¿Qué es PampaDev Front?

Frontend de **PampaDev**, una plataforma multi-tenant para la gestión de actividades deportivas y/o fitness. Permite a empresas (gimnasios, estudios, clubes) ofrecer sus servicios por **rubros** (disciplinas), con gestión de disponibilidad, usuarios y roles.

El proyecto está construido con **React Router v7** (framework mode) sobre Vite + TypeScript.

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | React Router v7 (framework mode) |
| Lenguaje | TypeScript |
| Bundler | Vite |
| Estilos | Tailwind CSS |
| Auth | JWT (access + refresh token) via AuthContext |
| HTTP | Fetch nativo, capa de servicios propia en `app/lib/api/` |
| State | React Context + custom hooks |

---

## 📁 Estructura del proyecto

```
app/
├── components/
│   ├── admin/          # Componentes del panel de administración
│   │   └── AvailabilityEditor.tsx   # Editor de disponibilidad horaria
│   ├── branches/       # Selector de sucursales (BranchPicker)
│   ├── companies/      # Selector de empresa en navbar
│   ├── dev/            # Herramientas de desarrollo (LogChart, etc.)
│   ├── layout/         # AppLayout, Navbar, Sidebar, Footer, UserMenu
│   └── ui/             # Componentes base: Button, Card, Badge, Modal, Loader, etc.
│
├── lib/
│   ├── api/
│   │   ├── api.ts              # Cliente HTTP base (fetch wrapper con auth headers)
│   │   ├── hooks/              # Custom hooks: useMe, useBranches, useCompanies, etc.
│   │   ├── models/             # Tipos de dominio: branch.ts, etc.
│   │   └── services/           # Llamadas a endpoints: auth, availability, branches, disciplines, users
│   ├── auth/
│   │   ├── AuthContext.tsx      # Contexto global de autenticación
│   │   ├── Protected.tsx        # HOC para rutas protegidas por rol
│   │   ├── authStorage.ts       # Persistencia de tokens en localStorage
│   │   ├── jwt.ts               # Decodificación y validación de JWT
│   │   └── roles.ts             # Definición de roles: admin, instructor, user, dev
│   ├── branches/
│   │   └── BranchContext.tsx    # Contexto de sucursal activa seleccionada
│   ├── tenant/
│   │   ├── tenantConfig.ts      # Configuración por tenant (nombre, colores, rubros habilitados)
│   │   └── useTenantConfig.ts   # Hook para consumir config del tenant
│   └── ui/
│       └── UIContext.tsx        # Contexto de UI (sidebar abierto/cerrado, etc.)
│
└── routes/
    ├── _index.tsx          # Landing / login redirect
    ├── login.tsx           # Página de login
    ├── app.tsx             # Layout raíz de la app autenticada
    ├── app._index.tsx      # Dashboard principal
    ├── app.rubros.tsx      # Layout de rubros
    ├── app.rubros._index.tsx   # Listado de rubros
    ├── app.rubros.$id.tsx      # Detalle de un rubro
    ├── app.admin.tsx       # Panel de administración
    ├── app.instructor.tsx  # Vista de instructor
    ├── app.user.tsx        # Vista de usuario final
    └── app.dev.tsx         # Vista de desarrollo / debug
```

---

## 🔐 Autenticación y roles

- El sistema usa **JWT** con access token y refresh token.
- `AuthContext` maneja el estado de sesión globalmente.
- `authStorage.ts` persiste los tokens en `localStorage`.
- `jwt.ts` se encarga de decodificar y verificar expiración.
- Los roles definidos son: `admin`, `instructor`, `user`, `dev`.
- `Protected.tsx` envuelve rutas para restringir acceso por rol.

---

## 🏢 Multi-tenancy

- Cada empresa (tenant) puede tener su propia configuración: nombre, rubros habilitados, colores, etc.
- La configuración se lee desde `tenantConfig.ts` y se consume con `useTenantConfig`.
- Las sucursales (branches) de una empresa se gestionan con `BranchContext`.

---

## 🌐 Capa de API

- El cliente base en `app/lib/api/api.ts` maneja headers de autorización automáticamente.
- Los **servicios** (`services/`) contienen las llamadas a cada endpoint del backend.
- Los **hooks** (`hooks/`) envuelven los servicios con estado de carga, datos y error.

Ejemplo de uso:
```tsx
const { branches, loading, error } = useBranches();
```

---

## 🚧 Estado actual del proyecto

| Feature | Estado |
|---|---|
| Auth con JWT | ✅ Implementado |
| Routing protegido por rol | ✅ Implementado |
| Listado y detalle de rubros | ✅ Implementado |
| Admin dashboard | ✅ Implementado |
| Editor de disponibilidad horaria | ✅ Implementado |
| Capa de API con hooks | ✅ Implementado |
| Multi-tenant config | ✅ Implementado |
| E-commerce / pagos | 🔄 En desarrollo |

---

## ▶️ Comandos útiles

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

---

## 📝 Convenciones de código

- **Componentes**: PascalCase, un archivo por componente.
- **Hooks**: camelCase con prefijo `use` (ej: `useBranches`).
- **Servicios**: camelCase, agrupados por dominio.
- **Rutas**: notación de archivos de React Router v7 (`app.rubros.$id.tsx`).
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, etc.).
- **Estilos**: exclusivamente Tailwind CSS, sin CSS custom salvo casos excepcionales.

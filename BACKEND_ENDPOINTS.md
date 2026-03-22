# Endpoints pendientes para backend

Documento corto para alinear frontend y backend.  
Fecha: 2026-03-22

## Prioridad alta

### 1. Agenda publicada y clases disponibles
Objetivo: que el usuario vea turnos reales y no fallback local.

Endpoints sugeridos:
- `GET /api/Classes/byBranch/{idBranch}`
  - Ya existe, pero debería devolver siempre:
    - `idClass`
    - `idBranch`
    - `idBranchDiscipline`
    - `disciplineName`
    - `date`
    - `time`
    - `duration`
    - `capacity`
    - `available`
    - `status`
    - `instructorName` o `idInstructor`
- `GET /api/Classes/available?idBranch={idBranch}&idBranchDiscipline={idBranchDiscipline}&from={date}&to={date}`
  - Para filtrar agenda visible al usuario.
- `POST /api/Classes`
  - Ya existe.
  - Confirmar si crea la clase publicada o la reserva inicial.
- `PUT /api/Classes/{id}` o `PATCH /api/Classes/{id}`
  - Para cambiar `status`, `capacity`, `available`, `time`, `duration`.
- `DELETE /api/Classes/{id}`
  - Para cerrar o eliminar clases publicadas.

### 2. Reservas del usuario
Objetivo: que el usuario pueda reservar, ver su historial y cancelar sin depender de localStorage.

Endpoints sugeridos:
- `POST /api/ClassBookings`
  - Payload sugerido:
    - `idClass`
    - `idUser`
    - `notes` opcional
- `GET /api/ClassBookings/byUser/{idUser}`
  - Para `Mis turnos`.
- `GET /api/ClassBookings/byBranch/{idBranch}`
  - Para instructor y admin.
- `PUT /api/ClassBookings/{id}/confirm`
- `PUT /api/ClassBookings/{id}/reject`
- `PUT /api/ClassBookings/{id}/cancel`

Estados sugeridos:
- `pending`
- `confirmed`
- `rejected`
- `cancelled`

### 3. Disponibilidad semanal por sucursal y rubro
Objetivo: que admin configure horarios por disciplina y eso quede persistido en backend.

Endpoints sugeridos:
- `GET /api/Branches/{idBranch}/availability`
- `PUT /api/Branches/{idBranch}/availability`

Shape sugerido:
- `days[]`
  - `weekday`
  - `closed`
  - `reason`
- `disciplines[]`
  - `idDiscipline`
  - `enabled`
  - `openTime`
  - `closeTime`
  - `slotDuration`
  - `notes`

## Prioridad media

### 4. Rubros por sucursal
Objetivo: dejar de derivar todo desde disciplinas y tener oferta real por sucursal.

Endpoints sugeridos:
- `GET /api/BranchDisciplines/byBranch/{idBranch}`
- `POST /api/BranchDisciplines`
- `PUT /api/BranchDisciplines/{id}`
- `DELETE /api/BranchDisciplines/{id}`

Campos esperados:
- `idBranchDiscipline`
- `idBranch`
- `idDiscipline`
- `name`
- `description`
- `price`
- `duration`
- `isVisible`
- `isEnabled`

### 5. Solicitudes de rubros
Objetivo: que admin pida alta de rubros y devs los apruebe desde backend real.

Endpoints sugeridos:
- `GET /api/RubroRequests`
- `POST /api/RubroRequests`
- `PUT /api/RubroRequests/{id}/approve`
- `PUT /api/RubroRequests/{id}/reject`

Campos esperados:
- `id`
- `requestedName`
- `description`
- `status`
- `requestedBy`
- `reviewedBy`
- `notes`
- `createdAt`
- `updatedAt`

### 6. Memberships completas
Objetivo: sacar el híbrido `API + local` y manejar planes completos en backend.

Hoy el frontend ya usa:
- `GET /api/Memberships`
- `POST /api/Memberships`
- `PUT /api/Memberships/{id}`

Faltaría idealmente:
- `DELETE /api/Memberships/{id}`
- `GET /api/Memberships/byBranch/{idBranch}`

Campos útiles extra:
- `idBranch`
- `description`
- `isRecommended`
- `disciplineIds[]`
- `isVisible`

## Prioridad baja

### 7. Companies y Branches edición completa
Objetivo: administrar estructura sin depender de frontend local.

Companies:
- `GET /api/Companies`
- `POST /api/Companies`
- Sugeridos:
  - `PUT /api/Companies/{id}`
  - `DELETE /api/Companies/{id}`

Branches:
- `GET /api/Branches`
- `POST /api/Branches`
- Sugeridos:
  - `PUT /api/Branches/{id}`
  - `DELETE /api/Branches/{id}`
  - `GET /api/Branches/byCompany/{idCompany}`

### 8. Perfil y recuperación de cuenta
Objetivo: cerrar flujos públicos y de perfil.

Endpoints sugeridos:
- `POST /api/Auth/forgot-password`
- `POST /api/Auth/reset-password`
- `POST /api/Files/avatar` o `POST /api/Users/{id}/avatar`

## Contratos importantes para frontend

### Clase publicada
Campos mínimos:
- `idClass`
- `idBranch`
- `idBranchDiscipline`
- `disciplineName`
- `date`
- `time`
- `duration`
- `capacity`
- `available`
- `status`

### Reserva
Campos mínimos:
- `idBooking`
- `idClass`
- `idUser`
- `status`
- `createdAt`
- `updatedAt`

### BranchDiscipline
Campos mínimos:
- `idBranchDiscipline`
- `idBranch`
- `idDiscipline`
- `name`
- `isEnabled`
- `isVisible`

## Recomendación práctica
Orden sugerido para implementar:
1. `availability` por sucursal
2. `classes available` + update/delete de clases
3. `class bookings` del usuario
4. `branch disciplines`
5. `rubro requests`
6. `memberships` completas
7. `forgot/reset password` y avatar

import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import Protected from "../lib/auth/Protected";
import { useAuth } from "../lib/auth/AuthContext";
import { ROLES } from "../lib/auth/roles";
import { useBranch } from "../lib/branches/BranchContext";
import { useCompany } from "../lib/companies/CompanyContext";
import { useDisciplines } from "../lib/disciplines/useDisciplines";
import {
  getPublishedAgendaSlotStatusLabel,
  getPublishedAgendaSlotStatusTone,
  usePublishedBranchAgenda,
} from "../lib/scheduling/publishedAgenda";
import {
  getReservationSourceLabel,
  getReservationSourceTone,
  getReservationStatusLabel,
  getReservationStatusTone,
  getReservationSyncLabel,
  getReservationSyncTone,
} from "../lib/scheduling/reservationPresentation";
import { useBranchScheduleConfig } from "../lib/scheduling/useBranchScheduleConfig";
import { useMyReservationRequests } from "../lib/scheduling/useInstructorRequests";

function getTodayLocalISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isoToMonth(isoDate: string) {
  return isoDate.slice(0, 7);
}

function buildMonthDate(month: string, day: number) {
  return `${month}-${String(day).padStart(2, "0")}`;
}

function shiftMonth(month: string, delta: number) {
  const [yearRaw, monthRaw] = month.split("-");
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw) - 1;
  const date = new Date(year, monthIndex + delta, 1);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  return `${nextYear}-${nextMonth}`;
}

function getMonthGrid(month: string) {
  const [yearRaw, monthRaw] = month.split("-");
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw) - 1;
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

function formatMonthLabel(month: string) {
  const [yearRaw, monthRaw] = month.split("-");
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw) - 1;
  const date = new Date(year, monthIndex, 1);
  return date.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

export default function BookingsPage() {
  const todayISO = getTodayLocalISO();
  const { user } = useAuth();
  const isDev = user?.role === ROLES.DEVS;
  const isInstructor = user?.role === ROLES.INSTRUCTOR;
  const { branchId } = useBranch();
  const { companyId } = useCompany();
  const { disciplines } = useDisciplines();
  const { data: scheduleConfig } = useBranchScheduleConfig(branchId, disciplines);

  const activeUserId = isInstructor ? null : (user?.id ?? null);
  const { requests, pending, confirmed, cancelled, rejected, cancelRequest } = useMyReservationRequests(activeUserId, branchId);

  const publishedAgenda = usePublishedBranchAgenda(branchId, disciplines, scheduleConfig);
  const publishedSlots = useMemo(
    () => publishedAgenda.publishedItems.filter((item) => item.available > 0),
    [publishedAgenda.publishedItems]
  );

  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [visibleMonth, setVisibleMonth] = useState(isoToMonth(todayISO));
  const [selectedRubroId, setSelectedRubroId] = useState<string>("all");

  const rubroOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const slot of publishedSlots) {
      const id = String(slot.rubroId);
      const label = String(slot.rubroName ?? slot.disciplineName ?? slot.rubroId);
      if (!map.has(id)) map.set(id, label);
    }
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [publishedSlots]);

  const filteredSlots = useMemo(
    () =>
      selectedRubroId === "all"
        ? publishedSlots
        : publishedSlots.filter((slot) => String(slot.rubroId) === selectedRubroId),
    [publishedSlots, selectedRubroId]
  );

  const slotCountByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const slot of filteredSlots) {
      map.set(slot.date, (map.get(slot.date) ?? 0) + 1);
    }
    return map;
  }, [filteredSlots]);

  const slotsForDate = useMemo(
    () => filteredSlots.filter((slot) => slot.date === selectedDate),
    [filteredSlots, selectedDate]
  );

  const minDate = useMemo(
    () => (filteredSlots.length > 0 ? filteredSlots[0].date : undefined),
    [filteredSlots]
  );

  const maxDate = useMemo(
    () => (filteredSlots.length > 0 ? filteredSlots[filteredSlots.length - 1].date : undefined),
    [filteredSlots]
  );

  const { firstDay, daysInMonth } = useMemo(() => getMonthGrid(visibleMonth), [visibleMonth]);
  const dayHeaders = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const calendarCells = useMemo(() => {
    const cells: Array<{ date: string; day: number; count: number }> = [];
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = buildMonthDate(visibleMonth, day);
      const count = slotCountByDate.get(date) ?? 0;
      cells.push({ date, day, count });
    }
    return cells;
  }, [daysInMonth, slotCountByDate, visibleMonth]);

  return (
    <Protected allowRoles={[ROLES.USER, ROLES.INSTRUCTOR, ROLES.DEVS]}>
      <div className="space-y-6">
        <PageHeader
          title="Calendario de turnos"
          subtitle="Elegí una fecha y filtrá por rubro para ver turnos disponibles de la sucursal activa."
          right={
            <Link to="/app/rubros">
              <Button>Ir a rubros</Button>
            </Link>
          }
        />

        <section className="grid gap-4 lg:grid-cols-4">
          <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-stone-500">Empresa activa</div>
              <div className="mt-3 text-sm font-medium text-slate-900">{companyId ?? "Sin seleccionar"}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-stone-500">Sucursal activa</div>
              <div className="mt-3 text-sm font-medium text-slate-900">{branchId ?? "Sin seleccionar"}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-stone-500">Turnos publicados</div>
              <div className="mt-3 text-3xl font-semibold text-slate-900">{publishedAgenda.publishedItems.length}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
            <CardContent className="py-5">
              <div className="text-xs uppercase tracking-wider text-stone-500">Disponibles en fecha</div>
              <div className="mt-3 text-3xl font-semibold text-slate-900">{slotsForDate.length}</div>
            </CardContent>
          </Card>
        </section>

        {!branchId ? (
          <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
            <CardContent className="py-6">
              <Link to="/app/branches">
                <Button>Elegir sucursal</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
            <CardHeader>
              <CardTitle>Agenda por fecha y rubro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
                <label className="flex items-center gap-3 text-sm text-slate-600">
                  <span>Fecha</span>
                  <input
                    type="date"
                    value={selectedDate}
                    min={minDate}
                    max={maxDate}
                    onChange={(event) => {
                      const nextDate = event.target.value;
                      setSelectedDate(nextDate);
                      setVisibleMonth(isoToMonth(nextDate));
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-300"
                  />
                </label>

                <label className="flex items-center gap-3 text-sm text-slate-600">
                  <span>Rubro</span>
                  <select
                    value={selectedRubroId}
                    onChange={(event) => setSelectedRubroId(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-300"
                  >
                    <option value="all">Todos los rubros</option>
                    {rubroOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex flex-wrap items-center justify-end gap-2 text-sm text-slate-600">
                  <span>{slotsForDate.length > 0 ? `${slotsForDate.length} turnos disponibles` : "Sin turnos disponibles"}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDate(todayISO);
                      setVisibleMonth(isoToMonth(todayISO));
                    }}
                  >
                    Hoy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRubroId("all");
                      setSelectedDate(todayISO);
                      setVisibleMonth(isoToMonth(todayISO));
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-stone-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={() => setVisibleMonth((month) => shiftMonth(month, -1))}>
                    Mes anterior
                  </Button>
                  <div className="text-sm font-semibold text-slate-900 capitalize">{formatMonthLabel(visibleMonth)}</div>
                  <Button variant="ghost" size="sm" onClick={() => setVisibleMonth((month) => shiftMonth(month, 1))}>
                    Mes siguiente
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {dayHeaders.map((day) => (
                    <div key={day} className="px-2 py-1 text-center text-xs font-semibold uppercase tracking-wider text-stone-500">
                      {day}
                    </div>
                  ))}

                  {Array.from({ length: firstDay }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-16 rounded-xl border border-transparent" />
                  ))}

                  {calendarCells.map((cell) => {
                    const isSelected = cell.date === selectedDate;
                    const hasSlots = cell.count > 0;
                    return (
                      <button
                        key={cell.date}
                        type="button"
                        onClick={() => setSelectedDate(cell.date)}
                        className={[
                          "h-16 rounded-xl border px-2 py-1 text-left transition",
                          isSelected
                            ? "border-sky-300 bg-[#eff4ff]"
                            : hasSlots
                              ? "border-slate-200 bg-white hover:border-sky-200 hover:bg-[#f8fbff]"
                              : "border-slate-200/60 bg-stone-100/70 text-stone-400",
                        ].join(" ")}
                      >
                        <div className="text-sm font-semibold">{cell.day}</div>
                        <div className="mt-1 text-xs">{hasSlots ? `${cell.count} turnos` : "Sin turnos"}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {slotsForDate.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-4 text-sm text-slate-600">
                  No encontramos turnos disponibles para {selectedDate} con el filtro actual.
                </div>
              ) : (
                <div className="grid gap-3 lg:grid-cols-2">
                  {slotsForDate.map((slot) => (
                    <div key={slot.id} className="rounded-2xl border border-slate-200 bg-stone-50 p-4">
                      <div className="space-y-2">
                        <div className="text-base font-semibold text-slate-900">
                          {String(slot.rubroName ?? slot.disciplineName ?? slot.rubroId)}
                        </div>
                        <div className="text-sm text-slate-600">
                          {slot.date} · {slot.time}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={getPublishedAgendaSlotStatusTone(slot)}>{getPublishedAgendaSlotStatusLabel(slot)}</Badge>
                          <Badge tone="neutral">Cupo {slot.available}/{slot.capacity}</Badge>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Link to={`/app/rubros/${slot.rubroId}`} className="block">
                          <Button variant="secondary" className="w-full">
                            Ver rubro y reservar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!isInstructor && (
          <>
            {requests.length === 0 ? (
              <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
                <CardContent className="space-y-4 py-6">
                  <div className="text-sm text-slate-600">Todavía no tenés reservas en esta sucursal.</div>
                  <Link to="/app/rubros">
                    <Button>Explorar rubros</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
                <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
                  <CardHeader>
                    <CardTitle>Mis reservas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {requests.map((request) => {
                      const canCancel = request.status === "pending";

                      return (
                        <div key={request.id} className="rounded-2xl border border-slate-200 bg-stone-50 p-4">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-2">
                              <div className="text-base font-semibold text-slate-900">{request.rubroName ?? request.rubroId}</div>
                              <div className="text-sm text-slate-600">
                                {request.date ?? "Fecha a confirmar"} · {request.time ?? "Hora a confirmar"}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Badge tone={getReservationStatusTone(request.status)}>{getReservationStatusLabel(request.status)}</Badge>
                                {isDev ? (
                                  <>
                                    <Badge tone={getReservationSyncTone(request.syncStatus)}>{getReservationSyncLabel(request.syncStatus)}</Badge>
                                    <Badge tone={getReservationSourceTone(request.bookingSource)}>{getReservationSourceLabel(request.bookingSource)}</Badge>
                                  </>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex w-full flex-col gap-2 lg:w-44">
                              {canCancel ? (
                                <Button variant="secondary" onClick={() => cancelRequest(request.id)}>
                                  Cancelar
                                </Button>
                              ) : null}
                              <Link to="/app/rubros" className="block">
                                <Button variant="ghost" className="w-full border border-slate-200 bg-white hover:bg-[#eff4ff]">
                                  Reservar de nuevo
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
                  <CardHeader>
                    <CardTitle>Resumen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-600">
                    <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">Pendientes: {pending.length}</div>
                    <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">Confirmadas: {confirmed.length}</div>
                    <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">Rechazadas: {rejected.length}</div>
                    <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">Canceladas: {cancelled.length}</div>
                    {!isDev ? (
                      <div className="rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3">
                        Si querés reservar otro turno, podés hacerlo desde Rubros.
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </Protected>
  );
}

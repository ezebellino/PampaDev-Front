import type { BranchMembershipCatalog, MembershipPlan, MembershipPlanInput, PrivateClassOffer } from "./types";
import { BILLING_CYCLE_OPTIONS, PRIVATE_CLASS_DURATION_OPTIONS } from "./types";
import type { MembershipApiRecord } from "../api/services/memberships";

const MEMBERSHIPS_STORAGE_PREFIX = "pampadev:memberships:v1";
export const MEMBERSHIPS_EVENT = "pampadev:memberships:changed";

function key(branchId: number | string) {
  return `${MEMBERSHIPS_STORAGE_PREFIX}:${branchId}`;
}

function emitMembershipsChanged(branchId: number | string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(MEMBERSHIPS_EVENT, { detail: { branchId: String(branchId) } }));
}

function defaultPrivateClass(): PrivateClassOffer {
  return {
    enabled: false,
    price: 0,
    duration: 60,
    disciplineIds: [],
    notes: "",
    isActive: true,
  };
}

function sanitizeText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function sanitizeOptionalText(value: unknown) {
  const normalized = sanitizeText(value);
  return normalized.length > 0 ? normalized : undefined;
}

function sanitizeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sanitizeNullableNumber(value: unknown) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sanitizeDisciplineIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is number => typeof item === "number" && Number.isFinite(item));
}

function sanitizeHiddenPlanIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is number => typeof item === "number" && Number.isFinite(item));
}

function normalizeBillingCycle(value: unknown) {
  const cycle = BILLING_CYCLE_OPTIONS.find((item) => item.value === value) ?? BILLING_CYCLE_OPTIONS[0];
  return cycle;
}

function normalizeDuration(value: unknown): PrivateClassOffer["duration"] {
  const match = PRIVATE_CLASS_DURATION_OPTIONS.find((item) => item === value);
  return match ?? 60;
}

function sortPlans(plans: MembershipPlan[]) {
  return [...plans].sort((a, b) => {
    const aTime = Date.parse(a.updatedAt ?? a.createdAt ?? "") || 0;
    const bTime = Date.parse(b.updatedAt ?? b.createdAt ?? "") || 0;
    return bTime - aTime;
  });
}

function normalizePlan(plan: unknown): MembershipPlan | null {
  if (!plan || typeof plan !== "object") return null;

  const record = plan as Record<string, unknown>;
  const cycle = normalizeBillingCycle(record.billingCycle);
  const name = sanitizeText(record.name);
  const disciplineIds = sanitizeDisciplineIds(record.disciplineIds);

  if (!name) return null;

  const createdAt = sanitizeOptionalText(record.createdAt) ?? new Date().toISOString();

  return {
    idMembershipPlan: sanitizeNumber(record.idMembershipPlan, Date.now()),
    name,
    description: sanitizeText(record.description),
    price: Math.max(0, sanitizeNumber(record.price, 0)),
    disciplinesCount: Math.max(sanitizeNumber(record.disciplinesCount, 0), disciplineIds.length),
    billingCycle: cycle.value,
    months: typeof record.months === "number" ? record.months : cycle.months,
    classLimit: sanitizeNullableNumber(record.classLimit),
    unlimited: Boolean(record.unlimited),
    creditAmount: sanitizeNullableNumber(record.creditAmount),
    rolloverEnabled: Boolean(record.rolloverEnabled),
    isVisible: record.isVisible !== false,
    isActive: record.isActive !== false,
    benefits: sanitizeText(record.benefits),
    disciplineIds,
    createdAt,
    updatedAt: sanitizeOptionalText(record.updatedAt),
    syncSource: record.syncSource === "api" ? "api" : "local",
  };
}

function normalizePrivateClass(value: unknown): PrivateClassOffer {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    enabled: Boolean(record.enabled),
    price: Math.max(0, sanitizeNumber(record.price, 0)),
    duration: normalizeDuration(record.duration),
    disciplineIds: sanitizeDisciplineIds(record.disciplineIds),
    notes: sanitizeText(record.notes),
    isActive: record.isActive !== false,
  };
}

function buildApiBackedPlan(apiPlan: MembershipApiRecord, existing?: MembershipPlan): MembershipPlan {
  const cycle = normalizeBillingCycle(existing?.billingCycle);

  return {
    idMembershipPlan: apiPlan.idMembership,
    name: sanitizeText(apiPlan.name, existing?.name ?? "Plan sin nombre"),
    description: existing?.description ?? "",
    price: Math.max(0, sanitizeNumber(apiPlan.price, existing?.price ?? 0)),
    disciplinesCount: Math.max(0, sanitizeNumber(apiPlan.disciplinesCount, existing?.disciplineIds.length ?? 0)),
    billingCycle: existing?.billingCycle ?? cycle.value,
    months: existing?.months ?? cycle.months,
    classLimit: existing?.classLimit ?? null,
    unlimited: existing?.unlimited ?? false,
    creditAmount: existing?.creditAmount ?? null,
    rolloverEnabled: existing?.rolloverEnabled ?? false,
    isVisible: existing?.isVisible ?? true,
    isActive: existing?.isActive ?? true,
    benefits: existing?.benefits ?? "",
    disciplineIds: existing?.disciplineIds ?? [],
    createdAt: sanitizeOptionalText(apiPlan.createdAt) ?? existing?.createdAt ?? new Date().toISOString(),
    updatedAt: sanitizeOptionalText(apiPlan.updatedAt) ?? new Date().toISOString(),
    syncSource: "api",
  };
}

export function createDefaultMembershipCatalog(branchId: number | string): BranchMembershipCatalog {
  return {
    branchId,
    plans: [],
    privateClass: defaultPrivateClass(),
    hiddenPlanIds: [],
  };
}

export function loadBranchMembershipCatalog(branchId: number | string): BranchMembershipCatalog {
  const fallback = createDefaultMembershipCatalog(branchId);

  try {
    const raw = localStorage.getItem(key(branchId));
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<BranchMembershipCatalog>;
    return {
      branchId,
      updatedAt: sanitizeOptionalText(parsed.updatedAt),
      plans: sortPlans(Array.isArray(parsed.plans) ? (parsed.plans.map(normalizePlan).filter(Boolean) as MembershipPlan[]) : []),
      privateClass: normalizePrivateClass(parsed.privateClass),
      hiddenPlanIds: sanitizeHiddenPlanIds(parsed.hiddenPlanIds),
    };
  } catch {
    return fallback;
  }
}

export function subscribeToBranchMembershipCatalog(branchId: number | string, onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const expectedKey = key(branchId);
  const expectedBranchId = String(branchId);

  function onStorage(event: StorageEvent) {
    if (event.key === expectedKey) {
      onChange();
    }
  }

  function onMembershipsChanged(event: Event) {
    const customEvent = event as CustomEvent<{ branchId?: string }>;
    if (customEvent.detail?.branchId === expectedBranchId) {
      onChange();
    }
  }

  window.addEventListener("storage", onStorage);
  window.addEventListener(MEMBERSHIPS_EVENT, onMembershipsChanged as EventListener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(MEMBERSHIPS_EVENT, onMembershipsChanged as EventListener);
  };
}

export function saveBranchMembershipCatalog(branchId: number | string, catalog: BranchMembershipCatalog) {
  const next: BranchMembershipCatalog = {
    ...catalog,
    branchId,
    plans: sortPlans(catalog.plans),
    hiddenPlanIds: sanitizeHiddenPlanIds(catalog.hiddenPlanIds),
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(key(branchId), JSON.stringify(next));
  emitMembershipsChanged(branchId);
  return next;
}

export function buildMembershipPlan(
  input: MembershipPlanInput,
  currentId?: number,
  overrides?: Partial<Pick<MembershipPlan, "createdAt" | "updatedAt" | "disciplinesCount" | "syncSource">>
): MembershipPlan {
  const cycle = normalizeBillingCycle(input.billingCycle);
  const timestamp = new Date().toISOString();

  return {
    idMembershipPlan: currentId ?? Date.now(),
    name: input.name.trim(),
    description: input.description.trim(),
    price: Math.max(0, input.price),
    disciplinesCount: overrides?.disciplinesCount ?? input.disciplineIds.length,
    billingCycle: cycle.value,
    months: cycle.months,
    classLimit: input.unlimited ? null : input.classLimit,
    unlimited: input.unlimited,
    creditAmount: input.creditAmount,
    rolloverEnabled: input.rolloverEnabled,
    isVisible: input.isVisible,
    isActive: input.isActive,
    benefits: input.benefits.trim(),
    disciplineIds: input.disciplineIds,
    createdAt: overrides?.createdAt ?? timestamp,
    updatedAt: overrides?.updatedAt ?? timestamp,
    syncSource: overrides?.syncSource ?? "local",
  };
}

export function createMembershipPlan(branchId: number | string, input: MembershipPlanInput) {
  const current = loadBranchMembershipCatalog(branchId);
  const plan = buildMembershipPlan(input);

  return saveBranchMembershipCatalog(branchId, {
    ...current,
    hiddenPlanIds: current.hiddenPlanIds?.filter((item) => item !== plan.idMembershipPlan) ?? [],
    plans: [plan, ...current.plans.filter((item) => item.idMembershipPlan !== plan.idMembershipPlan)],
  });
}

export function upsertMembershipPlan(branchId: number | string, plan: MembershipPlan) {
  const current = loadBranchMembershipCatalog(branchId);

  return saveBranchMembershipCatalog(branchId, {
    ...current,
    hiddenPlanIds: current.hiddenPlanIds?.filter((item) => item !== plan.idMembershipPlan) ?? [],
    plans: [plan, ...current.plans.filter((item) => item.idMembershipPlan !== plan.idMembershipPlan)],
  });
}

export function updateMembershipPlan(
  branchId: number | string,
  idMembershipPlan: number,
  input: MembershipPlanInput,
  overrides?: Partial<Pick<MembershipPlan, "disciplinesCount" | "syncSource">>
) {
  const current = loadBranchMembershipCatalog(branchId);
  const existing = current.plans.find((plan) => plan.idMembershipPlan === idMembershipPlan);

  if (!existing) {
    throw new Error("No encontramos el plan seleccionado.");
  }

  const updated: MembershipPlan = {
    ...buildMembershipPlan(input, idMembershipPlan, {
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      disciplinesCount: overrides?.disciplinesCount ?? existing.disciplinesCount,
      syncSource: overrides?.syncSource ?? existing.syncSource ?? "local",
    }),
  };

  return saveBranchMembershipCatalog(branchId, {
    ...current,
    plans: current.plans.map((plan) => (plan.idMembershipPlan === idMembershipPlan ? updated : plan)),
  });
}

export function removeMembershipPlan(branchId: number | string, idMembershipPlan: number) {
  const current = loadBranchMembershipCatalog(branchId);

  return saveBranchMembershipCatalog(branchId, {
    ...current,
    plans: current.plans.filter((plan) => plan.idMembershipPlan !== idMembershipPlan),
    hiddenPlanIds: current.hiddenPlanIds?.filter((item) => item !== idMembershipPlan) ?? [],
  });
}

export function hideMembershipPlan(branchId: number | string, idMembershipPlan: number) {
  const current = loadBranchMembershipCatalog(branchId);
  const hidden = new Set(current.hiddenPlanIds ?? []);
  hidden.add(idMembershipPlan);

  return saveBranchMembershipCatalog(branchId, {
    ...current,
    plans: current.plans.filter((plan) => plan.idMembershipPlan !== idMembershipPlan),
    hiddenPlanIds: [...hidden],
  });
}

export function mergeApiMembershipCatalog(branchId: number | string, apiPlans: MembershipApiRecord[]) {
  const current = loadBranchMembershipCatalog(branchId);
  const hidden = new Set(current.hiddenPlanIds ?? []);
  const apiIds = new Set(apiPlans.map((item) => item.idMembership));

  const syncedPlans = apiPlans
    .filter((item) => !hidden.has(item.idMembership))
    .map((item) => buildApiBackedPlan(item, current.plans.find((plan) => plan.idMembershipPlan === item.idMembership)));

  const localOnlyPlans = current.plans.filter(
    (plan) => plan.syncSource !== "api" && !apiIds.has(plan.idMembershipPlan) && !hidden.has(plan.idMembershipPlan)
  );

  return saveBranchMembershipCatalog(branchId, {
    ...current,
    plans: [...localOnlyPlans, ...syncedPlans],
  });
}

export function saveMembershipPrivateClass(branchId: number | string, privateClass: PrivateClassOffer) {
  const current = loadBranchMembershipCatalog(branchId);

  return saveBranchMembershipCatalog(branchId, {
    ...current,
    privateClass: normalizePrivateClass(privateClass),
  });
}

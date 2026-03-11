import type { BranchMembershipCatalog, MembershipPlan, MembershipPlanInput, PrivateClassOffer } from "./types";
import { BILLING_CYCLE_OPTIONS } from "./types";

function key(branchId: number | string) {
  return `pampadev:memberships:v1:${branchId}`;
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

export function createDefaultMembershipCatalog(branchId: number | string): BranchMembershipCatalog {
  return {
    branchId,
    plans: [],
    privateClass: defaultPrivateClass(),
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
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : undefined,
      plans: Array.isArray(parsed.plans) ? parsed.plans.map(normalizePlan).filter(Boolean) as MembershipPlan[] : [],
      privateClass: normalizePrivateClass(parsed.privateClass),
    };
  } catch {
    return fallback;
  }
}

function normalizePlan(plan: any): MembershipPlan | null {
  if (!plan || typeof plan !== "object") return null;

  const cycle = BILLING_CYCLE_OPTIONS.find((item) => item.value === plan.billingCycle) ?? BILLING_CYCLE_OPTIONS[0];

  return {
    idMembershipPlan: typeof plan.idMembershipPlan === "number" ? plan.idMembershipPlan : Date.now(),
    name: typeof plan.name === "string" ? plan.name : "",
    description: typeof plan.description === "string" ? plan.description : "",
    price: Number(plan.price ?? 0),
    billingCycle: cycle.value,
    months: typeof plan.months === "number" ? plan.months : cycle.months,
    classLimit: typeof plan.classLimit === "number" ? plan.classLimit : null,
    unlimited: Boolean(plan.unlimited),
    creditAmount: typeof plan.creditAmount === "number" ? plan.creditAmount : null,
    rolloverEnabled: Boolean(plan.rolloverEnabled),
    isVisible: plan.isVisible !== false,
    isActive: plan.isActive !== false,
    benefits: typeof plan.benefits === "string" ? plan.benefits : "",
    disciplineIds: Array.isArray(plan.disciplineIds) ? plan.disciplineIds.filter((item: unknown) => typeof item === "number") : [],
    createdAt: typeof plan.createdAt === "string" ? plan.createdAt : new Date().toISOString(),
    updatedAt: typeof plan.updatedAt === "string" ? plan.updatedAt : undefined,
  };
}

function normalizePrivateClass(value: any): PrivateClassOffer {
  return {
    enabled: Boolean(value?.enabled),
    price: Number(value?.price ?? 0),
    duration: typeof value?.duration === "number" ? value.duration : 60,
    disciplineIds: Array.isArray(value?.disciplineIds)
      ? value.disciplineIds.filter((item: unknown) => typeof item === "number")
      : [],
    notes: typeof value?.notes === "string" ? value.notes : "",
    isActive: value?.isActive !== false,
  };
}

export function saveBranchMembershipCatalog(branchId: number | string, catalog: BranchMembershipCatalog) {
  const next: BranchMembershipCatalog = {
    ...catalog,
    branchId,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(key(branchId), JSON.stringify(next));
  return next;
}

export function buildMembershipPlan(input: MembershipPlanInput, currentId?: number): MembershipPlan {
  const cycle = BILLING_CYCLE_OPTIONS.find((item) => item.value === input.billingCycle) ?? BILLING_CYCLE_OPTIONS[0];
  const timestamp = new Date().toISOString();

  return {
    idMembershipPlan: currentId ?? Date.now(),
    name: input.name.trim(),
    description: input.description.trim(),
    price: input.price,
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
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

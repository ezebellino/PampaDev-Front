import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MembershipPlanInput } from "./types";
import {
  createMembershipPlan,
  hideMembershipPlan,
  loadBranchMembershipCatalog,
  mergeApiMembershipCatalog,
  saveMembershipPrivateClass,
  subscribeToBranchMembershipCatalog,
  updateMembershipPlan,
  upsertMembershipPlan,
} from "./storage";

const branchId = 12;
const otherBranchId = 99;
const basePlan: MembershipPlanInput = {
  name: "Plan Base",
  description: "Tres clases por semana",
  price: 25000,
  billingCycle: "monthly",
  classLimit: 12,
  unlimited: false,
  creditAmount: null,
  rolloverEnabled: false,
  isVisible: true,
  isActive: true,
  benefits: "Reserva anticipada",
  disciplineIds: [1, 2],
};

describe("memberships storage domain", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("creates and updates a branch plan", () => {
    const createdCatalog = createMembershipPlan(branchId, basePlan);
    const createdPlan = createdCatalog.plans[0];

    expect(createdCatalog.plans).toHaveLength(1);
    expect(createdPlan.name).toBe("Plan Base");
    expect(createdPlan.disciplinesCount).toBe(2);

    const updatedCatalog = updateMembershipPlan(branchId, createdPlan.idMembershipPlan, {
      ...basePlan,
      name: "Plan Premium",
      unlimited: true,
      classLimit: null,
    });

    expect(updatedCatalog.plans[0]?.name).toBe("Plan Premium");
    expect(updatedCatalog.plans[0]?.unlimited).toBe(true);
  });

  it("merges linked api memberships while preserving local metadata and hide state", () => {
    createMembershipPlan(branchId, basePlan);

    upsertMembershipPlan(branchId, {
      ...createMembershipPlan(branchId, {
        ...basePlan,
        name: "Plan Sync local meta",
      }).plans[0],
      idMembershipPlan: 77,
      description: "Meta local",
      benefits: "Incluye seguimiento",
      syncSource: "api",
    });

    const merged = mergeApiMembershipCatalog(branchId, [
      {
        idMembership: 77,
        name: "Plan Sync",
        price: 31000,
        disciplinesCount: 3,
        createdAt: "2026-03-21T10:00:00.000Z",
        updatedAt: "2026-03-21T11:00:00.000Z",
      },
    ]);

    const syncedPlan = merged.plans.find((plan) => plan.idMembershipPlan === 77);

    expect(syncedPlan?.syncSource).toBe("api");
    expect(syncedPlan?.description).toBe("Meta local");
    expect(merged.linkedApiPlanIds).toContain(77);

    const hidden = hideMembershipPlan(branchId, 77);
    expect(hidden.plans.some((plan) => plan.idMembershipPlan === 77)).toBe(false);
    expect(hidden.hiddenPlanIds).toContain(77);
  });

  it("does not import global api memberships into unrelated branches", () => {
    upsertMembershipPlan(branchId, {
      idMembershipPlan: 77,
      name: "Plan Branch 12",
      description: "Solo sucursal 12",
      price: 30000,
      disciplinesCount: 2,
      billingCycle: "monthly",
      months: 1,
      classLimit: 8,
      unlimited: false,
      creditAmount: null,
      rolloverEnabled: false,
      isVisible: true,
      isActive: true,
      benefits: "Seguimiento",
      disciplineIds: [1, 2],
      createdAt: "2026-03-21T10:00:00.000Z",
      updatedAt: "2026-03-21T11:00:00.000Z",
      syncSource: "api",
    });

    mergeApiMembershipCatalog(branchId, [
      {
        idMembership: 77,
        name: "Plan API branch 12",
        price: 32000,
        disciplinesCount: 2,
      },
    ]);

    const unrelatedBranch = mergeApiMembershipCatalog(otherBranchId, [
      {
        idMembership: 77,
        name: "Plan API branch 12",
        price: 32000,
        disciplinesCount: 2,
      },
    ]);

    expect(unrelatedBranch.plans).toHaveLength(0);
    expect(unrelatedBranch.linkedApiPlanIds).toEqual([]);
  });

  it("persists private class config and emits sync notifications", () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToBranchMembershipCatalog(branchId, onChange);

    saveMembershipPrivateClass(branchId, {
      enabled: true,
      price: 18000,
      duration: 60,
      disciplineIds: [3],
      notes: "Solo con reserva previa",
      isActive: true,
    });

    const catalog = loadBranchMembershipCatalog(branchId);

    expect(catalog.privateClass.enabled).toBe(true);
    expect(catalog.privateClass.notes).toBe("Solo con reserva previa");
    expect(onChange).toHaveBeenCalled();

    unsubscribe();
  });
});

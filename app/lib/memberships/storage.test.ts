import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MembershipPlanInput } from "./types";
import {
  createMembershipPlan,
  loadBranchMembershipCatalog,
  saveMembershipPrivateClass,
  subscribeToBranchMembershipCatalog,
  updateMembershipPlan,
} from "./storage";

const branchId = 12;
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

    const updatedCatalog = updateMembershipPlan(branchId, createdPlan.idMembershipPlan, {
      ...basePlan,
      name: "Plan Premium",
      unlimited: true,
      classLimit: null,
    });

    expect(updatedCatalog.plans[0]?.name).toBe("Plan Premium");
    expect(updatedCatalog.plans[0]?.unlimited).toBe(true);
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
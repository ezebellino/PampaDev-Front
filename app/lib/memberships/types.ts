export const BILLING_CYCLE_OPTIONS = [
  { value: "monthly", label: "Mensual", months: 1 },
  { value: "quarterly", label: "Trimestral", months: 3 },
  { value: "semiannual", label: "Semestral", months: 6 },
  { value: "annual", label: "Anual", months: 12 },
] as const;

export const PRIVATE_CLASS_DURATION_OPTIONS = [30, 60, 90, 120, 150] as const;

export type BillingCycle = (typeof BILLING_CYCLE_OPTIONS)[number]["value"];
export type PrivateClassDuration = (typeof PRIVATE_CLASS_DURATION_OPTIONS)[number];

export type MembershipPlan = {
  idMembershipPlan: number;
  name: string;
  description: string;
  price: number;
  billingCycle: BillingCycle;
  months: number;
  classLimit: number | null;
  unlimited: boolean;
  creditAmount: number | null;
  rolloverEnabled: boolean;
  isVisible: boolean;
  isActive: boolean;
  benefits: string;
  disciplineIds: number[];
  createdAt: string;
  updatedAt?: string;
};

export type MembershipPlanInput = {
  name: string;
  description: string;
  price: number;
  billingCycle: BillingCycle;
  classLimit: number | null;
  unlimited: boolean;
  creditAmount: number | null;
  rolloverEnabled: boolean;
  isVisible: boolean;
  isActive: boolean;
  benefits: string;
  disciplineIds: number[];
};

export type PrivateClassOffer = {
  enabled: boolean;
  price: number;
  duration: PrivateClassDuration;
  disciplineIds: number[];
  notes: string;
  isActive: boolean;
};

export type BranchMembershipCatalog = {
  branchId: number | string;
  plans: MembershipPlan[];
  privateClass: PrivateClassOffer;
  updatedAt?: string;
};

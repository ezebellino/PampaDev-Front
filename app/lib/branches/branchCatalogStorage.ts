import type { Branch } from "../api/models/branch";

const BRANCHES_STORAGE_KEY = "pampadev:branches:local:v1";

export type BranchCreateInput = {
  address: string;
  description: string;
  idCity: number;
  cityName: string;
  companyName: string;
  idCompany: number;
};

function isBranch(value: unknown): value is Branch {
  if (!value || typeof value !== "object") return false;
  const branch = value as Record<string, unknown>;

  return (
    typeof branch.idBranch === "number" &&
    typeof branch.address === "string" &&
    typeof branch.description === "string" &&
    typeof branch.idCompany === "number" &&
    typeof branch.idCity === "number" &&
    typeof branch.companyName === "string" &&
    typeof branch.cityName === "string" &&
    typeof branch.createdAt === "string"
  );
}

export function readLocalBranches() {
  if (typeof window === "undefined") return [] as Branch[];

  try {
    const raw = window.localStorage.getItem(BRANCHES_STORAGE_KEY);
    if (!raw) return [] as Branch[];

    const parsed = JSON.parse(raw) as unknown[];
    return Array.isArray(parsed) ? parsed.filter(isBranch) : [];
  } catch {
    return [] as Branch[];
  }
}

function writeLocalBranches(branches: Branch[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(branches));
}

export function reconcileLocalBranches(remoteBranches: Branch[]) {
  if (typeof window === "undefined") return;

  const remoteIds = new Set(remoteBranches.map((branch) => branch.idBranch));
  const current = readLocalBranches();
  const next = current.filter((branch) => !remoteIds.has(branch.idBranch));

  if (next.length !== current.length) {
    writeLocalBranches(next);
  }
}

export function createLocalBranch(input: BranchCreateInput, existingBranches: Branch[]) {
  const nextId = existingBranches.reduce((maxId, branch) => Math.max(maxId, branch.idBranch), 0) + 1;

  const newBranch: Branch = {
    idBranch: nextId,
    address: input.address.trim(),
    description: input.description.trim(),
    idCompany: input.idCompany,
    idCity: input.idCity,
    companyName: input.companyName.trim(),
    cityName: input.cityName.trim(),
    createdAt: new Date().toISOString(),
  };

  const current = readLocalBranches();
  writeLocalBranches([...current, newBranch]);
  return newBranch;
}

export function mergeBranches(remoteBranches: Branch[], localBranches = readLocalBranches()) {
  const merged = new Map<number, Branch>();

  for (const branch of localBranches) {
    merged.set(branch.idBranch, branch);
  }

  for (const branch of remoteBranches) {
    merged.set(branch.idBranch, branch);
  }

  return Array.from(merged.values()).sort((a, b) => a.idBranch - b.idBranch);
}

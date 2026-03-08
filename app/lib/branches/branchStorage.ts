const KEY = "pampadev:selected-branch:v1";

export function getSelectedBranchId(): number | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function setSelectedBranchId(idBranch: number) {
  localStorage.setItem(KEY, String(idBranch));
}

export function clearSelectedBranchId() {
  localStorage.removeItem(KEY);
}

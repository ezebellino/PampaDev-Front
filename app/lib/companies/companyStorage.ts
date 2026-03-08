const COMPANY_KEY = "pampadev:companyId:v1";

export function saveSelectedCompanyId(idCompany: number) {
  localStorage.setItem(COMPANY_KEY, String(idCompany));
}

export function getSelectedCompanyId(): number | null {
  const raw = localStorage.getItem(COMPANY_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function clearSelectedCompanyId() {
  localStorage.removeItem(COMPANY_KEY);
}
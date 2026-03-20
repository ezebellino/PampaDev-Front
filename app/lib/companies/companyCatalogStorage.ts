import type { Company } from "../api/models/company";

const COMPANIES_STORAGE_KEY = "pampadev:companies:local:v1";

export type CompanyCreateInput = {
  fantasyName: string;
  tradeName: string;
  cuitCuilDNI: string;
  cityName: string;
  provinceName: string;
  countryName: string;
};

function isCompany(value: unknown): value is Company {
  if (!value || typeof value !== "object") return false;
  const company = value as Record<string, unknown>;

  return (
    typeof company.idCompany === "number" &&
    typeof company.fantasyName === "string" &&
    typeof company.tradeName === "string" &&
    typeof company.cuitCuilDNI === "string" &&
    typeof company.createdAt === "string"
  );
}

export function readLocalCompanies() {
  if (typeof window === "undefined") return [] as Company[];

  try {
    const raw = window.localStorage.getItem(COMPANIES_STORAGE_KEY);
    if (!raw) return [] as Company[];

    const parsed = JSON.parse(raw) as unknown[];
    return Array.isArray(parsed) ? parsed.filter(isCompany) : [];
  } catch {
    return [] as Company[];
  }
}

function writeLocalCompanies(companies: Company[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(companies));
}

export function createLocalCompany(input: CompanyCreateInput, existingCompanies: Company[]) {
  const nextId = existingCompanies.reduce((maxId, company) => Math.max(maxId, company.idCompany), 0) + 1;

  const newCompany: Company = {
    idCompany: nextId,
    fantasyName: input.fantasyName.trim(),
    tradeName: input.tradeName.trim(),
    cuitCuilDNI: input.cuitCuilDNI.trim(),
    cityName: input.cityName.trim(),
    provinceName: input.provinceName.trim(),
    countryName: input.countryName.trim(),
    createdAt: new Date().toISOString(),
  };

  const current = readLocalCompanies();
  writeLocalCompanies([...current, newCompany]);
  return newCompany;
}

export function mergeCompanies(remoteCompanies: Company[], localCompanies = readLocalCompanies()) {
  const merged = new Map<number, Company>();

  for (const company of remoteCompanies) {
    merged.set(company.idCompany, company);
  }

  for (const company of localCompanies) {
    merged.set(company.idCompany, company);
  }

  return Array.from(merged.values()).sort((a, b) => a.idCompany - b.idCompany);
}

export function normalizeRubroKey(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const RUBRO_ALIASES: Record<string, string[]> = {
  padel: ["padel", "cancha padel"],
  futbol: ["futbol", "futbol 5", "futbol 7", "cancha futbol"],
  basquet: ["basquet", "basket", "basketball", "cancha basquet"],
  pilates: ["pilates"],
  yoga: ["yoga"],
  taekwondo: ["taekwondo", "tkd"],
  gym: ["gym", "gimnasio", "sala musculacion", "musculacion"],
};

function tokenize(value: string) {
  return normalizeRubroKey(value)
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildExpectedTerms(rubroId: string | null | undefined, rubroName?: string | null) {
  const terms = new Set<string>();
  const normalizedId = normalizeRubroKey(rubroId);
  const normalizedName = normalizeRubroKey(rubroName);

  if (normalizedId) {
    terms.add(normalizedId);
    for (const alias of RUBRO_ALIASES[normalizedId] ?? []) {
      terms.add(normalizeRubroKey(alias));
    }
  }

  if (normalizedName) {
    terms.add(normalizedName);
  }

  return Array.from(terms).filter(Boolean);
}

export function matchesRubroCandidate(
  rubroId: string | null | undefined,
  rubroName: string | null | undefined,
  candidate: string | null | undefined
) {
  const normalizedCandidate = normalizeRubroKey(candidate);
  if (!normalizedCandidate) return false;

  const expectedTerms = buildExpectedTerms(rubroId, rubroName);
  if (expectedTerms.length === 0) return true;

  const candidateTokens = tokenize(normalizedCandidate);

  return expectedTerms.some((term) => {
    if (!term) return false;
    if (normalizedCandidate === term) return true;
    if (normalizedCandidate.includes(term) || term.includes(normalizedCandidate)) return true;

    const termTokens = tokenize(term);
    return termTokens.every((token) => candidateTokens.includes(token));
  });
}

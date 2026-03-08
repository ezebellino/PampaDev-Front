export function parseJwt(token: string): any | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// En .NET suele venir con este claim:
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export function getRoleFromJwt(token: string): string | null {
  const payload = parseJwt(token);
  if (!payload) return null;

  const role = payload[ROLE_CLAIM] ?? payload["role"];
  if (!role) return null;

  // A veces role viene como array
  return Array.isArray(role) ? role[0] : String(role);
}

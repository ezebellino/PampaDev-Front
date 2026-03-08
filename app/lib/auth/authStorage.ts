const TOKEN_KEY = "pampadev:token:v1";
const USER_KEY = "pampadev:user:v1";

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function saveUser(user: unknown) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getSavedUser<T>() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

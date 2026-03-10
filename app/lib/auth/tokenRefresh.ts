import type { LoginResponse } from "../api/services/auth";
import { getMe, type MeResponse } from "../api/services/users";
import {
  clearToken,
  clearUser,
  getSavedUser,
  getToken,
  saveToken,
  saveUser,
} from "./authStorage";
import { getRoleFromJwt } from "./jwt";
import { ROLES, type Role } from "./roles";
import type { User } from "./authTypes";

export function normalizeRole(apiRole: string): Role {
  const normalized = (apiRole || "").trim().toLowerCase();
  if (normalized === "dev" || normalized === "devs" || normalized === "developer") {
    return ROLES.DEVS;
  }
  if (normalized === "admin" || normalized === "admins") {
    return ROLES.ADMIN;
  }
  if (normalized === "instructor" || normalized === "instructors") {
    return ROLES.INSTRUCTOR;
  }
  return ROLES.USER;
}

export function buildUserFromMeResponse(me: MeResponse): User {
  return {
    id: String(me.idUser),
    name: `${me.firstName} ${me.lastname}`.trim(),
    role: normalizeRole(me.roleName),
    email: me.email,
  };
}

export function buildUserFromLoginResponse(response: LoginResponse): User {
  return {
    id: response.email,
    name: `${response.firstName} ${response.lastname}`.trim(),
    role: normalizeRole(getRoleFromJwt(response.token) ?? ""),
    email: response.email,
  };
}

export function persistSession(token: string, user: User) {
  saveToken(token);
  saveUser(user);
}

export function clearSession() {
  clearToken();
  clearUser();
}

export function getStoredSession() {
  return {
    token: getToken(),
    user: getSavedUser<User>(),
  };
}

export async function refreshCurrentUser() {
  const token = getToken();
  if (!token) return null;

  const me = await getMe();
  const user = buildUserFromMeResponse(me);
  saveUser(user);
  return user;
}

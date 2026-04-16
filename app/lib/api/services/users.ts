import { api, apiGet, apiPut } from "../api";

export type MeResponse = {
  idUser: number;
  firstName: string;
  lastname: string;
  email: string;
  idRole: number;
  roleName: string;
  idCity: number;
  cityName: string;
  createdAt: string;
};

export type CreateUserPayload = {
  firstName: string;
  lastname: string;
  email: string;
  password: string;
  idRole: number;
  idCity: number;
};

export type UpdateUserPayload = {
  firstName: string;
  lastname: string;
  email: string;
  idRole: number;
  idCity: number;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  repeatPassword: string;
};

export function getMe() {
  return apiGet<MeResponse>("/api/Users/me");
}

export function createUserPublic(payload: CreateUserPayload) {
  return api<void>("/api/Users", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export function updateUser(id: number, payload: UpdateUserPayload) {
  return apiPut<void>(`/api/Users/${id}`, payload);
}

export function changePassword(id: number, payload: ChangePasswordPayload) {
  return apiPut<void>(`/api/Users/changePassword/${id}`, payload);
}


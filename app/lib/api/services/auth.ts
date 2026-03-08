import { api } from "../api";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  firstName: string;
  lastname: string;
  email: string;
};

export async function loginApi(payload: LoginPayload) {
  return api<LoginResponse>("/api/Auth/login", {
    method: "POST",
    body: payload,
    headers: { accept: "text/plain" },
  });
}

import type { Role } from "./roles";

export type User = {
  id: string;
  name: string;
  role: Role;
  email: string;
  avatarUrl?: string;
};

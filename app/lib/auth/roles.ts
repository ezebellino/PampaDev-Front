export const ROLES = {
  DEV: "dev",
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
  USER: "user",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

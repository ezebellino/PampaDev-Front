import type { Branch } from "../models/branch";
import { apiGet } from "../api";

export function getBranches() {
  return apiGet<Branch[]>("/api/Branches");
}

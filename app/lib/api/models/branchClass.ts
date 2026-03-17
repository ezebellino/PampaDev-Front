export type BranchClassRecord = {
  id: string;
  rubroId: string;
  date: string; // ISO date string or YYYY-MM-DD
  time: string; // HH:mm or h:mm
  capacity: number;
  available: number;
  instructorId?: string;
  branchId?: number;
} & Record<string, unknown>;

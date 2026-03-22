export type BranchClassRecord = {
  id: string;
  rubroId: string;
  date: string;
  time: string;
  capacity: number;
  available: number;
  instructorId?: string;
  branchId?: number;
  idBranchDiscipline?: number;
  idUser?: number;
  duration?: number;
  creditUsage?: number;
  creditRefund?: number;
  status?: string | number;
  disciplineName?: string;
  bookingSource?: "api" | "planned" | "published";
  syncStatus?: "synced" | "pending-backend";
} & Record<string, unknown>;

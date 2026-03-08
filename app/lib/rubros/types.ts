export type Rubro = {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  basePrice: number;
  tags: string[];
  active: boolean;
};

export type RubroRequest = {
  id: string;
  title: string;
  description?: string;
  requestedBy: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

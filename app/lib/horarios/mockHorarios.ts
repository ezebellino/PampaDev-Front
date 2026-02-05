export type Slot = {
  id: string;
  rubroId: string;
  date: string;      // YYYY-MM-DD
  time: string;      // HH:mm
  capacity: number;  // cupos
  available: number; // cupos disponibles
};

export const mockSlots: Slot[] = [
  // Pádel
  { id: "p1", rubroId: "padel", date: "2026-02-05", time: "18:00", capacity: 4, available: 2 },
  { id: "p2", rubroId: "padel", date: "2026-02-05", time: "19:00", capacity: 4, available: 4 },
  { id: "p3", rubroId: "padel", date: "2026-02-06", time: "20:00", capacity: 4, available: 1 },

  // Fútbol
  { id: "f1", rubroId: "futbol", date: "2026-02-05", time: "21:00", capacity: 10, available: 10 },
  { id: "f2", rubroId: "futbol", date: "2026-02-06", time: "22:00", capacity: 10, available: 6 },

  // Pilates
  { id: "pi1", rubroId: "pilates", date: "2026-02-05", time: "09:00", capacity: 12, available: 8 },
  { id: "pi2", rubroId: "pilates", date: "2026-02-06", time: "10:00", capacity: 12, available: 12 },

  // Gym
  { id: "g1", rubroId: "gym", date: "2026-02-05", time: "17:00", capacity: 20, available: 5 },
];

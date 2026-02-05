export type Rubro = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  basePrice: number; // precio base por turno o sesión
  durationMin: number;
};

export const mockRubros: Rubro[] = [
  {
    id: "pilates",
    name: "Pilates",
    description: "Clases guiadas para fuerza, postura y movilidad.",
    tags: ["bienestar", "movilidad"],
    basePrice: 6500,
    durationMin: 60,
  },
  {
    id: "taekwondo",
    name: "Taekwondo",
    description: "Disciplina, técnica y preparación física.",
    tags: ["artes marciales", "kids"],
    basePrice: 7000,
    durationMin: 60,
  },
  {
    id: "gym",
    name: "Gimnasio",
    description: "Acceso libre + rutinas (según plan).",
    tags: ["fuerza", "salud"],
    basePrice: 9000,
    durationMin: 90,
  },
  {
    id: "padel",
    name: "Pádel",
    description: "Reserva de cancha por franja horaria.",
    tags: ["deporte", "cancha"],
    basePrice: 12000,
    durationMin: 90,
  },
  {
    id: "futbol",
    name: "Fútbol",
    description: "Alquiler de cancha / turnos semanales.",
    tags: ["equipo", "cancha"],
    basePrice: 15000,
    durationMin: 60,
  },
  {
    id: "yoga",
    name: "Yoga",
    description: "Clases grupales para todos los niveles.",
    tags: ["bienestar", "relajación"],
    basePrice: 5500,
    durationMin: 60,
  },
  {
    id: "basquet",
    name: "Básquet",
    description: "Alquiler de cancha y clases grupales.",
    tags: ["equipo", "cancha"],
    basePrice: 13000,
    durationMin: 90,
  }
];

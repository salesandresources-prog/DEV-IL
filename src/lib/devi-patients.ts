export type Patient = {
  id: string;
  nombre: string;
  telefono: string;
  whatsapp: string;
  direccion: string;
  correo: string;
  fechaIngreso: string;
  encargado: string;
};

export const seedPatients: Patient[] = [
  { id: "DV-0001", nombre: "María Restrepo", telefono: "+57 300 445 1120", whatsapp: "+57 300 445 1120", direccion: "Cra 45 #23-11, Medellín", correo: "maria.restrepo@mail.com", fechaIngreso: "2025-11-04", encargado: "Dra. Camila Ruiz" },
  { id: "DV-0002", nombre: "Julián Ospina", telefono: "+57 311 220 8843", whatsapp: "+57 311 220 8843", direccion: "Cl 10 #5-42, Bogotá", correo: "j.ospina@mail.com", fechaIngreso: "2026-01-18", encargado: "Dr. Andrés Mora" },
  { id: "DV-0003", nombre: "Laura Cárdenas", telefono: "+57 320 998 1102", whatsapp: "+57 320 998 1102", direccion: "Av 6N #24-90, Cali", correo: "lcardenas@mail.com", fechaIngreso: "2026-02-02", encargado: "Dra. Camila Ruiz" },
  { id: "DV-0004", nombre: "Sebastián León", telefono: "+57 315 110 7723", whatsapp: "+57 315 110 7723", direccion: "Cra 70 #45-12, Medellín", correo: "sleon@mail.com", fechaIngreso: "2026-03-11", encargado: "Dr. Andrés Mora" },
  { id: "DV-0005", nombre: "Valentina Gómez", telefono: "+57 301 664 2210", whatsapp: "+57 301 664 2210", direccion: "Cl 100 #15-40, Bogotá", correo: "vgomez@mail.com", fechaIngreso: "2026-04-27", encargado: "Dra. Paula Ríos" },
  { id: "DV-0006", nombre: "Andrés Marín", telefono: "+57 313 502 9910", whatsapp: "+57 313 502 9910", direccion: "Cra 33 #12-08, Bucaramanga", correo: "amarin@mail.com", fechaIngreso: "2026-05-14", encargado: "Dra. Paula Ríos" },
  { id: "DV-0007", nombre: "Isabela Torres", telefono: "+57 318 774 6650", whatsapp: "+57 318 774 6650", direccion: "Cl 50 #22-15, Barranquilla", correo: "itorres@mail.com", fechaIngreso: "2026-06-30", encargado: "Dr. Andrés Mora" },
  { id: "DV-0008", nombre: "Camilo Herrera", telefono: "+57 305 219 8801", whatsapp: "+57 305 219 8801", direccion: "Cra 15 #85-20, Bogotá", correo: "cherrera@mail.com", fechaIngreso: "2026-07-08", encargado: "Dra. Camila Ruiz" },
];

const KEY = "devi.patients.v1";

export function loadPatients(): Patient[] {
  if (typeof window === "undefined") return seedPatients;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seedPatients;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedPatients;
  } catch {
    return seedPatients;
  }
}

export function savePatients(list: Patient[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export function nextId(list: Patient[]): string {
  const nums = list
    .map((p) => parseInt(p.id.replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `DV-${String(max + 1).padStart(4, "0")}`;
}
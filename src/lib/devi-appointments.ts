export type Appointment = {
  id: string;
  patientId: string;
  patientName: string;
  fecha: string; // yyyy-mm-dd
  hora: string; // HH:mm
  motivo: string;
  encargado: string;
  estado: "Pendiente" | "Confirmada" | "Cancelada" | "Realizada";
  notas?: string;
};

const KEY = "devi.appointments.v1";

export const seedAppointments: Appointment[] = [
  { id: "CT-0001", patientId: "DV-0001", patientName: "María Restrepo", fecha: "2026-08-02", hora: "09:30", motivo: "Control mensual", encargado: "Dra. Camila Ruiz", estado: "Confirmada" },
  { id: "CT-0002", patientId: "DV-0003", patientName: "Laura Cárdenas", fecha: "2026-08-04", hora: "11:00", motivo: "Primera valoración", encargado: "Dra. Camila Ruiz", estado: "Pendiente" },
  { id: "CT-0003", patientId: "DV-0005", patientName: "Valentina Gómez", fecha: "2026-08-06", hora: "15:15", motivo: "Seguimiento", encargado: "Dra. Paula Ríos", estado: "Pendiente" },
];

export function loadAppointments(): Appointment[] {
  if (typeof window === "undefined") return seedAppointments;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seedAppointments;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedAppointments;
  } catch {
    return seedAppointments;
  }
}

export function saveAppointments(list: Appointment[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export function nextAppointmentId(list: Appointment[]): string {
  const nums = list
    .map((a) => parseInt(a.id.replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `CT-${String(max + 1).padStart(4, "0")}`;
}
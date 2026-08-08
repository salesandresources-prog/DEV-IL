// src/lib/devi-appointments.ts
// Columnas reales en la tabla `citas`: id, cedula, fecha, hora, motivo, encargado, estado

import { getApiBase } from "./api";

export type Appointment = {
  id: string;
  cedula: string;
  fecha: string;
  hora: string;
  motivo: string;
  encargado: string;
  estado: "Pendiente" | "Confirmada" | "Cancelada" | "Realizada";
};

// Tipo enriquecido (solo vive en el frontend, nunca se envía al PHP)
export type EnrichedAppointment = Appointment & {
  patientName: string;
  _phone: string;
};

export async function loadAppointments(): Promise<Appointment[]> {
  try {
    const response = await fetch(`${getApiBase()}/get_appointments.php`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error al cargar citas desde la API:", error);
    return [];
  }
}
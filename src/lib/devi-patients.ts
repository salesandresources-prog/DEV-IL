// src/lib/devi-patients.ts

import { getApiBase } from "./api";

export interface Patient {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  whatsapp: string;
  direccion: string;
  correo: string;
  fechaIngreso: string;
  encargado: string;
}

export async function loadPatients(): Promise<Patient[]> {
  try {
    const response = await fetch(`${getApiBase()}/get_patients.php`);
    if (!response.ok) throw new Error("Error al conectar con la base de datos");

    const data = await response.json();

    return data.map((item: any) => ({
      id: String(item.id),
      nombre: item.nombre,
      cedula: item.cedula,
      telefono: item.telefono,
      whatsapp: item.whatsapp,
      direccion: item.direccion,
      correo: item.correo,
      fechaIngreso: item.fechaIngreso,
      encargado: item.encargado,
    }));
  } catch (error) {
    console.error("Error cargando pacientes:", error);
    return [];
  }
}

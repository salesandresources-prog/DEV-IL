// src/lib/devi-historias.ts

import { getApiBase } from "./api";

export type HistoriaClinica = {
  id: string;
  paciente_id: string; // Puede ser cédula o ID del paciente
  fecha_consulta: string;
  motivo_consulta: string;
  // Refracción
  od_esfera: string;
  od_cilindro: string;
  od_eje: string;
  oi_esfera: string;
  oi_cilindro: string;
  oi_eje: string;
  dip: string;
  diagnostico: string;
  recomendaciones: string;
  proxima_cita: string;
  created_at?: string;
};

export async function loadHistorias(pacienteId?: string): Promise<HistoriaClinica[]> {
  try {
    const url = pacienteId 
      ? `${getApiBase()}/get_historias.php?paciente_id=${encodeURIComponent(pacienteId)}`
      : `${getApiBase()}/get_historias.php`;
      
    const response = await fetch(url);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error al cargar historias desde la API:", error);
    return [];
  }
}

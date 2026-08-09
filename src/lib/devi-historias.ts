// src/lib/devi-historias.ts
import { supabase } from "./supabase";

export interface HistoriaClinica {
  id: string;
  paciente_id: string;
  fecha_consulta: string;
  motivo_consulta: string;
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
}

export async function loadHistorias(): Promise<HistoriaClinica[]> {
  try {
    const { data, error } = await supabase
      .from("historias_clinicas")
      .select("*")
      .order("fecha_consulta", { ascending: false });
    if (error) throw error;

    return data.map((item: any) => ({
      id: String(item.id),
      paciente_id: item.paciente_id || "",
      fecha_consulta: item.fecha_consulta || "",
      motivo_consulta: item.motivo_consulta || "",
      od_esfera: item.od_esfera || "",
      od_cilindro: item.od_cilindro || "",
      od_eje: item.od_eje || "",
      oi_esfera: item.oi_esfera || "",
      oi_cilindro: item.oi_cilindro || "",
      oi_eje: item.oi_eje || "",
      dip: item.dip || "",
      diagnostico: item.diagnostico || "",
      recomendaciones: item.recomendaciones || "",
      proxima_cita: item.proxima_cita || "",
    }));
  } catch (error) {
    console.error("Error cargando historias:", error);
    return [];
  }
}

export async function addHistoria(historia: Omit<HistoriaClinica, "id">) {
  const { error } = await supabase.from("historias_clinicas").insert([
    {
      paciente_id: historia.paciente_id,
      fecha_consulta: historia.fecha_consulta,
      motivo_consulta: historia.motivo_consulta,
      od_esfera: historia.od_esfera,
      od_cilindro: historia.od_cilindro,
      od_eje: historia.od_eje,
      oi_esfera: historia.oi_esfera,
      oi_cilindro: historia.oi_cilindro,
      oi_eje: historia.oi_eje,
      dip: historia.dip,
      diagnostico: historia.diagnostico,
      recomendaciones: historia.recomendaciones,
      proxima_cita: historia.proxima_cita,
    },
  ]);
  if (error) throw error;
}

export async function deleteHistoria(id: string | number) {
  const { error } = await supabase
    .from("historias_clinicas")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

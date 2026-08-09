// src/lib/devi-appointments.ts
import { supabase } from "./supabase";

export interface Appointment {
  id: string;
  cedula: string;
  fecha: string;
  hora: string;
  motivo: string;
  encargado: string;
  estado: string;
}

export interface EnrichedAppointment extends Appointment {
  patientName?: string;
  _phone?: string;
}

export async function loadAppointments(): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase.from('citas').select('*').order('fecha', { ascending: false }).order('hora', { ascending: true });
    if (error) throw error;
    
    return data.map((item: any) => ({
      id: String(item.id),
      cedula: item.cedula || "",
      fecha: item.fecha || "",
      hora: item.hora || "",
      motivo: item.motivo || "",
      encargado: item.encargado || "",
      estado: item.estado || "Pendiente",
    }));
  } catch (error) {
    console.error("Error cargando citas:", error);
    return [];
  }
}

export async function addAppointment(appt: Omit<Appointment, "id">) {
  const { error } = await supabase.from('citas').insert([{
    cedula: appt.cedula,
    fecha: appt.fecha,
    hora: appt.hora,
    motivo: appt.motivo,
    encargado: appt.encargado,
    estado: appt.estado
  }]);
  if (error) throw error;
}

export async function updateAppointment(appt: Appointment) {
  const { error } = await supabase.from('citas').update({
    cedula: appt.cedula,
    fecha: appt.fecha,
    hora: appt.hora,
    motivo: appt.motivo,
    encargado: appt.encargado,
    estado: appt.estado
  }).eq('id', appt.id);
  if (error) throw error;
}

export async function deleteAppointment(id: string | number) {
  const { error } = await supabase.from('citas').delete().eq('id', id);
  if (error) throw error;
}
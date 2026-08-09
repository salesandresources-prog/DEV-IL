// src/lib/devi-patients.ts
import { supabase } from "./supabase";

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
    const { data, error } = await supabase.from('leads').select('*').order('id', { ascending: false });
    if (error) throw error;
    
    return data.map((item: any) => ({
      id: String(item.id),
      nombre: item.nombre || "",
      cedula: item.cedula || "",
      telefono: item.telefono || "",
      whatsapp: item.whatsapp || "",
      direccion: item.direccion || "",
      correo: item.correo || "",
      fechaIngreso: item.fechaIngreso || item.fecha_ingreso || "",
      encargado: item.encargado || "",
    }));
  } catch (error) {
    console.error("Error cargando pacientes:", error);
    return [];
  }
}

export async function addPatient(patient: Omit<Patient, "id">) {
  const { error } = await supabase.from('leads').insert([{
    nombre: patient.nombre,
    cedula: patient.cedula,
    telefono: patient.telefono,
    whatsapp: patient.whatsapp,
    direccion: patient.direccion,
    correo: patient.correo,
    fechaIngreso: patient.fechaIngreso,
    encargado: patient.encargado
  }]);
  if (error) throw error;
}

export async function updatePatient(patient: Patient) {
  const { error } = await supabase.from('leads').update({
    nombre: patient.nombre,
    cedula: patient.cedula,
    telefono: patient.telefono,
    whatsapp: patient.whatsapp,
    direccion: patient.direccion,
    correo: patient.correo,
    fechaIngreso: patient.fechaIngreso,
    encargado: patient.encargado
  }).eq('id', patient.id);
  if (error) throw error;
}

export async function deletePatient(id: string | number) {
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) throw error;
}

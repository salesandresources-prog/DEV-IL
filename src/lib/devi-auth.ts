// src/lib/devi-auth.ts
import { supabase } from "./supabase";

export interface DeviUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

const STORAGE_KEY = "devi.session";

export async function login(user: string, password: string): Promise<DeviUser> {
  console.log("Intentando iniciar sesión con usuario:", user);
  
  // Buscaremos el usuario en la tabla 'users' por username
  let { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", user)
    .maybeSingle();

  // Si no se encuentra por username y parece un correo, intentamos por email
  if (!data && !error && user.includes("@")) {
    const resEmail = await supabase
      .from("users")
      .select("*")
      .eq("email", user)
      .maybeSingle();
    data = resEmail.data;
    error = resEmail.error;
  }

  if (error) {
    console.error("Error detallado de Supabase al buscar usuario:", error);
    
    // Tabla no existe
    if (error.code === "42P01" || (error.message && error.message.includes("relation \"public.users\" does not exist"))) {
      throw new Error("Error de base de datos: La tabla 'users' no existe en tu Supabase. Por favor, ejecuta el script 'supabase_setup.sql' en el editor de SQL de Supabase.");
    }
    
    // Error de red o similar
    throw new Error(`Error de conexión con Supabase (Código ${error.code || 'desconocido'}): ${error.message}`);
  }

  if (!data) {
    throw new Error("Credenciales inválidas o usuario no encontrado");
  }

  // IMPORTANTE: En producción usar auth real de Supabase (auth.signInWithPassword)
  // Aquí hacemos una comparación básica para replicar tu tabla MySQL existente.
  if (data.password !== password) {
    if (data.password.startsWith("$2y$") || data.password.startsWith("$2b$") || data.password.startsWith("$2a$")) {
      console.warn("La contraseña en la base de datos está encriptada con bcrypt. El frontend actual no soporta desencriptado local.");
      throw new Error("Credenciales inválidas (La contraseña de este usuario está encriptada en la base de datos)");
    }
    throw new Error("Credenciales inválidas");
  }

  const deviUser: DeviUser = {
    id: data.id,
    username: data.username,
    email: data.email,
    role: data.role || "user",
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deviUser));
  } catch {}

  return deviUser;
}

export function logout(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem("devi.user");
  } catch {}
}

export function getUser(): DeviUser | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DeviUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}

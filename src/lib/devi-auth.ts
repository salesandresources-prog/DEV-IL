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
  // En Supabase, buscaremos el usuario en la tabla 'users'
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", user)
    .single();

  if (error || !data) {
    throw new Error("Credenciales inválidas o usuario no encontrado");
  }

  // IMPORTANTE: En producción usar auth real de Supabase (auth.signInWithPassword)
  // Aquí hacemos una comparación básica para replicar tu tabla MySQL existente.
  if (data.password !== password) {
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

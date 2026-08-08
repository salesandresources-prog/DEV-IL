// src/lib/devi-auth.ts

import { getApiBase } from "./api";

export interface DeviUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

const STORAGE_KEY = "devi.session";

/**
 * Intenta autenticar al usuario contra la API PHP.
 * Retorna el usuario si es exitoso, o lanza un Error con mensaje descriptivo.
 */
export async function login(user: string, password: string): Promise<DeviUser> {
  const response = await fetch(`${getApiBase()}/login.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, password }),
  });

  if (!response.ok) {
    throw new Error("Error de conexión con el servidor");
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Credenciales inválidas");
  }

  // Guardar sesión en localStorage
  const deviUser: DeviUser = data.user;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deviUser));
  } catch {}

  return deviUser;
}

/** Cierra la sesión actual eliminando datos del localStorage */
export function logout(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem("devi.user"); // limpiar el viejo key también
  } catch {}
}

/** Obtiene el usuario de la sesión actual, o null si no hay sesión */
export function getUser(): DeviUser | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DeviUser;
  } catch {
    return null;
  }
}

/** Verifica si hay una sesión activa */
export function isAuthenticated(): boolean {
  return getUser() !== null;
}

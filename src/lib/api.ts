// src/lib/api.ts
// Módulo centralizado para la URL base de la API.
// Prioriza VITE_API_URL del .env; si no existe, detecta el host dinámicamente
// para que funcione tanto en localhost (PC) como desde la IP (celular).

export function getApiBase(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl as string;

  const host = window.location.hostname;
  return host === "localhost"
    ? "http://localhost/api_devi"
    : `http://${host}/api_devi`;
}

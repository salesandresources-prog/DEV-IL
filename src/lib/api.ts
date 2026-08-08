export function getApiBase(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl as string;

  const host = window.location.hostname;
  if (host === "localhost") {
    return "http://localhost/api_devi";
  }
  
  // Si está publicado en Netlify u otro lado, apunta directamente a tu InfinityFree:
  return "http://devi-leads.site.je";
}
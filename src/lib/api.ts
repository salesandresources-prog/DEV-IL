export function getApiBase(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl as string;

  // Apunta siempre directamente a tu backend en InfinityFree
  return "http://devi-leads.site.je";
}
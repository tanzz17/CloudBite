const defaultProductionBaseUrl = "https://cloudbite-backend.onrender.com";
const rawBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? defaultProductionBaseUrl : "")
).trim();

const sanitizedBaseUrl = rawBaseUrl.replace(/\/+$/, "");
const hasApiSuffix = /\/api$/i.test(sanitizedBaseUrl);

export const API_BASE_URL = hasApiSuffix
  ? sanitizedBaseUrl
  : `${sanitizedBaseUrl}/api`;

export const WS_BASE_URL = API_BASE_URL.replace(/\/api$/i, "");

/** Relative paths and same-origin absolute URLs → current backend base; other https URLs unchanged. */
export const resolveBackendAssetUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const parsed = new URL(url);
      const base = new URL(WS_BASE_URL);
      if (parsed.origin === base.origin) {
        return `${WS_BASE_URL}${parsed.pathname}${parsed.search}`;
      }
      return url;
    } catch {
      return url;
    }
  }
  return `${WS_BASE_URL}/${url.replace(/^\/+/, "")}`;
};

export const apiUrl = (path = "") => {
  if (!path) return API_BASE_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

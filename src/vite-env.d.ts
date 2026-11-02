/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del Backend-API, p. ej. http://127.0.0.1:8000 (ver .env.example). */
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

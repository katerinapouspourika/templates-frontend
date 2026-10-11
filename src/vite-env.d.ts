/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend API. Leave empty to use the same origin (`/api`). */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

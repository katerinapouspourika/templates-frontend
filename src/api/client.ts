import createClient from "openapi-fetch";

import type { paths } from "./schema";

/**
 * Typed client for the backend API.
 *
 * Types come from `schema.d.ts`, generated from the backend's OpenAPI document
 * with `npm run api:generate`. Calls are relative (`/api/...`) by default so the
 * same code works behind the Vite dev proxy, Aspire, and a reverse proxy.
 */
export const api = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
});

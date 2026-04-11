/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ROOMS_API_URL?: string;
  readonly VITE_ADMIN_ROOMS_API_URL?: string;
  readonly VITE_PUBLIC_CURRENCY_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

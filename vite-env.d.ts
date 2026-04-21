/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ROOMS_API_URL?: string;
  readonly VITE_ADMIN_ROOMS_API_URL?: string;
  readonly VITE_PUBLIC_CURRENCY_API_URL?: string;
  readonly VITE_FACEBOOK_URL?: string;
  readonly VITE_ZALO_URL?: string;
  readonly VITE_INSTAGRAM_URL?: string;
  readonly VITE_TIKTOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

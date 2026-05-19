/// <reference types="vite/client" />

// This declaration file extends the existing Vite environment types.
// It tells TypeScript that `import.meta.env` contains the specific
// Cloudflare Turnstile variables used by this demo and package.
//
// By defining these values here, consumers of the package can safely
// access the environment variables without needing to cast `import.meta`.
// This also improves editor autocompletion and static type checking.

interface ImportMetaEnv {
  // The public site key used by the Turnstile widget.
  // This value should be injected at build time by Vite using `define`.
  readonly CLOUDFLARE_TURNSTILE_SITE_KEY: string;

  // The secret key is not used in client code, but is typed here for
  // completeness in the demo environment declarations.
  // It should always remain secret and be used only on the server.
  readonly CLOUDFLARE_TURNSTILE_SECRET_KEY: string;
}

interface ImportMeta {
  // `import.meta.env` is the standard Vite environment object.
  // We extend it so the compiler can resolve the two environment keys above.
  readonly env: ImportMetaEnv;
}

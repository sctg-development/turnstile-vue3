/// <reference types="vite/client" />

// This shim file allows TypeScript to understand `.vue` imports.
// Without this declaration, importing single-file Vue components such as
// `import App from './App.vue'` would raise a compiler error.

declare module "*.vue" {
  import type { defineComponent } from "vue";

  // The default export of a Vue SFC is the result of `defineComponent`.
  // This enables type inference for props, emits, and setup return values.
  const Component: ReturnType<typeof defineComponent>;

  export default Component;
}

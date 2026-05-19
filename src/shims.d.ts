/**
 * TypeScript Declaration File (Shims)
 * 
 * This file is essential for Vue projects using TypeScript. 
 * By default, TypeScript does not understand the structure of '.vue' files (Single File Components).
 * This shim tells the TypeScript compiler (tsc) that any file ending in '.vue' is a valid 
 * module and defines what its default export looks like.
 */

declare module "*.vue" {
    // Import the type definition for a Vue component.
    // 'import type' ensures this is only used for type checking and removed during compilation.
    import type { defineComponent } from "vue";

    /**
     * We define a constant representing the Vue component.
     * ReturnType<typeof defineComponent> dynamically extracts the type that 
     * Vue's 'defineComponent' function returns, ensuring full type safety 
     * for props, data, and methods when importing components in TS files.
     */
    const Component: ReturnType<typeof defineComponent>;

    /**
     * Export the component as the default export.
     * This allows you to write: import MyComponent from './MyComponent.vue'
     * without TypeScript throwing an error that the module cannot be found.
     */
    export default Component;
  }
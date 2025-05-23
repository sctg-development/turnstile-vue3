<template>
    <div ref="turnstile"></div>
</template>

<script setup lang="ts">
/**
 * @component Turnstile
 * @description A Vue3 component that integrates Cloudflare's Turnstile CAPTCHA service.
 * This component handles the loading of the Turnstile script, rendering the widget, and
 * managing the widget's lifecycle events. It supports customization options like theme,
 * size, language, and more.
 * 
 * @example
 * <template>
 *   <Turnstile 
 *     site-key="your-site-key" 
 *     @complete="handleComplete" 
 *     theme="dark" 
 *     size="compact"
 *   />
 * </template>
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

// The URL of the Turnstile API script.
const turnstileSrc = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

// The name of the function that will be called when the Turnstile script is loaded.
const turnstileLoadFunction = '_turnstileCb';

// Ensure that TypeScript knows about the global variables.s
declare global {
    interface Window {
        turnstile: Turnstile.Turnstile;
        [turnstileLoadFunction]: () => void;
    }
}

// The initial state of the Turnstile: 'unloaded' (not loaded), 'loading' (being loaded), or 'ready' (loaded).
let turnstileState = typeof window !== 'undefined' ? (window.turnstile !== undefined ? 'ready' : 'unloaded') : 'unloaded';

/**
 * The promise that resolves when the Turnstile script is loaded.
 * @type {Object}
 * @property {Function} resolve - Function to resolve the promise
 * @property {Function} reject - Function to reject the promise
 */
let turnstileLoad: {
    resolve: () => void;
    reject: (value?: string) => void;
};

/**
 * Interface for the properties of the Turnstile component.
 * @interface TurnstileProps
 */
interface TurnstileProps {
    /**
     * The site key for the Turnstile widget.
     * Obtained from the Cloudflare dashboard.
     * @required
     */
    siteKey: string;
    
    /**
     * The model value (initial value) for the Turnstile token.
     * @required
     */
    modelValue: string;
    
    /**
     * The interval (in ms) before the Turnstile widget is reset.
     * @default 295000 (just under 5 minutes)
     */
    resetInterval?: number;
    
    /**
     * The size of the Turnstile widget.
     * @default 'normal'
     */
    size?: 'normal' | 'flexible' | 'compact';
    
    /**
     * The theme of the Turnstile widget.
     * @default 'auto'
     */
    theme?: 'light' | 'dark' | 'auto';
    
    /**
     * The language of the Turnstile widget.
     * Use a valid language code or 'auto' to detect automatically.
     * @default 'auto'
     */
    language?: string;
    
    /**
     * The action that the Turnstile widget is verifying.
     * Can be used to identify different forms.
     * @default ''
     */
    action?: string;
    
    /**
     * The appearance of the Turnstile widget.
     * @default 'always'
     */
    appearance?: 'always' | 'execute' | 'interaction-only';
    
    /**
     * Whether to render the Turnstile widget when the component is mounted.
     * @default true
     */
    renderOnMount?: boolean;
}

// Properties that can be passed to this component.
const props = withDefaults(defineProps<TurnstileProps>(), {
    resetInterval: 295 * 1000,
    size: 'normal',
    theme: 'auto',
    language: 'auto',
    action: '',
    appearance: 'always',
    renderOnMount: true,
});

/**
 * Custom events emitted by this component.
 */
const emit = defineEmits<{
    /**
     * Update the model value with the new Turnstile token.
     */
    (e: 'update:modelValue', value: string): void;
    /**
     * The Turnstile widget has completed.
     */
    (e: 'complete'): void;
    /**
     * An error occurred.
     */
    (e: 'error', code: string): void;
    /**
     * The Turnstile widget is not supported.
     */
    (e: 'unsupported'): void;
    /**
     * The Turnstile widget has expired.
     */
    (e: 'expired'): void;
    /**
     * The Turnstile widget is about to become interactive.
     */
    (e: 'before-interactive'): void;
    /**
     * The Turnstile widget has become interactive.
     */
    (e: 'after-interactive'): void;
}>();

// A reference to the timeout for resetting the Turnstile widget.
const resetTimeout = ref<ReturnType<typeof setTimeout>>();

// A reference to the ID of the Turnstile widget.
const widgetId = ref<string | undefined>();

// A reference to the container element for the Turnstile widget.
const turnstile = ref<HTMLElement>();

// The options for the Turnstile widget, computed from the props.
const turnstileOptions = computed(() => ({
    sitekey: props.siteKey,
    theme: props.theme,
    language: props.language,
    size: props.size,
    // The callback function for when the user completes the challenge.
    callback,
    action: props.action,
    appearance: props.appearance,
    // The callback function for when an error occurs.
    'error-callback': errorCallback,
    // The callback function for when the widget expires.
    'expired-callback': expiredCallback,
    // The callback function for when the widget is not supported.
    'unsupported-callback': unsupportedCallback,
    // The callback function for when the widget is about to become interactive.
    'before-interactive-callback': beforeInteractiveCallback,
    // The callback function for when the widget becomes interactive.
    'after-interactive-callback': afterInteractiveCallback,
}));

// Callback function for when the user completes the challenge.
function afterInteractiveCallback() {
    emit('after-interactive');
}

// Callback function for when the widget is about to become interactive.
function beforeInteractiveCallback() {
    emit('before-interactive');
}

// Callback function for when the widget expires.
function expiredCallback() {
    emit('expired');
}

// Callback function for when the widget is not supported.
function unsupportedCallback() {
    emit('unsupported');
}

// Callback function for when an error occurs.
function errorCallback(code: string) {
    emit('error', code);
}

// Callback function for when the user completes the challenge.
function callback(token: string) {
    emit('update:modelValue', token);
    emit('complete');
    // Start the reset timeout.
    startResetTimeout();
}

// Reset the Turnstile widget.
function reset() {
    if (window.turnstile) {
        // Clear the model value.
        emit('update:modelValue', '');
        // Reset the Turnstile widget.
        window.turnstile.reset();
    }
}

// Remove the Turnstile widget.
function remove() {
    if (widgetId.value) {
        // Remove the Turnstile widget.
        window.turnstile.remove(widgetId.value);
        // Clear the widget ID.
        widgetId.value = undefined;
    }
}

// Render the Turnstile widget.
function render() {
    if (turnstile.value) {
        // Render the Turnstile widget.
        widgetId.value = window.turnstile.render(turnstile.value, turnstileOptions.value);
    }
}

// Start the reset timeout.
function startResetTimeout() {
    // Validate and sanitizep rops.resetInterval
    const resetInterval = Math.max(0, Math.min(props.resetInterval, 300 * 1000));
    // Clear any existing timeout.
    resetTimeout.value = setTimeout(() => {
        // Reset the Turnstile widget.
        reset();
    }, resetInterval);
}

// When the component is mounted...
onMounted(async () => {
    // Validate and sanitize props (e.g., siteKey)
    const validSiteKeyRegex = /^[a-zA-Z0-9_]{10,}$/;
    if (!validSiteKeyRegex.test(props.siteKey)) {
        throw new Error('Invalid site key');
    }

    // Create a promise that resolves when the Turnstile script is loaded.
    const turnstileLoadPromise = new Promise<void>((resolve, reject) => {
        turnstileLoad = { resolve, reject };
        if (turnstileState === 'ready') resolve();
    });

    // Define the callback function for when the Turnstile script is loaded.
    window[turnstileLoadFunction] = () => {
        // Resolve the promise.
        turnstileLoad.resolve();
        // Update the Turnstile state.
        turnstileState = 'ready';
    };

    // Ensure that the Turnstile script is loaded.
    const ensureTurnstile = () => {
        if (turnstileState === 'unloaded') {
            // Update the Turnstile state.
            turnstileState = 'loading';
            // Create the script element.
            const url = `${turnstileSrc}?onload=${turnstileLoadFunction}&render=explicit`;
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            // Handle errors.
            script.addEventListener('error', () => {
                turnstileLoad.reject('Failed to load Turnstile.');
            });
            // Append the script element.
            document.head.appendChild(script);
        }
        // Return the promise.
        return turnstileLoadPromise;
    };

    // Wait for the Turnstile script to be loaded.
    await ensureTurnstile();

    // If renderOnMount is true, render the Turnstile widget.
    if (props.renderOnMount) {
        render();
    }
});

// When the component is about to be unmounted...
onBeforeUnmount(() => {
    // Remove the Turnstile widget.
    remove();
    // Clear the reset timeout.
    if (resetTimeout.value) {
        clearTimeout(resetTimeout.value);
    }
});
</script>
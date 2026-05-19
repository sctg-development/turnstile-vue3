<template>
  <div class="container">
    <h1>Turnstile Demo</h1>
    <div class="card">
      <!--
        The Turnstile component is the main demo widget.
        It receives the public `siteKey` and emits the `complete`
        event when a user passes the challenge.
        `v-model="token"` binds the generated token to local state.
      -->
      <Turnstile
        :site-key="siteKey"
        @complete="handleSuccess"
        v-model="token"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// Import the Turnstile component from the package and Vue's reactive helper.
import { Turnstile } from '@sctg/turnstile-vue3';
import { ref } from 'vue';

// Reactive storage for the Turnstile token.
// This value is updated automatically when the user completes the widget.
const token = ref<string>('');

// Read the site key from Vite's typed env object.
// This is the clean, type-safe approach for accessing environment values.
const siteKey = import.meta.env.CLOUDFLARE_TURNSTILE_SITE_KEY;

// Called when Turnstile emits the `complete` event.
// In production, send the token to a server endpoint for secure verification.
const handleSuccess = () => {
  console.log('Turnstile token:', token.value);

  // Example request to a backend verification route.
  fetch('/api/verify-captcha', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: token.value }),
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error(error));
};
</script>

<style>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
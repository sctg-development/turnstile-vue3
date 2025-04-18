<template>
  <div class="container">
    <h1>Turnstile Demo</h1>
    <div class="card">
        <Turnstile :site-key="siteKey" @complete="handleSuccess" v-model="token"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Turnstile } from '@sctg/turnstile-vue3';
import { ref } from 'vue';
const token = ref<string | null>(null);
const siteKey = import.meta.env.CLOUDFLARE_TURNSTILE_SITE_KEY;

const handleSuccess = () => {
    console.log('Turnstile token:', token.value);
    // Verify the token on your server using the verifyCaptcha function
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
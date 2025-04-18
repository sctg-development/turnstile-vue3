[![npm version](https://badge.fury.io/js/@sctg%2Fturnstile-vue3.svg)](https://badge.fury.io/js/@sctg%2Fturnstile-vue3)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![build](https://github.com/sctg-development/turnstile-vue3/actions/workflows/publish-npm.yml/badge.svg)](https://github.com/sctg-development/turnstile-vue3/actions/workflows/publish-npm.yml)

# Turnstile Vue3 Component

A Vue3 component for integrating Cloudflare Turnstile into your application.

## Star the project

**If you appreciate my work, please consider giving it a star! 🤩 or a** [![](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/sctg-development)

## Features

- 🔒 Easy integration with Cloudflare Turnstile CAPTCHA
- 🌐 Server-side verification helpers for Express, Cloudflare Pages, and Workers
- 🎨 Customizable appearance (theme, size, language)
- ⚡ Full TypeScript support
- 🔄 Auto-reset functionality
- 🧩 Vue 3 Composition API compatible

## Table of Contents

- [Turnstile Vue3 Component](#turnstile-vue3-component)
  - [Star the project](#star-the-project)
  - [Features](#features)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Verify Captcha on Server](#verify-captcha-on-server)
  - [Cloudflare Pages Function Example](#cloudflare-pages-function-example)
  - [Cloudflare Worker Sample](#cloudflare-worker-sample)
  - [Running the Demo](#running-the-demo)
  - [Requirements](#requirements)
    - [API](#api)
  - [License](#license)
  - [Contributing](#contributing)
  - [Resources](#resources)
  - [Troubleshooting](#troubleshooting)
    - [Widget not rendering](#widget-not-rendering)
    - [Verification always failing](#verification-always-failing)
    - [Token expiring too quickly](#token-expiring-too-quickly)
  - [Disclaimer](#disclaimer)

## Installation

To install the Turnstile Vue3 component, run the following command:

```bash
npm install @sctg/turnstile-vue3
```

## Usage

Here is an example of how to use the Turnstile Vue3 component in your Vue3 application using the Composition API:

```vue
<script setup lang="ts">
import { Turnstile } from '@sctg/turnstile-vue3';
import { ref } from 'vue';

const token = ref<string | null>(null);
const siteKey = 'YOUR_SITE_KEY';

const handleSuccess = () => {
    console.log('Turnstile token:', token.value);
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

<template>
    <div>
        <Turnstile :site-key="siteKey" @complete="handleSuccess" v-model="token" />
    </div>
</template>
```

## Verify Captcha on Server

You can verify the captcha token on your server using the verifyCaptcha function:

```javascript
import express from 'express';
import { verifyCaptcha } from '@sctg/turnstile-vue3';

const app = express();
app.use(express.json());

app.post('/api/verify-captcha', (req, res) => {
    const { token } = req.body;
    const turnstileSecret = 'YOUR_TURNSTILE_SECRET';

    verifyCaptcha(turnstileSecret, token, req.ip)
        .then((data) => {
            if (data.success) {
                res.json({ message: 'Captcha verified successfully' });
            } else {
                res.status(401).json({ message: 'Invalid captcha' });
            }
        })
        .catch((error) => {
            res.status(500).json({ message: 'Error verifying captcha' });
        });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
```

## Cloudflare Pages Function Example

For Cloudflare Pages, you can create a function to handle verification:

```typescript
// filepath: functions/api/verify-captcha.ts
import { verifyCaptcha } from '@sctg/turnstile-vue3';

export async function onRequestPost({ request, env }) {
  const body = await request.json();

  const token = body.token;
  const turnstileSecret = env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  const data = await verifyCaptcha(turnstileSecret, token, request.headers.get('CF-Connecting-IP'))
  if (data.success) {
    return new Response(
      JSON.stringify({ message: 'Captcha verified successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } else {
    return new Response(JSON.stringify({ message: 'Invalid captcha' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
```

## Cloudflare Worker Sample

Here is an example of how to use the verifyCaptcha function in a Cloudflare worker:

```javascript
import { verifyCaptcha } from '@sctg/turnstile-vue3';

addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const { url, method } = request;
    if (method === 'POST' && url.pathname === '/verify-captcha') {
        const { token } = await request.json();
        const turnstileSecret = 'YOUR_TURNSTILE_SECRET';
        
        try {
            const data = await verifyCaptcha(turnstileSecret, token, request.headers.get('CF-Connecting-IP'));
            if (data.success) {
                return new Response('Captcha verified successfully', { status: 200 });
            } else {
                return new Response('Invalid captcha', { status: 401 });
            }
        } catch (error) {
            return new Response('Error verifying captcha', { status: 500 });
        }
    }

    return new Response('Method not allowed', { status: 405 });
}
```

## Running the Demo

The project includes a working demo that shows how to use the component with Cloudflare Pages Functions. The demo features:

- A simple form protected by Turnstile
- Server-side verification using Cloudflare Pages Functions
- Environment variable configuration

To run the demo:

1. Clone the repository
2. Install dependencies:

```bash
cd demo
npm install
```

3. Create a .env file with your Cloudflare Turnstile keys:

```bash
CLOUDFLARE_TURNSTILE_SITE_KEY=your_site_key
CLOUDFLARE_TURNSTILE_SECRET_KEY=your_secret_key
```

4. Start the development server:

```bash
npm run dev:env 
```

5. Open your browser and navigate to `http://localhost:8788`

## Requirements

- Vue 3.x
- TypeScript (recommended but not required)
- A Cloudflare Turnstile account and API keys

### API

The `Turnstile` component has the following props:

- `siteKey`: The site key for your Turnstile account.
- `modelValue`: The initial value for the Turnstile token.
- `resetInterval`: The interval (in milliseconds) before the Turnstile is reset. Default is 295000 (5 minutes).
- `size`: The size of the Turnstile widget. Can be one of the following:

  - `normal`: The default size.
  - `flexible`: A flexible size that adapts to the container.
  - `compact`: A compact size that is smaller than the default size.

- `theme`: The theme of the Turnstile widget. Can be one of the following:

  - `light`: A light theme.
  - `dark`: A dark theme.
  - `auto`: Automatically detects the theme based on the surrounding environment.

- `language`: The language of the Turnstile widget. Can be one of the following:

  - `auto`: Automatically detects the language based on the surrounding environment.
  - A valid language code (e.g., `en`, `fr`, `es`, etc.).

- `action`: The action that the Turnstile widget is verifying. Can be any string.
- `appearance`: The appearance of the Turnstile widget. Can be one of the following:

  - `always`: Always shows the Turnstile widget.
  - `execute`: Shows the Turnstile widget only when the user interacts with the element.
  - `interaction-only`: Shows the Turnstile widget only when the user interacts with the element, and hides it when the interaction is completed.

- `renderOnMount`: Whether to render the Turnstile widget when the component is mounted. Default is `true`.
- `v-model`: A two-way binding for the Turnstile token.

The `Turnstile` component emits the following events:

- `update:modelValue`: Updates the `modelValue` prop with the new Turnstile token.
- `complete`: Emitted when the Turnstile challenge is completed successfully.
- `error`: Emitted when an error occurs.
- `unsupported`: Emitted when the Turnstile widget is not supported.
- `expired`: Emitted when the Turnstile widget has expired.
- `before-interactive`: Emitted when the Turnstile widget is about to become interactive.
- `after-interactive`: Emitted when the Turnstile widget becomes interactive.

## License

This project is licensed under the AGPLv3 license. This means:

- You can use this package in your project
- You must disclose the source code of your application if it uses this library and is accessible over a network
- Any modifications to this library must be released under the same license
- For more details, see the [LICENSE](LICENSE.md) file

If you require a different licensing arrangement for commercial use, please [contact the author](https://github.com/sponsors/sctg-development).

## Contributing

Contributions to this library are welcome! Please open an issue or submit a pull request for any changes you'd like to make.

## Resources

- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Getting Started with Turnstile](https://developers.cloudflare.com/turnstile/get-started/)
- [Server-side Validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)

## Troubleshooting

### Widget not rendering

Ensure your site key is correct and that you've properly configured domains in your Cloudflare dashboard.

### Verification always failing

Check that your secret key is correct and that you're passing the client IP address correctly.

### Token expiring too quickly

Adjust the `resetInterval` prop to match your requirements (default is 5 minutes).

## Disclaimer

This library is not affiliated with Cloudflare. It's just a convenient wrapper around the Turnstile API.

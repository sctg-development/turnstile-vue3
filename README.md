[![npm version](https://badge.fury.io/js/%40sctg%2Fturnstile-vue3)](https://badge.fury.io/js/%40sctg%2Fturnstile-vue3)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![build](https://github.com/sctg-development/sctgdesk-server/actions/workflows/publish-npm.yml/badge.svg)](https://github.com/sctg-development/sctgdesk-server/actions/workflows/publish-npm.yml)


# Turnstile Vue3 Component

A Vue3 component for integrating Cloudflare Turnstile into your application.

Installation
To install the Turnstile Vue3 component, run the following command:

```bash
npm install @sctg/turnstile-vue3
```

## Usage

Here is an example of how to use the Turnstile Vue3 component in your Vue3 application using the Composition API:

```html
<script setup lang="ts">
import { Turnstile } from '@sctg/turnstile-vue3';

const siteKey = 'YOUR_SITE_KEY';
const handleSuccess = (token: string) => {
    // Verify the token on your server using the verifyCaptcha function
    fetch('/api/verify-captcha', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
    })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error(error));
};

</script>

<template>
    <div>
        <Turnstile :site-key="siteKey" @complete="handleSuccess" />
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
            const data = await verifyCaptcha(turnstileSecret, token, request.ip);
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

### API

The `Turnstile` component has the following props:

* `siteKey`: The site key for your Turnstile account.
* `modelValue`: The initial value for the Turnstile token.
* `resetInterval`: The interval (in milliseconds) before the Turnstile is reset. Default is 295000 (5 minutes).
* `size`: The size of the Turnstile widget. Can be one of the following:

* `normal`: The default size.
* `flexible`: A flexible size that adapts to the container.
* `compact`: A compact size that is smaller than the default size.

* `theme`: The theme of the Turnstile widget. Can be one of the following:

* `light`: A light theme.
* `dark`: A dark theme.
* `auto`: Automatically detects the theme based on the surrounding environment.

* `language`: The language of the Turnstile widget. Can be one of the following:

* `auto`: Automatically detects the language based on the surrounding environment.
* A valid language code (e.g., `en`, `fr`, `es`, etc.).

* `action`: The action that the Turnstile widget is verifying. Can be any string.
* `appearance`: The appearance of the Turnstile widget. Can be one of the following:

* `always`: Always shows the Turnstile widget.
* `execute`: Shows the Turnstile widget only when the user interacts with the element.
* `interaction-only`: Shows the Turnstile widget only when the user interacts with the element, and hides it when the interaction is completed.

* `renderOnMount`: Whether to render the Turnstile widget when the component is mounted. Default is `true`.
* `v-model`: A two-way binding for the Turnstile token.

The `Turnstile` component emits the following events:

* `update:modelValue`: Updates the `modelValue` prop with the new Turnstile token.
* `complete`: Emitted when the Turnstile challenge is completed successfully.
* `error`: Emitted when an error occurs.
* `unsupported`: Emitted when the Turnstile widget is not supported.
* `expired`: Emitted when the Turnstile widget has expired.
* `before-interactive`: Emitted when the Turnstile widget is about to become interactive.
* `after-interactive`: Emitted when the Turnstile widget becomes interactive.

## License

This project is licensed under the AGPLv3 license.

## Contributing

Contributions to this library are welcome! Please open an issue or submit a pull request for any changes you'd like to make.

## Disclaimer

This library is not affiliated with Cloudflare. It's just a convenient wrapper around the Turnstile API.

import { verifyCaptcha } from '@sctg/turnstile-vue3';

export async function onRequestPost({ request, env }) {
  const body = await request.json();

  const token  = body.token;
  const turnstileSecret = env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  const data = await verifyCaptcha(turnstileSecret, token, request.ip)
  if (data.success) {
    request.json({ message: 'Captcha verified successfully' });
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
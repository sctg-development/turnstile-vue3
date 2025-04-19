import { verifyCaptcha } from '@sctg/turnstile-vue3';
import { PagesFunction} from '@cloudflare/workers-types';

interface Env {
  CLOUDFLARE_TURNSTILE_SECRET_KEY: string;
}
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) =>{
  const body:{token: string} = await request.json();

  const token  = body.token;
  const turnstileSecret = env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  const cloudflareIp = request.headers.get('CF-Connecting-IP') || "" ;

  const data = await verifyCaptcha(turnstileSecret, token, cloudflareIp)
  if (data.success) {
    return new (Response as any)(
      JSON.stringify({ message: 'Captcha verified successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } else {
    return new (Response)(JSON.stringify({ message: 'Invalid captcha' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env })=>{
  return new (Response as any)(
    JSON.stringify({ message: 'GET request not allowed' }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

export async function onRequestOptions() {
  return new Response(
    JSON.stringify({ message: 'OPTIONS request not allowed' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    },
  );
}
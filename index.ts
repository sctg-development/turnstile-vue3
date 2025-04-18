import Turnstile from "./src/Turnstile.vue";

/**
 * Verifies a Turnstile captcha token by sending it to Cloudflare's verification endpoint.
 * 
 * This function is designed to work in both Node.js and Cloudflare Worker environments.
 * It follows Cloudflare's verification process documented at:
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 * 
 * @param turnstileSecret - Cloudflare Turnstile secret key from your Cloudflare dashboard
 * @param token - The captcha token received from the client-side widget
 * @param connectingIP - The IP address of the connecting client (for additional security validation)
 * 
 * @returns A Promise that resolves to a CaptchaVerifyResponse object
 * 
 * @example
 * // Using in a Node.js Express server
 * app.post('/verify-captcha', async (req, res) => {
 *   const { token } = req.body;
 *   const secret = process.env.TURNSTILE_SECRET;
 *   
 *   try {
 *     const result = await verifyCaptcha(secret, token, req.ip);
 *     if (result.success) {
 *       res.json({ verified: true });
 *     } else {
 *       res.status(400).json({ verified: false, errors: result['error-codes'] });
 *     }
 *   } catch (error) {
 *     res.status(500).json({ error: 'Verification failed' });
 *   }
 * });
 * 
 * @example
 * // Using in a Cloudflare Worker
 * async function handleRequest(request) {
 *   const { token } = await request.json();
 *   const secret = TURNSTILE_SECRET; // Environment variable in Cloudflare Workers
 *   
 *   try {
 *     const result = await verifyCaptcha(secret, token, request.headers.get('CF-Connecting-IP'));
 *     if (result.success) {
 *       return new Response(JSON.stringify({ verified: true }), {
 *         headers: { 'Content-Type': 'application/json' }
 *       });
 *     } else {
 *       return new Response(JSON.stringify({ verified: false, errors: result['error-codes'] }), {
 *         status: 400,
 *         headers: { 'Content-Type': 'application/json' }
 *       });
 *     }
 *   } catch (error) {
 *     return new Response(JSON.stringify({ error: 'Verification failed' }), {
 *       status: 500,
 *       headers: { 'Content-Type': 'application/json' }
 *     });
 *   }
 * }
 */
async function verifyCaptcha(turnstileSecret: string, token: string, connectingIP: string) {
    // Validate the token by calling the
    // "/siteverify" API endpoint.
    let formData = new FormData();
    formData.append("secret", turnstileSecret);
    formData.append("response", token);
    formData.append("remoteip", connectingIP);

    const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const result = await fetch(url, {
      body: formData,
      method: "POST",
    });

    const outcome = await result.json() as any;
    if (outcome.success) { }
    return {
      success: outcome.success,
      challenge_ts: "",
      hostname: "",
    } as CaptchaVerifyResponse
  }

/**
 * Response format from the Cloudflare Turnstile verification API.
 * This format is compatible with hCaptcha's response format for easier migration.
 * 
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/#response-object
 */
export type CaptchaVerifyResponse = {
    /** Whether the verification was successful */
    success: boolean 
    
    /** Timestamp of the challenge (ISO format yyyy-MM-dd'T'HH:mm:ssZZ) */
    challenge_ts: string 
    
    /** The hostname of the site where the challenge was solved */
    hostname: string 
    
    /** Optional: whether the response will be credited */
    credit?: boolean 
    
    /** Optional: any error codes */
    'error-codes'?: CaptchaVerifyError 
    
    /** ENTERPRISE feature: a score denoting malicious activity */
    score?: number 
    
    /** ENTERPRISE feature: reason(s) for score */
    score_reason?: string[] 
  }
export type CaptchaVerifyError = string | string[]
export { verifyCaptcha, Turnstile };
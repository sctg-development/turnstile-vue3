import Turnstile from "./src/Turnstile.vue";

/**
 * 
 * @param turnstileSecret Cloudflare Turnstile secret key
 * @param token The captcha token
 * @param connectingIP The IP address of the connecting client
 * @returns a CaptchaVerifyResponse object with sucess = true if the captcha is valid
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
 * CaptchaVerifyResponse is compatible with hCaptcha's response format.
 */
export type CaptchaVerifyResponse = {
    success: boolean // is the passcode valid, and does it meet security criteria you specified, e.g. sitekey?
    challenge_ts: string // timestamp of the challenge (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
    hostname: string // the hostname of the site where the challenge was solved
    credit?: boolean // optional: whether the response will be credited
    'error-codes'?: CaptchaVerifyError // optional: any error codes
    score?: number // ENTERPRISE feature: a score denoting malicious activity.
    score_reason?: string[] // ENTERPRISE feature: reason(s) for score.
  }
export type CaptchaVerifyError = string | string[]
export { verifyCaptcha, Turnstile };
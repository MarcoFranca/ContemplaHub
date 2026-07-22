const rawPublicSignupEnabled = process.env.NEXT_PUBLIC_PUBLIC_SIGNUP_ENABLED;

export const PUBLIC_SIGNUP_ENABLED = rawPublicSignupEnabled === "true";

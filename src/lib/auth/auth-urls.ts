function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getConfiguredSiteUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  return trimTrailingSlash(envUrl || "http://localhost:3000");
}

export function getSiteUrl() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  return getConfiguredSiteUrl();
}

export function getAuthCallbackUrl() {
  return `${getSiteUrl()}/auth/callback`;
}

export function getSafeNextPath(value?: string | null) {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
}

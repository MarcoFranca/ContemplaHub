import "server-only";

import { headers } from "next/headers";

import { getConfiguredSiteUrl } from "@/lib/auth/auth-urls";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export async function getServerSiteUrl() {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost || headerStore.get("host");
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const origin = headerStore.get("origin");

  if (origin) {
    return trimTrailingSlash(origin);
  }

  if (host) {
    const proto =
      forwardedProto || (host.includes("localhost") ? "http" : "https");
    return trimTrailingSlash(`${proto}://${host}`);
  }

  return getConfiguredSiteUrl();
}

export async function getServerAuthCallbackUrl() {
  return `${await getServerSiteUrl()}/auth/callback`;
}

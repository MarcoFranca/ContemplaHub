// src/components/system/GlobalNetTracker.tsx
"use client";

import * as React from "react";
import { consumePendingPref, type PendingKind } from "@/lib/pendingPref";

function dispatchStart(kind?: PendingKind, label?: string) {
    window.dispatchEvent(new CustomEvent("pending:start", { detail: { kind, label } }));
}
function dispatchStop() {
    window.dispatchEvent(new CustomEvent("pending:stop"));
}

function isRequest(input: RequestInfo | URL): input is Request {
    return typeof Request !== "undefined" && input instanceof Request;
}
function getUrlFromInput(input: RequestInfo | URL): string {
    if (typeof input === "string") return input;
    if (isRequest(input)) return input.url;
    if (input instanceof URL) return input.toString();
    return String(input);
}
function getMethod(input: RequestInfo | URL, init?: RequestInit): string {
    if (init?.method) return init.method.toUpperCase();
    if (isRequest(input) && input.method) return input.method.toUpperCase();
    return "GET";
}
function isInternalUrl(url: string): boolean {
    return url.startsWith("/") || url.startsWith(location.origin);
}
function hasNextActionHeader(h?: HeadersInit): boolean {
    if (!h) return false;
    if (h instanceof Headers) return h.has("Next-Action");
    if (Array.isArray(h)) return h.some(([k]) => k.toLowerCase() === "next-action");
    return Object.keys(h as Record<string, string>).some((k) => k.toLowerCase() === "next-action");
}

export function GlobalNetTracker() {
    React.useEffect(() => {
        /* ---- patch fetch ---- */
        const origFetch = window.fetch;

        window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
            const url = getUrlFromInput(input);
            const method = getMethod(input, init);
            const internal = isInternalUrl(url);
            const serverAction = hasNextActionHeader(init?.headers);

            // preferência custom vinda dos botões (expira em ~2s)
            const pref = consumePendingPref();

            if (serverAction || method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
                dispatchStart(pref?.kind ?? "saving", pref?.label);
            } else if (internal) {
                dispatchStart(pref?.kind ?? "loading", pref?.label);
            }

            try {
                const res = await origFetch(input, init);
                return res;
            } finally {
                dispatchStop();
            }
        };

        /* ---- patch XMLHttpRequest tipado ---- */
        const OrigXHR = window.XMLHttpRequest;

        class XHRPatched extends OrigXHR {
            private __started = false;
            private __kind: PendingKind | undefined;
            private __label: string | undefined;

            override open(
                method: string,
                url: string | URL,
                async = true,
                username?: string | null,
                password?: string | null
            ): void {
                const urlStr = typeof url === "string" ? url : url.toString();
                const pref = consumePendingPref();
                this.__kind = (isInternalUrl(urlStr) ? "loading" : undefined) ?? pref?.kind;
                this.__label = pref?.label;
                super.open(method, urlStr, async, username ?? undefined, password ?? undefined);
            }

            override send(body?: Document | XMLHttpRequestBodyInit | null): void {
                if (!this.__started && this.__kind) {
                    dispatchStart(this.__kind, this.__label);
                    this.__started = true;
                }
                this.addEventListener(
                    "loadend",
                    () => {
                        dispatchStop();
                        this.__started = false;
                        this.__kind = undefined;
                        this.__label = undefined;
                    },
                    { once: true }
                );
                super.send(body ?? null);
            }

            static readonly UNSENT = OrigXHR.UNSENT;
            static readonly OPENED = OrigXHR.OPENED;
            static readonly HEADERS_RECEIVED = OrigXHR.HEADERS_RECEIVED;
            static readonly LOADING = OrigXHR.LOADING;
            static readonly DONE = OrigXHR.DONE;
        }

        const prevXHR: typeof XMLHttpRequest = window.XMLHttpRequest;
        window.XMLHttpRequest = XHRPatched as unknown as typeof XMLHttpRequest;

        return () => {
            window.fetch = origFetch;
            window.XMLHttpRequest = prevXHR;
        };
    }, []);

    return null;
}

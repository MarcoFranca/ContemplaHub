// src/lib/pendingPref.ts
export type PendingKind = "saving" | "loading" | "rendering" | "navigating";

export function setPendingPref(kind?: PendingKind, label?: string) {
    // guarda a preferência para o próximo request (fetch/xhr)
    window.__pendingPref = { kind, label, ts: Date.now() };
}

export function consumePendingPref():
    | { kind?: PendingKind; label?: string }
    | null {
    const pref = window.__pendingPref;
    if (!pref) return null;
    delete window.__pendingPref; // consome uma vez
    return { kind: pref.kind, label: pref.label };
}

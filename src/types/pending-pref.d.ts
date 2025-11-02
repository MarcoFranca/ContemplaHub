// src/types/pending-pref.d.ts
export {};

declare global {
    type PendingKind = "saving" | "loading" | "rendering" | "navigating";

    interface Window {
        __pendingPref?: {
            kind?: PendingKind;
            label?: string;
            ts?: number;
        };
    }
}

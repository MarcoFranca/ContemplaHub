// app/(marketing)/guia-consorcio/api.ts
export type GuideSubmitPayload = {
    landing_hash: string; // landing_pages.public_hash
    nome: string;
    telefone: string;
    email?: string;

    consentimento: true;
    consent_scope: string;

    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;

    referrer_url?: string;
    user_agent?: string;
};

function backendBaseUrl() {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!baseUrl) throw new Error("NEXT_PUBLIC_BACKEND_URL não definido.");
    return baseUrl.replace(/\/$/, "");
}

export async function submitGuideLead(payload: GuideSubmitPayload) {
    const res = await fetch(`${backendBaseUrl()}/api/marketing/guide/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.detail ?? "Falha ao enviar formulário do guia.");
    }

    return (await res.json()) as { lead_id: string };
}

export function downloadGuideUrl(leadId: string) {
    return `${backendBaseUrl()}/api/marketing/guide/download?lead_id=${encodeURIComponent(leadId)}`;
}

/**
 * ADMIN/DEV: dispara build do PDF no backend.
 * Recomendado usar somente em dev/staging (ou atrás de feature flag).
 */
export async function buildGuidePdf(landingHash: string) {
    const token = process.env.NEXT_PUBLIC_INTERNAL_PDF_TOKEN;
    if (!token) {
        throw new Error("NEXT_PUBLIC_INTERNAL_PDF_TOKEN não definido (use apenas em dev/staging).");
    }

    const url = `${backendBaseUrl()}/api/marketing/guide/build-pdf?landing_hash=${encodeURIComponent(landingHash)}`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "X-Internal-Token": token,
        },
    });

    if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.detail ?? "Falha ao gerar PDF.");
    }

    return (await res.json()) as { ok: boolean; bucket: string; path: string; source_url?: string };
}

async function safeJson(res: Response): Promise<any | null> {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

import type { LeadCard, MetaAdsSummary } from "./types";

type MetaAdsFormAnswers = {
    objetivo_consorcio_label?: string | null;
    valor_mensal_pretendido_label?: string | null;
    renda_mensal_label?: string | null;
};

function compactMetaMoneyLabel(value?: string | null): string | null {
    const normalized = value?.trim();
    if (!normalized) return null;

    return normalized
        .replaceAll("R$ 2.000", "R$ 2k")
        .replaceAll("R$ 5.000", "R$ 5k")
        .replaceAll("R$ 10.000", "R$ 10k")
        .replaceAll("R$ 30.000", "R$ 30k")
        .replaceAll(" a ", " – ")
        .replace(/$/, "/mês");
}

export function toCompactMetaMoneyLabel(value?: string | null): string | null {
    return compactMetaMoneyLabel(value);
}

export function getMetaAdsFormAnswers(
    value: unknown
): MetaAdsFormAnswers | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const answers = value as Record<string, unknown>;
    const mapped: MetaAdsFormAnswers = {
        objetivo_consorcio_label:
            typeof answers.objetivo_consorcio_label === "string"
                ? answers.objetivo_consorcio_label
                : null,
        valor_mensal_pretendido_label:
            typeof answers.valor_mensal_pretendido_label === "string"
                ? answers.valor_mensal_pretendido_label
                : null,
        renda_mensal_label:
            typeof answers.renda_mensal_label === "string"
                ? answers.renda_mensal_label
                : null,
    };

    return mapped.objetivo_consorcio_label ||
        mapped.valor_mensal_pretendido_label ||
        mapped.renda_mensal_label
        ? mapped
        : null;
}

export function buildMetaAdsCompactLines(lead: LeadCard): {
    originLine: string | null;
    creativeLine: string | null;
    summaryLine: string | null;
} {
    const summary = lead.meta_ads_summary ?? null;
    const answers = getMetaAdsFormAnswers(lead.meta_ads_form_answers);

    const platformLabel = formatMetaAdsPlatform(summary?.platform ?? lead.channel ?? null);
    const sourceLabel = lead.source_label ?? lead.origem ?? null;
    const originLine = [platformLabel, sourceLabel].filter(Boolean).join(" · ") || null;

    const creativeLine =
        summary?.ad_name ??
        lead.utm_content ??
        summary?.campaign_name ??
        lead.utm_campaign ??
        summary?.form_name ??
        lead.form_label ??
        null;

    const summaryLine = [
        answers?.objetivo_consorcio_label ?? summary?.objetivo_consorcio_label ?? null,
        compactMetaMoneyLabel(
            answers?.valor_mensal_pretendido_label ?? summary?.valor_mensal_pretendido_label ?? null
        ) ??
            answers?.valor_mensal_pretendido_label ??
            summary?.valor_mensal_pretendido_label ??
            null,
    ]
        .filter(Boolean)
        .slice(0, 2)
        .join(" • ") || null;

    return {
        originLine,
        creativeLine,
        summaryLine,
    };
}

export function getMetaAdsCompactDiagnostics(lead: LeadCard): {
    objetivoLabel: string | null;
    investimentoLabel: string | null;
    rendaLabel: string | null;
} {
    const summary = lead.meta_ads_summary ?? null;
    const answers = getMetaAdsFormAnswers(lead.meta_ads_form_answers);

    return {
        objetivoLabel:
            answers?.objetivo_consorcio_label ??
            summary?.objetivo_consorcio_label ??
            null,
        investimentoLabel:
            compactMetaMoneyLabel(
                answers?.valor_mensal_pretendido_label ??
                    summary?.valor_mensal_pretendido_label ??
                    null
            ) ??
            answers?.valor_mensal_pretendido_label ??
            summary?.valor_mensal_pretendido_label ??
            null,
        rendaLabel:
            compactMetaMoneyLabel(
                answers?.renda_mensal_label ??
                    summary?.renda_mensal_label ??
                    null
            ) ??
            answers?.renda_mensal_label ??
            summary?.renda_mensal_label ??
            null,
    };
}

export function hasMetaAdsData(
    lead: Pick<
        LeadCard,
        | "source_label"
        | "form_label"
        | "channel"
        | "utm_campaign"
        | "utm_term"
        | "utm_content"
        | "meta_ads_form_answers"
        | "meta_ads_summary"
    >
): boolean {
    return Boolean(
        lead.source_label ||
        lead.form_label ||
        lead.channel ||
        lead.utm_campaign ||
        lead.utm_term ||
        lead.utm_content ||
        lead.meta_ads_summary ||
        getMetaAdsFormAnswers(lead.meta_ads_form_answers)
    );
}

export function formatMetaAdsPlatform(value?: string | null): string | null {
    const normalized = value?.trim().toLowerCase();
    if (!normalized) return null;

    if (normalized.includes("instagram")) return "Instagram";
    if (normalized.includes("facebook")) return "Facebook";
    if (normalized === "meta_ads" || normalized === "meta") return "Meta Ads";

    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function getMetaAdsSummary(
    summary?: MetaAdsSummary | null
): MetaAdsSummary | null {
    if (!summary) return null;
    return summary;
}

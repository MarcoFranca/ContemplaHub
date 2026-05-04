import { BadgeInfo, FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMetaAdsPlatform, getMetaAdsFormAnswers, getMetaAdsSummary } from "@/app/app/leads/meta-ads";

type LeadMetaRow = {
    source_label?: string | null;
    form_label?: string | null;
    channel?: string | null;
    utm_campaign?: string | null;
    utm_term?: string | null;
    utm_content?: string | null;
};

type DiagnosticLike = {
    extras?: unknown;
};

function InfoItem({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {label}
            </div>
            <p className="mt-2 text-sm font-medium text-foreground break-words">
                {value || "—"}
            </p>
        </div>
    );
}

function extractMetaAdsPayload(diagnostic: DiagnosticLike | null | undefined) {
    if (!diagnostic || typeof diagnostic !== "object") return null;
    const extras =
        diagnostic.extras && typeof diagnostic.extras === "object" && !Array.isArray(diagnostic.extras)
            ? (diagnostic.extras as Record<string, unknown>)
            : null;
    if (!extras) return null;
    const metaAds =
        extras.meta_ads && typeof extras.meta_ads === "object" && !Array.isArray(extras.meta_ads)
            ? (extras.meta_ads as Record<string, unknown>)
            : null;
    if (!metaAds) return null;

    const summary = getMetaAdsSummary({
        objetivo_consorcio_label:
            typeof metaAds.form_answers === "object" && metaAds.form_answers
                ? (metaAds.form_answers as Record<string, unknown>).objetivo_consorcio_label as string | undefined
                : undefined,
        valor_mensal_pretendido_label:
            typeof metaAds.form_answers === "object" && metaAds.form_answers
                ? (metaAds.form_answers as Record<string, unknown>).valor_mensal_pretendido_label as string | undefined
                : undefined,
        renda_mensal_label:
            typeof metaAds.form_answers === "object" && metaAds.form_answers
                ? (metaAds.form_answers as Record<string, unknown>).renda_mensal_label as string | undefined
                : undefined,
        leadgen_id: typeof metaAds.leadgen_id === "string" ? metaAds.leadgen_id : undefined,
        platform: typeof metaAds.platform === "string" ? metaAds.platform : undefined,
        campaign_name: typeof metaAds.campaign_name === "string" ? metaAds.campaign_name : undefined,
        adset_name: typeof metaAds.adset_name === "string" ? metaAds.adset_name : undefined,
        ad_name: typeof metaAds.ad_name === "string" ? metaAds.ad_name : undefined,
        form_name: typeof metaAds.form_name === "string" ? metaAds.form_name : undefined,
    });
    const answers = getMetaAdsFormAnswers(
        typeof metaAds.form_answers === "object" && metaAds.form_answers ? metaAds.form_answers : null
    );

    return { summary, answers };
}

export function LeadMetaAdsCard({
    lead,
    diagnostic,
}: {
    lead: LeadMetaRow;
    diagnostic?: DiagnosticLike | null;
}) {
    const payload = extractMetaAdsPayload(diagnostic);
    const summary = payload?.summary ?? null;
    const answers = payload?.answers ?? null;

    const hasMetaSource = Boolean(
        lead.source_label ||
        lead.form_label ||
        lead.channel ||
        lead.utm_campaign ||
        lead.utm_term ||
        lead.utm_content ||
        summary
    );

    if (!hasMetaSource) {
        return null;
    }

    return (
        <Card className="border-white/10 bg-white/5">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
            <BadgeInfo className="h-4 w-4 text-emerald-300" />
          </span>
                    Origem Meta Ads
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                    <InfoItem label="Plataforma" value={formatMetaAdsPlatform(summary?.platform ?? lead.channel)} />
                    <InfoItem label="Campanha" value={summary?.campaign_name ?? lead.utm_campaign} />
                    <InfoItem label="Conjunto" value={summary?.adset_name ?? lead.utm_term} />
                    <InfoItem label="Anúncio" value={summary?.ad_name ?? lead.utm_content} />
                    <InfoItem label="Formulário" value={summary?.form_name ?? lead.form_label} />
                    <InfoItem label="Meta lead id" value={summary?.leadgen_id} />
                </div>

                {(answers?.objetivo_consorcio_label ||
                    answers?.valor_mensal_pretendido_label ||
                    answers?.renda_mensal_label) ? (
                    <>
                        <Separator className="bg-white/10" />

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <FileText className="h-4 w-4 text-emerald-300" />
                                Diagnóstico inicial do formulário
                            </div>

                            <div className="grid gap-3 md:grid-cols-3">
                                <InfoItem
                                    label="Objetivo declarado"
                                    value={answers?.objetivo_consorcio_label}
                                />
                                <InfoItem
                                    label="Faixa de investimento"
                                    value={answers?.valor_mensal_pretendido_label}
                                />
                                <InfoItem
                                    label="Faixa de renda"
                                    value={answers?.renda_mensal_label}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-4 text-sm text-muted-foreground">
                        Este lead não trouxe respostas enriquecidas do formulário Meta.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// src/app/app/leads/actions.diagnostic.ts
'use server';
import { getCurrentProfile } from '@/lib/auth/server';
import { supabaseServer } from '@/lib/supabase/server';
import { z } from 'zod';
import { diagnosticSchema } from '@/lib/validators/diagnostic';

// ✅ Heurística MVP para o "readiness" do diagnóstico (0..100)
type DiagnosticInput = z.infer<typeof diagnosticSchema>;
async function computeReadiness(p: DiagnosticInput): Promise<number> {
    let score = 0;

    // Campos-chave preenchidos
    const filledKeyCount = ['objetivo', 'valorCartaAlvo', 'prazoAlvoMeses', 'estrategiaLance']
        .reduce((acc, key) => acc + ((p as any)[key] ? 1 : 0), 0);
    if (filledKeyCount >= 3) score += 20;

    // Capacidade financeira preenchida
    if ((p.rendaMensal ?? 0) > 0 && (p.comprometimentoMaxPct ?? 0) > 0) score += 20;

    // Estratégia de lance definida
    if (p.estrategiaLance) score += 10;

    // Ajuste leve por prazo/carta
    if ((p.valorCartaAlvo ?? 0) > 0) score += 10;
    if ((p.prazoAlvoMeses ?? 0) > 0) score += 10;

    // Bonus por renda provada
    if (p.rendaProvada) score += 10;

    // Clamp 0..100
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    return score;
}

export async function getLeadDiagnostic(leadId: string) {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) throw new Error('Org inválida');

    const supabase = await supabaseServer();
    const { data, error } = await supabase
        .from('lead_diagnosticos')
        .select('*')
        .eq('lead_id', leadId)
        .eq('org_id', profile.orgId)
        .maybeSingle();

    if (error) throw error;
    return data; // null | row
}

export async function saveLeadDiagnostic(leadId: string, input: unknown) {
    const profile = await getCurrentProfile();
    if (!profile?.orgId) throw new Error('Org inválida');

    const data = diagnosticSchema.parse(input);
    const readiness = await computeReadiness(data); // ✅ agora existe

    const payload = {
        org_id: profile.orgId,
        lead_id: leadId,
        objetivo: data.objetivo ?? null,
        prazo_meta_meses: data.prazoMetaMeses ?? null,
        preferencia_produto: data.preferenciaProduto ?? null,
        regiao_preferencia: data.regiaoPreferencia ?? null,
        renda_mensal: data.rendaMensal ?? null,
        reserva_inicial: data.reservaInicial ?? null,
        comprometimento_max_pct: data.comprometimentoMaxPct ?? null,
        renda_provada: data.rendaProvada ?? false,
        valor_carta_alvo: data.valorCartaAlvo ?? null,
        prazo_alvo_meses: data.prazoAlvoMeses ?? null,
        estrategia_lance: data.estrategiaLance ?? null,
        lance_base_pct: data.lanceBasePct ?? null,
        lance_max_pct: data.lanceMaxPct ?? null,
        janela_preferida_semanas: data.janelaPreferidaSemanas ?? null,
        readiness_score: readiness,
        consent_scope: data.consentScope ?? null,
        consent_ts: data.consentTs ?? null,
        extras: data.extras ?? null,
    };

    const supabase = await supabaseServer();

    const { data: existing, error: selErr } = await supabase
        .from('lead_diagnosticos')
        .select('id')
        .eq('lead_id', leadId)
        .eq('org_id', profile.orgId)
        .maybeSingle();
    if (selErr) throw selErr;

    if (existing) {
        const { error } = await supabase
            .from('lead_diagnosticos')
            .update(payload)
            .eq('id', existing.id);
        if (error) throw error;
        return { ok: true, updated: true } as const;
    } else {
        const { error } = await supabase
            .from('lead_diagnosticos')
            .insert(payload);
        if (error) throw error;
        return { ok: true, created: true } as const;
    }
}

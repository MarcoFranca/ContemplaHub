import {CanalOrigem} from "@/lib/validators/lead";

export type Stage =
    | "novo"
    | "diagnostico"
    | "proposta"
    | "negociacao"
    | "fechamento"
    | "ativo"
    | "perdido";

export const STAGES: Stage[] = [
    "novo",
    "diagnostico",
    "proposta",
    "negociacao",
    "fechamento",
    "ativo",
    "perdido",
];

export type LeadCard = {
    id: string;
    nome: string;
    etapa: Stage;
    telefone?: string | null;
    email?: string | null;
    origem?: string | null;
    utm_source?: string | null;
    valor_interesse?: string | null;
    created_at?: string | null;
    owner_id?: string | null;
};

export function normalizeOrigem(input?: string | null): CanalOrigem {
    const allowed: CanalOrigem[] = ["lp", "whatsapp", "indicacao", "orgânico", "pago", "outro"];
    const v = (input ?? "").toLowerCase();
    // mapeia variações comuns
    const map: Record<string, CanalOrigem> = {
        "lp": "lp",
        "landing": "lp",
        "whatsapp": "whatsapp",
        "zap": "whatsapp",
        "indicacao": "indicacao",
        "indicação": "indicacao",
        "organico": "orgânico",
        "orgânico": "orgânico",
        "pago": "pago",
        "ads": "pago",
        "outro": "outro",
    };
    const hit = map[v];
    return allowed.includes(hit as CanalOrigem) ? hit : "whatsapp";
}
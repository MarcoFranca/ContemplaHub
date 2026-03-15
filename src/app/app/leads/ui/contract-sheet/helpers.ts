import type {
    AdminOption,
    ProposalScenario,
    ContractFormState,
    LanceFixoOpcaoForm,
} from "./types";
import { EMPTY_CONTRACT_FORM } from "./types";

export function makeOpcao(ordem = 1, percentual = "", observacoes = ""): LanceFixoOpcaoForm {
    return {
        id: crypto.randomUUID(),
        percentual,
        ordem,
        ativo: true,
        observacoes,
    };
}

export function moneyToInput(value?: number | null) {
    if (value == null || Number.isNaN(value)) return "";
    return value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function normalizeAdminIdByName(
    administradoras: AdminOption[],
    administradoraNome?: string | null
) {
    if (!administradoraNome) return "";

    const normalized = administradoraNome
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");

    const found = administradoras.find((item) => {
        const itemName = item.nome
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "");

        return itemName === normalized;
    });

    return found?.id ?? "";
}

export function isApprovedStatus(status?: string | null) {
    const value = (status ?? "").trim().toLowerCase();

    return [
        "aprovada",
        "aprovado",
        "aceita",
        "aceito",
        "fechada",
        "fechado",
    ].includes(value);
}

export function extractMainScenario(detail: any): ProposalScenario | null {
    if (Array.isArray(detail?.payload?.propostas) && detail.payload.propostas.length > 0) {
        return detail.payload.propostas[0];
    }

    if (Array.isArray(detail?.propostas) && detail.propostas.length > 0) {
        return detail.propostas[0];
    }

    if (detail?.payload && typeof detail.payload === "object") {
        const payload = detail.payload;

        if (
            payload.valor_carta != null ||
            payload.prazo_meses != null ||
            payload.administradora != null
        ) {
            return payload as ProposalScenario;
        }
    }

    return null;
}

export function buildPrefillFromProposal(
    proposal: ProposalScenario | null | undefined,
    administradoras: AdminOption[]
): {
    form: ContractFormState;
    usaLanceFixo: boolean;
    opcoesLanceFixo: LanceFixoOpcaoForm[];
} {
    if (!proposal) {
        return {
            form: EMPTY_CONTRACT_FORM,
            usaLanceFixo: false,
            opcoesLanceFixo: [],
        };
    }

    const opcoesLanceFixo: LanceFixoOpcaoForm[] = [];
    if (proposal.lance_fixo_pct_1 != null) {
        opcoesLanceFixo.push(makeOpcao(1, String(proposal.lance_fixo_pct_1), ""));
    }
    if (proposal.lance_fixo_pct_2 != null) {
        opcoesLanceFixo.push(makeOpcao(2, String(proposal.lance_fixo_pct_2), ""));
    }

    const parcelaBase =
        proposal.parcela_reduzida != null
            ? proposal.parcela_reduzida
            : proposal.parcela_cheia != null
                ? proposal.parcela_cheia
                : null;

    return {
        form: {
            administradoraId: normalizeAdminIdByName(administradoras, proposal.administradora),
            numeroCota: "",
            grupoCodigo: "",
            produto:
                proposal.produto && proposal.produto !== "outro"
                    ? proposal.produto
                    : "imobiliario",
            valorCarta: moneyToInput(proposal.valor_carta),
            prazo: proposal.prazo_meses != null ? String(proposal.prazo_meses) : "",
            valorParcela: moneyToInput(parcelaBase),
            formaPagamento: "",
            indiceCorrecao: "",
            dataAdesao: "",
            dataAssinatura: "",
            numero: "",
            parcelaReduzida:
                proposal.com_redutor === true ||
                (proposal.redutor_percent != null && Number(proposal.redutor_percent) > 0) ||
                proposal.parcela_reduzida != null,
            autorizacaoGestao: false,
            fgtsPermitido: proposal.produto === "imobiliario",
            embutidoPermitido: Boolean(proposal.permite_lance_embutido),
        },
        usaLanceFixo: opcoesLanceFixo.length > 0,
        opcoesLanceFixo,
    };
}
import type { LancesCartaDetalhe } from "../../types";

export type InsightTone = "success" | "warning" | "danger" | "neutral";

export type ReadinessItem = {
    key: string;
    label: string;
    ok: boolean;
    hint?: string;
};

export type ExecutiveSummary = {
    titulo: string;
    descricao: string;
    recomendacao: string;
    proximaAcao: string;
    risco: "baixo" | "medio" | "alto";
    tone: InsightTone;
};

function normalizeTipo(
    value?: string | null
): "fixo" | "livre" | "embutido" | "sorteio" | "" {
    const v = (value ?? "").trim().toLowerCase();
    if (v === "fixo") return "fixo";
    if (v === "livre") return "livre";
    if (v === "embutido") return "embutido";
    if (v === "sorteio") return "sorteio";
    return "";
}

export function getStatusMesLabel(status?: string | null) {
    switch (status) {
        case "pendente":
            return "Pendente";
        case "planejado":
            return "Planejado";
        case "feito":
            return "Baixado";
        case "sem_lance":
            return "Sem lance";
        case "contemplada":
            return "Contemplada";
        case "cancelada":
            return "Cancelada";
        default:
            return status || "—";
    }
}

export function getPreferenciaResolvida(data: LancesCartaDetalhe) {
    const preferencial = normalizeTipo(data.cota.tipo_lance_preferencial);
    const fixosAtivos = (data.opcoes_lance_fixo ?? []).filter((op) => op.ativo);

    if (preferencial) return preferencial;
    if (fixosAtivos.length > 0) return "fixo";
    return "sorteio";
}

export function getReadinessItems(data: LancesCartaDetalhe): ReadinessItem[] {
    const temAssembleia = !!data.regra_assembleia?.assembleia_prevista;
    const ativa = data.cota.status === "ativa";
    const autorizada = !!data.cota.autorizacao_gestao;
    const temEstrategia =
        !!data.cota.estrategia?.trim() ||
        !!data.diagnostico?.estrategia_lance?.trim() ||
        !!data.cota.tipo_lance_preferencial?.trim();
    const temModalidade =
        !!data.cota.tipo_lance_preferencial ||
        (data.opcoes_lance_fixo ?? []).some((op) => op.ativo) ||
        data.cota.embutido_permitido ||
        data.cota.fgts_permitido;
    const semPendencia = !(
        data.tem_pendencia_configuracao ??
        !data.regra_assembleia?.assembleia_prevista
    );
    const semContemplacao = !data.contemplacao;

    return [
        {
            key: "status",
            label: "Cota ativa",
            ok: ativa,
            hint: ativa ? "Apta para gestão operacional." : "Cota fora do fluxo normal.",
        },
        {
            key: "assembleia",
            label: "Assembleia definida",
            ok: temAssembleia,
            hint: temAssembleia
                ? "Já existe assembleia prevista para a competência."
                : "Sem assembleia prevista para orientar o timing.",
        },
        {
            key: "autorizacao",
            label: "Gestão autorizada",
            ok: autorizada,
            hint: autorizada
                ? "Pode operar com mais segurança."
                : "Valide autorização antes de avançar.",
        },
        {
            key: "estrategia",
            label: "Estratégia definida",
            ok: temEstrategia,
            hint: temEstrategia
                ? "Existe direcionamento para condução da carta."
                : "Ainda sem direcionamento claro cadastrado.",
        },
        {
            key: "modalidade",
            label: "Modalidade viável",
            ok: temModalidade,
            hint: temModalidade
                ? "Há caminho prático para operar."
                : "Cadastre modalidade ou preferência de lance.",
        },
        {
            key: "pendencia",
            label: "Sem pendência de configuração",
            ok: semPendencia,
            hint: semPendencia
                ? "Base operacional consistente."
                : "Há trava de configuração na carta ou regra.",
        },
        {
            key: "contemplacao",
            label: "Ainda não contemplada",
            ok: semContemplacao,
            hint: semContemplacao
                ? "Segue em gestão para contemplação."
                : "A carta já possui contemplação registrada.",
        },
    ];
}

export function getReadinessScore(data: LancesCartaDetalhe) {
    const items = getReadinessItems(data);
    const okCount = items.filter((item) => item.ok).length;
    return {
        total: items.length,
        okCount,
        percent: Math.round((okCount / items.length) * 100),
    };
}

export function getOperationalRisk(data: LancesCartaDetalhe): "baixo" | "medio" | "alto" {
    if (data.cota.status !== "ativa") return "alto";

    let pontos = 0;
    if (!data.regra_assembleia?.assembleia_prevista) pontos += 2;
    if (!data.cota.autorizacao_gestao) pontos += 1;
    if (
        data.tem_pendencia_configuracao ??
        !data.regra_assembleia?.assembleia_prevista
    ) {
        pontos += 2;
    }
    if (!data.cota.tipo_lance_preferencial && !(data.opcoes_lance_fixo ?? []).some((op) => op.ativo)) {
        pontos += 1;
    }

    if (pontos >= 4) return "alto";
    if (pontos >= 2) return "medio";
    return "baixo";
}

export function getPrimaryRecommendation(data: LancesCartaDetalhe) {
    const preferencia = getPreferenciaResolvida(data);

    if (data.cota.status !== "ativa") {
        return "Tratar status da cota antes de qualquer nova operação.";
    }

    if (data.contemplacao) {
        return "Conduzir a pós-contemplação e a esteira de crédito/documentação.";
    }

    if (!data.regra_assembleia?.assembleia_prevista) {
        return "Regularizar a configuração da assembleia antes de operar o mês.";
    }

    if (!data.cota.autorizacao_gestao) {
        return "Validar autorização de gestão antes de registrar um lance.";
    }

    if (preferencia === "fixo") {
        return "Priorizar lance fixo e confirmar a melhor opção ativa para a assembleia.";
    }

    if (preferencia === "embutido") {
        return "Avaliar lance embutido com cuidado para preservar a utilidade do crédito.";
    }

    if (preferencia === "livre") {
        return "Trabalhar uma faixa de lance livre alinhada ao caixa e ao diagnóstico.";
    }

    return "Manter a carta monitorada para sorteio e evolução estratégica.";
}

export function getNextBestAction(data: LancesCartaDetalhe) {
    if (data.cota.status !== "ativa") return "Revisar a situação da cota.";
    if (data.contemplacao) return "Avançar para documentação, garantias e uso do crédito.";
    if (!data.regra_assembleia?.assembleia_prevista) return "Editar a carta e corrigir a regra operacional.";
    if (!data.cota.autorizacao_gestao) return "Obter autorização de gestão.";
    if (data.controle_mes_atual.status_mes === "feito") return "Revisar resultado e preparar a próxima assembleia.";
    if (data.controle_mes_atual.status_mes === "planejado") return "Converter o planejamento em execução do lance.";
    return "Registrar o direcionamento do mês e preparar a operação da assembleia.";
}

export function buildExecutiveSummary(data: LancesCartaDetalhe): ExecutiveSummary {
    const risco = getOperationalRisk(data);
    const recomendacao = getPrimaryRecommendation(data);
    const proximaAcao = getNextBestAction(data);
    const readiness = getReadinessScore(data);

    if (data.contemplacao) {
        return {
            titulo: "Carta já contemplada",
            descricao:
                "A prioridade deixa de ser contemplar e passa a ser acelerar o uso do crédito com segurança.",
            recomendacao,
            proximaAcao,
            risco,
            tone: "success",
        };
    }

    if (data.cota.status !== "ativa") {
        return {
            titulo: "Carta fora do fluxo ideal",
            descricao:
                "Antes de pensar em lance ou assembleia, é melhor resolver o status contratual e operacional da cota.",
            recomendacao,
            proximaAcao,
            risco: "alto",
            tone: "danger",
        };
    }

    if (readiness.percent >= 80) {
        return {
            titulo: "Carta bem posicionada para operar",
            descricao:
                "A leitura geral indica boa prontidão operacional para conduzir a assembleia com mais clareza.",
            recomendacao,
            proximaAcao,
            risco,
            tone: "success",
        };
    }

    if (readiness.percent >= 50) {
        return {
            titulo: "Carta operável com ressalvas",
            descricao:
                "Há base para conduzir a carta, mas ainda existem pontos que reduzem previsibilidade e segurança.",
            recomendacao,
            proximaAcao,
            risco,
            tone: "warning",
        };
    }

    return {
        titulo: "Carta com baixa prontidão operacional",
        descricao:
            "O momento pede ajuste de base, estratégia e configuração antes de intensificar a gestão do lance.",
        recomendacao,
        proximaAcao,
        risco: "alto",
        tone: "danger",
    };
}

export function getTimelineItems(data: LancesCartaDetalhe) {
    const items: Array<{
        id: string;
        title: string;
        description: string;
        date?: string | null;
        tone?: InsightTone;
    }> = [];

    if (data.cota.data_adesao) {
        items.push({
            id: "adesao",
            title: "Adesão da cota",
            description: "Início da jornada operacional desta carta.",
            date: data.cota.data_adesao,
            tone: "neutral",
        });
    }

    if (data.regra_assembleia?.assembleia_prevista) {
        items.push({
            id: "assembleia",
            title: "Próxima assembleia prevista",
            description: "Marco principal para a estratégia vigente.",
            date: data.regra_assembleia.assembleia_prevista,
            tone: "warning",
        });
    }

    if (data.cota.data_ultimo_lance) {
        items.push({
            id: "ultimo_lance",
            title: "Último lance registrado",
            description: "Último marco relevante de execução.",
            date: data.cota.data_ultimo_lance,
            tone: "neutral",
        });
    }

    if (data.contemplacao?.data) {
        items.push({
            id: "contemplacao",
            title: "Contemplação",
            description: `Carta contemplada por ${data.contemplacao.motivo ?? "lance"}.`,
            date: data.contemplacao.data,
            tone: "success",
        });
    }

    return items.sort((a, b) => {
        const ad = a.date ? new Date(`${a.date}T00:00:00`).getTime() : 0;
        const bd = b.date ? new Date(`${b.date}T00:00:00`).getTime() : 0;
        return ad - bd;
    });
}
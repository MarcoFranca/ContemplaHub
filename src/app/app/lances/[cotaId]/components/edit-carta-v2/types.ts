export type EditCartaSheetInitialData = {
    cotaId: string;
    clienteNome?: string | null;
    administradoraNome?: string | null;
    competencia?: string | null;

    geral: {
        grupoCodigo: string;
        numeroCota: string;
        produto: string;
        status: string;
        dataAdesao?: string | null;
        prazo: number | null;
        valorCarta: number | null;
        valorParcela: number | null;
    };

    estrategia: {
        objetivo?: string | null;
        estrategia?: string | null;
        tipoLancePreferencial?: "livre" | "fixo" | "embutido" | "sorteio" | "" | null;
        autorizacaoGestao: boolean;
    };

    modalidades: {
        embutidoPermitido: boolean;
        embutidoMaxPercent: number | null;
        fgtsPermitido: boolean;
        opcoesLanceFixo: Array<{
            id?: string;
            ordem: number;
            percentual?: number | null;
            ativo: boolean;
            observacoes?: string | null;
        }>;
    };

    operacao: {
        assembleiaDia?: number | null;
        assembleiaDiaOrigem?: string | null;
        statusMes?:
            | "pendente"
            | "planejado"
            | "feito"
            | "sem_lance"
            | "contemplada"
            | "cancelada"
            | null;
        observacoes?: string | null;
        dataUltimoLance?: string | null;
    };
};
import type { EditCartaSheetInitialData } from "@/app/app/lances/[cotaId]/components/edit-carta-v2/types";

export function getEmptyCartaData(): EditCartaSheetInitialData {
    return {
        cotaId: "",
        clienteNome: null,
        administradoraNome: null,
        competencia: null,

        geral: {
            grupoCodigo: "",
            numeroCota: "",
            produto: "imobiliario",
            status: "ativa",
            dataAdesao: null,
            prazo: null,
            valorCarta: 0,
            valorParcela: 0,
        },

        estrategia: {
            objetivo: "",
            estrategia: "",
            tipoLancePreferencial: "sorteio",
            autorizacaoGestao: false,
        },

        modalidades: {
            embutidoPermitido: false,
            embutidoMaxPercent: null,
            fgtsPermitido: false,
            opcoesLanceFixo: [],
        },

        operacao: {
            assembleiaDia: null,
            assembleiaDiaOrigem: null,
            statusMes: "pendente",
            observacoes: "",
            dataUltimoLance: null,
        },
    };
}
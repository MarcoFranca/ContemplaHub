import { pgEnum } from "drizzle-orm/pg-core";

export const perfilPsico = pgEnum("perfil_psico", [
    "disciplinado_acumulador",
    "sonhador_familiar",
    "corporativo_racional",
    "impulsivo_emocional",
    "estrategico_oportunista",
    "nao_informado",
    "conservador",
    "moderado",
    "arrojado",
]);

export const leadStage = pgEnum("lead_stage", [
    "novo","diagnostico","proposta","negociacao","fechamento","ativo","perdido",
]);

export const canalOrigem = pgEnum("canal_origem", [
    "lp","whatsapp","indicacao","orgânico","pago","outro",
]);

export const dealStatus = pgEnum("deal_status", ["aberto","ganho","perdido"]);

export const atividadeTipo = pgEnum("atividade_tipo", [
    "whatsapp","ligacao","email","reuniao","anotacao","tarefa",
]);

export const lanceTipo = pgEnum("lance_tipo", ["livre","embutido","fixo"]);

export const pagamentoTipo = pgEnum("pagamento_tipo", [
    "parcela","taxa_adesao","taxa_admin","outro",
]);

export const contemplacaoMotivo = pgEnum("contemplacao_motivo", [
    "lance","sorteio","outro",
]);

export const produtoEnum = pgEnum("produto", ["imobiliario","auto"]);

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getLeadCadastroPFByProposta } from "./cadastro-pf-data";
import { CadastroPFCardClient } from "./CadastroPFCardClient";

type Props = {
    propostaId: string;
    clienteNome?: string;
    clienteTelefone?: string;
};

export async function CadastroPFCard({
                                         propostaId,
                                         clienteNome,
                                         clienteTelefone,
                                     }: Props) {
    console.log("[CadastroPFCard] propostaId:", propostaId);
    const data = await getLeadCadastroPFByProposta(propostaId);
    console.log("[CadastroPFCard] data carregada:", JSON.stringify(data, null, 2));


    // 1) Se nem cadastro existe, aí sim mostra só aviso
    if (!data || !data.cadastro) {
        console.log("[CadastroPFCard] sem cadastro, mostrando estado vazio");
        return (
            <Card className="bg-slate-950/80 border-dashed border-slate-800">
                <CardHeader>
                    <CardTitle className="text-sm md:text-base flex items-center justify-between gap-2">
                        <span>Ficha cadastral – Pessoa Física</span>
                        <span className="text-[11px] rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-amber-300">
              Cadastro ainda não gerado
            </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-slate-400">
                        Esta proposta ainda não possui um cadastro vinculado.
                        Gere o cadastro pelo fluxo de proposta para liberar o formulário público.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // 2) Se o cadastro existe, garantimos um PF "safe" mesmo que o registro PF ainda não exista
    const pfSafe = data.pf ?? {
        nome_completo: null,
        cpf: null,
        data_nascimento: null,
        estado_civil: null,
        nome_conjuge: null,
        cpf_conjuge: null,
        email: null,
        telefone_fixo: null,
        celular: null,
        rg_numero: null,
        rg_orgao_emissor: null,
        rg_data_emissao: null,
        cidade_nascimento: null,
        nome_mae: null,
        profissao: null,
        renda_mensal: null,
        cep: null,
        endereco: null,
        numero: null,
        complemento: null,
        bairro: null,
        cidade: null,
        uf: null,
        forma_pagamento: null,
        banco_devolucao: null,
        agencia_devolucao: null,
        conta_devolucao: null,
        extra_json: null,
    };

    // monta a URL pública do formulário de cadastro
    const baseUrlEnv =
        process.env.NEXT_PUBLIC_APP_URL ??
        process.env.NEXT_PUBLIC_SITE_URL ??
        (process.env.NEXT_PUBLIC_VERCEL_URL
            ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
            : undefined);

    const publicUrl =
        baseUrlEnv && data.cadastro.token_publico
            ? `${baseUrlEnv}/cadastro/${data.cadastro.token_publico}`
            : undefined;

    return (
        <CadastroPFCardClient
            cadastro={data.cadastro}
            pf={pfSafe}
            publicUrl={publicUrl}
            clienteNome={clienteNome}
            clienteTelefone={clienteTelefone}
        />
    );
}

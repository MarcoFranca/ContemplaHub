// src/app/cadastro/[token]/CadastroPFForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

import {
    maskPhoneBR,
    unformatPhoneBR,
    maskMoneyBRCents,
    parseMoneyBRCents,
} from "@/lib/masks";

function maskCEP(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5)}`;
}

type Props = {
    token: string;
};

type FormaPagamento = "" | "boleto" | "cartao_credito" | "debito_automatico";

type FormState = {
    // DADOS PESSOAIS
    nome_completo: string;
    cpf: string;
    data_nascimento: string;
    estado_civil: string;

    // CÔNJUGE
    cpf_conjuge: string;
    nome_conjuge: string;

    // CONTATO
    email: string;
    telefone_fixo: string;
    telefone_celular: string;

    // DOCUMENTO IDENTIDADE
    rg_numero: string;
    rg_orgao_emissor: string;
    rg_data_emissao: string;

    // NASCIMENTO / FILIAÇÃO
    cidade_nascimento: string;
    nome_mae: string;

    // PROFISSÃO / RENDA
    profissao: string;
    renda_mensal: string; // "1.234,56"

    // ENDEREÇO
    cep: string;
    endereco: string;
    bairro: string;
    cidade: string;
    uf: string;

    // FORMA PAGAMENTO
    forma_pagamento: FormaPagamento;

    // CONTA DEVOLUÇÃO
    banco_devolucao: string;
    agencia_devolucao: string;
    conta_devolucao: string;

    // LIVRE
    observacoes: string;
};

export function CadastroPFForm({ token }: Props) {
    console.log("CadastroPFForm token prop:", token);
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<FormState>({
        nome_completo: "",
        cpf: "",
        data_nascimento: "",
        estado_civil: "",
        cpf_conjuge: "",
        nome_conjuge: "",
        email: "",
        telefone_fixo: "",
        telefone_celular: "",
        rg_numero: "",
        rg_orgao_emissor: "",
        rg_data_emissao: "",
        cidade_nascimento: "",
        nome_mae: "",
        profissao: "",
        renda_mensal: "",
        cep: "",
        endereco: "",
        bairro: "",
        cidade: "",
        uf: "",
        forma_pagamento: "",
        banco_devolucao: "",
        agencia_devolucao: "",
        conta_devolucao: "",
        observacoes: "",
    });

    function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const rendaNumero = parseMoneyBRCents(form.renda_mensal);

            const payload = {
                nome_completo: form.nome_completo,
                cpf: form.cpf,
                data_nascimento: form.data_nascimento || null,
                estado_civil: form.estado_civil || null,
                cpf_conjuge: form.cpf_conjuge || null,
                nome_conjuge: form.nome_conjuge || null,
                email: form.email,
                telefone_fixo: unformatPhoneBR(form.telefone_fixo) || null,
                telefone_celular: unformatPhoneBR(form.telefone_celular),
                rg_numero: form.rg_numero || null,
                rg_orgao_emissor: form.rg_orgao_emissor || null,
                rg_data_emissao: form.rg_data_emissao || null,
                cidade_nascimento: form.cidade_nascimento || null,
                nome_mae: form.nome_mae || null,
                profissao: form.profissao || null,
                renda_mensal: rendaNumero,
                cep: form.cep,
                endereco: form.endereco,
                bairro: form.bairro,
                cidade: form.cidade,
                uf: form.uf,
                forma_pagamento: form.forma_pagamento || null,
                banco_devolucao: form.banco_devolucao || null,
                agencia_devolucao: form.agencia_devolucao || null,
                conta_devolucao: form.conta_devolucao || null,
                observacoes: form.observacoes || null,
            };

            const res = await fetch(`/api/cadastro/${token}/pf`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                console.error("Erro ao salvar cadastro PF:", await res.text());
                throw new Error("Falha ao salvar seus dados.");
            }

            toast.success("Dados enviados com sucesso! 😊");
            // router.push("/cadastro/obrigado");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Não foi possível enviar seus dados.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Dados pessoais */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-sm font-semibold text-slate-100">Dados pessoais</h2>
                    <p className="text-xs text-slate-400">
                        Informações básicas para análise de crédito e emissão do contrato.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1 md:col-span-2">
                        <Label htmlFor="nome_completo">Nome completo</Label>
                        <Input
                            id="nome_completo"
                            autoComplete="name"
                            value={form.nome_completo}
                            onChange={(e) => handleChange("nome_completo", e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="cpf">CPF</Label>
                        <Input
                            id="cpf"
                            inputMode="numeric"
                            value={form.cpf}
                            onChange={(e) => handleChange("cpf", e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                        <Input
                            id="data_nascimento"
                            type="date"
                            value={form.data_nascimento}
                            onChange={(e) => handleChange("data_nascimento", e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="estado_civil">Estado Civil</Label>
                        <Input
                            id="estado_civil"
                            placeholder="Solteiro(a), Casado(a), União estável..."
                            value={form.estado_civil}
                            onChange={(e) => handleChange("estado_civil", e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* 2. Dados do cônjuge */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-sm font-semibold text-slate-100">Dados do cônjuge</h2>
                    <p className="text-xs text-slate-400">
                        Preencha apenas se for casado(a) ou em união estável.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <Label htmlFor="nome_conjuge">Nome do cônjuge</Label>
                        <Input
                            id="nome_conjuge"
                            value={form.nome_conjuge}
                            onChange={(e) => handleChange("nome_conjuge", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="cpf_conjuge">CPF do cônjuge</Label>
                        <Input
                            id="cpf_conjuge"
                            inputMode="numeric"
                            value={form.cpf_conjuge}
                            onChange={(e) => handleChange("cpf_conjuge", e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* 3. Contato */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-sm font-semibold text-slate-100">Contato</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="telefone_fixo">Telefone fixo com DDD</Label>
                        <Input
                            id="telefone_fixo"
                            inputMode="tel"
                            value={form.telefone_fixo}
                            onChange={(e) =>
                                handleChange("telefone_fixo", maskPhoneBR(e.target.value))
                            }
                            placeholder="(21) 0000-0000"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="telefone_celular">Celular com DDD</Label>
                        <Input
                            id="telefone_celular"
                            inputMode="tel"
                            value={form.telefone_celular}
                            onChange={(e) =>
                                handleChange("telefone_celular", maskPhoneBR(e.target.value))
                            }
                            placeholder="(21) 99999-9999"
                            required
                        />
                    </div>
                </div>
            </section>

            {/* 4. Documento de identidade */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-sm font-semibold text-slate-100">
                        Documento de identidade
                    </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                        <Label htmlFor="rg_numero">RG</Label>
                        <Input
                            id="rg_numero"
                            value={form.rg_numero}
                            onChange={(e) => handleChange("rg_numero", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="rg_orgao_emissor">Órgão Emissor</Label>
                        <Input
                            id="rg_orgao_emissor"
                            value={form.rg_orgao_emissor}
                            onChange={(e) => handleChange("rg_orgao_emissor", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="rg_data_emissao">Data de Emissão</Label>
                        <Input
                            id="rg_data_emissao"
                            type="date"
                            value={form.rg_data_emissao}
                            onChange={(e) =>
                                handleChange("rg_data_emissao", e.target.value)
                            }
                        />
                    </div>
                </div>
            </section>

            {/* 5. Nascimento e filiação */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-sm font-semibold text-slate-100">
                        Nascimento e filiação
                    </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <Label htmlFor="cidade_nascimento">Cidade de Nascimento</Label>
                        <Input
                            id="cidade_nascimento"
                            value={form.cidade_nascimento}
                            onChange={(e) =>
                                handleChange("cidade_nascimento", e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="nome_mae">Nome da mãe</Label>
                        <Input
                            id="nome_mae"
                            value={form.nome_mae}
                            onChange={(e) => handleChange("nome_mae", e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* 6. Profissão e renda */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-sm font-semibold text-slate-100">
                        Profissão e renda
                    </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <Label htmlFor="profissao">Profissão</Label>
                        <Input
                            id="profissao"
                            value={form.profissao}
                            onChange={(e) => handleChange("profissao", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="renda_mensal">Renda Mensal (R$)</Label>
                        <Input
                            id="renda_mensal"
                            inputMode="numeric"
                            value={form.renda_mensal}
                            onChange={(e) =>
                                handleChange("renda_mensal", maskMoneyBRCents(e.target.value))
                            }
                            placeholder="Ex.: 5.000,00"
                        />
                    </div>
                </div>
            </section>

            {/* 7. Endereço residencial */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-sm font-semibold text-slate-100">
                        Endereço residencial
                    </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                        <Label htmlFor="cep">CEP</Label>
                        <Input
                            id="cep"
                            inputMode="numeric"
                            value={form.cep}
                            onChange={(e) => handleChange("cep", maskCEP(e.target.value))}
                            placeholder="24220-331"
                        />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <Label htmlFor="endereco">Endereço Residencial</Label>
                        <Input
                            id="endereco"
                            value={form.endereco}
                            onChange={(e) => handleChange("endereco", e.target.value)}
                            placeholder="Rua, número e complemento"
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input
                            id="bairro"
                            value={form.bairro}
                            onChange={(e) => handleChange("bairro", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input
                            id="cidade"
                            value={form.cidade}
                            onChange={(e) => handleChange("cidade", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="uf">UF</Label>
                        <Input
                            id="uf"
                            value={form.uf}
                            maxLength={2}
                            onChange={(e) =>
                                handleChange("uf", e.target.value.toUpperCase())
                            }
                            placeholder="RJ"
                        />
                    </div>
                </div>
            </section>

            {/* 8. Forma de pagamento das parcelas */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-sm font-semibold text-slate-100">
                        Opção de pagamento das parcelas
                    </h2>
                    <p className="text-xs text-slate-400">
                        A modalidade poderá ser confirmada com você antes da contratação.
                    </p>
                </div>

                <div className="max-w-xs space-y-1">
                    <Label htmlFor="forma_pagamento">Forma de pagamento</Label>
                    <Select
                        value={form.forma_pagamento}
                        onValueChange={(v) =>
                            handleChange("forma_pagamento", v as FormaPagamento)
                        }
                    >
                        <SelectTrigger id="forma_pagamento">
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="boleto">Boleto bancário</SelectItem>
                            <SelectItem value="cartao_credito">Cartão de crédito</SelectItem>
                            <SelectItem value="debito_automatico">
                                Débito automático (após a 1ª parcela)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </section>

            {/* 9. Conta para devolução */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-sm font-semibold text-slate-100">
                        Conta corrente para devolução
                    </h2>
                    <p className="text-xs text-slate-400">
                        Usada apenas em caso de devolução de valores, se necessário.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                        <Label htmlFor="banco_devolucao">Banco</Label>
                        <Input
                            id="banco_devolucao"
                            value={form.banco_devolucao}
                            onChange={(e) =>
                                handleChange("banco_devolucao", e.target.value)
                            }
                            placeholder="Ex.: 260 - Nubank"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="agencia_devolucao">Agência</Label>
                        <Input
                            id="agencia_devolucao"
                            value={form.agencia_devolucao}
                            onChange={(e) =>
                                handleChange("agencia_devolucao", e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="conta_devolucao">Conta (com dígito)</Label>
                        <Input
                            id="conta_devolucao"
                            value={form.conta_devolucao}
                            onChange={(e) =>
                                handleChange("conta_devolucao", e.target.value)
                            }
                        />
                    </div>
                </div>
            </section>

            {/* 10. Observações */}
            <section className="space-y-2">
                <div className="space-y-1">
                    <Label htmlFor="observacoes">
                        Observações importantes (opcional)
                    </Label>
                    <Textarea
                        id="observacoes"
                        value={form.observacoes}
                        onChange={(e) => handleChange("observacoes", e.target.value)}
                        placeholder="Ex.: Pretendo usar FGTS, tenho outro financiamento em andamento, etc."
                    />
                </div>
            </section>

            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={saving} className="min-w-[160px]">
                    {saving ? "Enviando..." : "Enviar dados"}
                </Button>
            </div>
        </form>
    );
}

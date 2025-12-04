"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Copy, Check, ClipboardList, Send } from "lucide-react";
import { formatPhoneBR, formatMoneyBR, buildWhatsAppLink } from "@/lib/formatters";

interface CadastroRow {
    id: string;
    status?: string | null;
}

interface LeadCadastroPFRow {
    nome_completo?: string | null;
    cpf?: string | null;
    data_nascimento?: string | null;
    estado_civil?: string | null;
    nome_conjuge?: string | null;
    cpf_conjuge?: string | null;
    email?: string | null;
    telefone_fixo?: string | null;
    celular?: string | null;
    rg_numero?: string | null;
    rg_orgao_emissor?: string | null;
    rg_data_emissao?: string | null;
    cidade_nascimento?: string | null;
    nome_mae?: string | null;
    profissao?: string | null;
    renda_mensal?: number | null;
    cep?: string | null;
    endereco?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    uf?: string | null;
    forma_pagamento?: string | null;
    banco_devolucao?: string | null;
    agencia_devolucao?: string | null;
    conta_devolucao?: string | null;
}

function Fallback({ value }: { value?: string | null }) {
    if (!value) return <span className="text-slate-500">—</span>;
    return <span>{value}</span>;
}

function Section({
                     title,
                     children,
                 }: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {title}
            </h3>
            {children}
        </div>
    );
}

type FieldProps = {
    label: string;
    value?: string | null;
    copyValue?: string | null;
    copyKey: string;
    onCopy: (key: string, value?: string | null) => void;
    copiedKey: string | null;
};

function Field({
                   label,
                   value,
                   copyValue,
                   copyKey,
                   onCopy,
                   copiedKey,
               }: FieldProps) {
    const hasCopy = !!copyValue;

    return (
        <div className="flex items-start justify-between gap-2 rounded-lg border border-slate-800/60 bg-slate-900/60 px-3 py-2 hover:border-emerald-500/40 transition-colors">
            <div className="flex flex-col gap-0.5">
        <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
          {label}
        </span>
                <div className="text-sm text-slate-100 max-w-[220px] break-words">
                    {value != null ? <Fallback value={value} /> : <span className="text-slate-500">—</span>}
                </div>
            </div>
            {hasCopy && (
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                    onClick={() => onCopy(copyKey, copyValue)}
                    title="Copiar valor"
                >
                    {copiedKey === copyKey ? (
                        <Check className="h-3.5 w-3.5" />
                    ) : (
                        <Copy className="h-3.5 w-3.5" />
                    )}
                </Button>
            )}
        </div>
    );
}

export function CadastroPFCardClient({
                                         cadastro,
                                         pf,
                                         publicUrl,
                                         clienteNome,
                                         clienteTelefone,
                                     }: {
    cadastro: CadastroRow;
    pf: LeadCadastroPFRow;
    publicUrl?: string;
    clienteNome?: string;
    clienteTelefone?: string;
}) {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [copiedAll, setCopiedAll] = useState(false);

    function handleCopy(key: string, value?: string | null) {
        if (!value) return;
        navigator.clipboard.writeText(value).then(() => {
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 1200);
        });
    }

    function buildAllText(): string {
        const lines: string[] = [];

        const push = (label: string, value?: string | null) => {
            if (!value) return;
            lines.push(`${label}: ${value}`);
        };

        push("CPF", pf.cpf ?? null);
        push("Nome completo", pf.nome_completo ?? null);
        push("Data de nascimento", pf.data_nascimento ?? null);
        push("Estado civil", pf.estado_civil ?? null);
        push("CPF cônjuge", pf.cpf_conjuge ?? null);
        push("Nome cônjuge", pf.nome_conjuge ?? null);
        push("E-mail", pf.email ?? null);
        if (pf.telefone_fixo)
            push("Telefone fixo", formatPhoneBR(pf.telefone_fixo));
        if (pf.celular) push("Celular", formatPhoneBR(pf.celular));
        push("RG", pf.rg_numero ?? null);
        push("Órgão emissor", pf.rg_orgao_emissor ?? null);
        push("Data emissão RG", pf.rg_data_emissao ?? null);
        push("Cidade de nascimento", pf.cidade_nascimento ?? null);
        push("Nome da mãe", pf.nome_mae ?? null);
        push("Profissão", pf.profissao ?? null);
        if (pf.renda_mensal != null)
            push("Renda mensal", formatMoneyBR(pf.renda_mensal));
        push("CEP", pf.cep ?? null);
        push(
            "Endereço",
            [
                pf.endereco ?? "",
                pf.numero ?? "",
                pf.complemento ?? "",
                pf.bairro ?? "",
                pf.cidade ?? "",
                pf.uf ?? "",
            ]
                .filter(Boolean)
                .join(" - ")
        );
        push("Forma pagamento", pf.forma_pagamento ?? null);
        push(
            "Banco devolução",
            pf.banco_devolucao ?? null
        );
        push(
            "Agência devolução",
            pf.agencia_devolucao ?? null
        );
        push("Conta devolução", pf.conta_devolucao ?? null);

        return lines.join("\n");
    }

    function handleCopyAll() {
        const text = buildAllText();
        if (!text.trim()) return;
        navigator.clipboard.writeText(text).then(() => {
            setCopiedAll(true);
            setTimeout(() => setCopiedAll(false), 1500);
        });
    }

    const statusLabel = cadastro.status ?? "pendente_dados";

    return (
        <Card className="bg-slate-950/90 border-slate-800/80 shadow-xl shadow-emerald-500/10">
            <CardHeader className="space-y-2 pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <CardTitle className="text-sm md:text-base">
                            Ficha cadastral – Pessoa Física
                        </CardTitle>
                        <p className="text-[11px] text-slate-500">
                            Cadastro #{cadastro.id.slice(0, 8)} · Status:{" "}
                            <span className="uppercase text-emerald-300">
                {statusLabel}
              </span>
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-[11px] border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/15"
                            onClick={handleCopyAll}
                        >
                            <ClipboardList className="h-3.5 w-3.5 mr-1" />
                            {copiedAll ? "Copiado!" : "Copiar tudo"}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-5 text-sm text-slate-100">
                {/* BLOCO NOVO: Link público do formulário */}
                {/* BLOCO: Link público do formulário (sempre visível) */}
                <div className="space-y-2 rounded-lg border border-emerald-500/50 bg-emerald-500/5 px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-col">
        <span className="text-[11px] uppercase tracking-[0.16em] text-emerald-300">
          Link do formulário público de cadastro
        </span>

                            {publicUrl ? (
                                <p className="text-[11px] text-emerald-100/80 break-all">
                                    {publicUrl}
                                </p>
                            ) : (
                                <p className="text-[11px] text-amber-200/80">
                                    Ainda não há link gerado para este cadastro.
                                    Assim que o token público for criado, o link aparecerá aqui.
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 border-emerald-500/60 bg-slate-950/60 hover:bg-emerald-500/15"
                                onClick={() => publicUrl && handleCopy("public_url", publicUrl)}
                                title="Copiar link do formulário"
                                disabled={!publicUrl}
                            >
                                {copiedKey === "public_url" ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>

                            {clienteTelefone && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-2 text-[11px] border-emerald-500/60 bg-slate-950/60 hover:bg-emerald-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
                                    asChild
                                    disabled={!publicUrl}
                                >
                                    <a
                                        href={
                                            publicUrl
                                                ? buildWhatsAppLink(
                                                    clienteTelefone,
                                                    `Olá${
                                                        clienteNome ? ` ${clienteNome}` : ""
                                                    }! Para finalizar a contratação do seu consórcio, preciso que você preencha seus dados neste formulário seguro: ${publicUrl}`,
                                                )
                                                : "#"
                                        }
                                        target={publicUrl ? "_blank" : undefined}
                                        rel={publicUrl ? "noreferrer" : undefined}
                                    >
                                        <Send className="h-3.5 w-3.5 mr-1" />
                                        WhatsApp
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>


                <Section title="Dados pessoais">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field
                            label="Nome completo"
                            value={pf.nome_completo ?? ""}
                            copyValue={pf.nome_completo ?? ""}
                            copyKey="nome_completo"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                        <Field
                            label="CPF"
                            value={pf.cpf ?? ""}
                            copyValue={pf.cpf ?? ""}
                            copyKey="cpf"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                        <Field
                            label="Data de nascimento"
                            value={pf.data_nascimento ?? ""}
                            copyValue={pf.data_nascimento ?? ""}
                            copyKey="data_nascimento"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                        <Field
                            label="Estado civil"
                            value={pf.estado_civil ?? ""}
                            copyValue={pf.estado_civil ?? ""}
                            copyKey="estado_civil"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                    </div>
                </Section>

                <Separator className="bg-slate-800/80" />

                <Section title="Cônjuge">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field
                            label="Nome do cônjuge"
                            value={pf.nome_conjuge ?? ""}
                            copyValue={pf.nome_conjuge ?? ""}
                            copyKey="nome_conjuge"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                        <Field
                            label="CPF do cônjuge"
                            value={pf.cpf_conjuge ?? ""}
                            copyValue={pf.cpf_conjuge ?? ""}
                            copyKey="cpf_conjuge"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                    </div>
                </Section>

                <Separator className="bg-slate-800/80" />

                <Section title="Contato">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Field
                            label="E-mail"
                            value={pf.email ?? ""}
                            copyValue={pf.email ?? ""}
                            copyKey="email"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                        <Field
                            label="Telefone fixo"
                            value={pf.telefone_fixo ? formatPhoneBR(pf.telefone_fixo) : ""}
                            copyValue={pf.telefone_fixo ?? ""}
                            copyKey="telefone_fixo"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                        <Field
                            label="Celular"
                            value={pf.celular ? formatPhoneBR(pf.celular) : ""}
                            copyValue={pf.celular ?? ""}
                            copyKey="celular"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                    </div>
                </Section>

                <Separator className="bg-slate-800/80" />

                <Section title="Documento de identidade">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Field
                            label="RG"
                            value={pf.rg_numero ?? ""}
                            copyValue={pf.rg_numero ?? ""}
                            copyKey="rg_numero"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                        <Field
                            label="Órgão emissor"
                            value={pf.rg_orgao_emissor ?? ""}
                            copyValue={pf.rg_orgao_emissor ?? ""}
                            copyKey="rg_orgao_emissor"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                        <Field
                            label="Data de emissão"
                            value={pf.rg_data_emissao ?? ""}
                            copyValue={pf.rg_data_emissao ?? ""}
                            copyKey="rg_data_emissao"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                    </div>
                </Section>

                <Separator className="bg-slate-800/80" />

                <Section title="Nascimento e filiação">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field
                            label="Cidade de nascimento"
                            value={pf.cidade_nascimento ?? ""}
                            copyValue={pf.cidade_nascimento ?? ""}
                            copyKey="cidade_nascimento"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                        <Field
                            label="Nome da mãe"
                            value={pf.nome_mae ?? ""}
                            copyValue={pf.nome_mae ?? ""}
                            copyKey="nome_mae"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                    </div>
                </Section>

                <Separator className="bg-slate-800/80" />

                <Section title="Profissão e renda">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field
                            label="Profissão"
                            value={pf.profissao ?? ""}
                            copyValue={pf.profissao ?? ""}
                            copyKey="profissao"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                        <Field
                            label="Renda mensal (R$)"
                            value={
                                pf.renda_mensal != null
                                    ? formatMoneyBR(pf.renda_mensal)
                                    : ""
                            }
                            copyValue={
                                pf.renda_mensal != null
                                    ? String(pf.renda_mensal)
                                    : ""
                            }
                            copyKey="renda_mensal"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                    </div>
                </Section>

                <Separator className="bg-slate-800/80" />

                <Section title="Endereço residencial">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Field
                            label="CEP"
                            value={pf.cep ?? ""}
                            copyValue={pf.cep ?? ""}
                            copyKey="cep"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                        <Field
                            label="Endereço"
                            value={
                                [
                                    pf.endereco ?? "",
                                    pf.numero ?? "",
                                    pf.complemento ?? "",
                                ]
                                    .filter(Boolean)
                                    .join(", ")
                            }
                            copyValue={
                                [
                                    pf.endereco ?? "",
                                    pf.numero ?? "",
                                    pf.complemento ?? "",
                                ]
                                    .filter(Boolean)
                                    .join(", ")
                            }
                            copyKey="endereco"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                        <Field
                            label="Bairro · Cidade · UF"
                            value={
                                [
                                    pf.bairro ?? "",
                                    pf.cidade ?? "",
                                    pf.uf ? `(${pf.uf})` : "",
                                ]
                                    .filter(Boolean)
                                    .join(" · ")
                            }
                            copyValue={
                                [
                                    pf.bairro ?? "",
                                    pf.cidade ?? "",
                                    pf.uf ?? "",
                                ]
                                    .filter(Boolean)
                                    .join(" - ")
                            }
                            copyKey="bairro_cidade_uf"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                    </div>
                </Section>

                <Separator className="bg-slate-800/80" />

                <Section title="Pagamento / Devolução">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Field
                            label="Forma de pagamento"
                            value={pf.forma_pagamento ?? ""}
                            copyValue={pf.forma_pagamento ?? ""}
                            copyKey="forma_pagamento"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                        <Field
                            label="Banco devolução"
                            value={pf.banco_devolucao ?? ""}
                            copyValue={pf.banco_devolucao ?? ""}
                            copyKey="banco_devolucao"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                        <Field
                            label="Agência / Conta"
                            value={
                                [
                                    pf.agencia_devolucao ?? "",
                                    pf.conta_devolucao ?? "",
                                ]
                                    .filter(Boolean)
                                    .join(" · ")
                            }
                            copyValue={
                                [
                                    pf.agencia_devolucao ?? "",
                                    pf.conta_devolucao ?? "",
                                ]
                                    .filter(Boolean)
                                    .join(" - ")
                            }
                            copyKey="agencia_conta_devolucao"
                            onCopy={handleCopy}
                            copiedKey={copiedKey}
                        />
                    </div>
                </Section>
            </CardContent>
        </Card>
    );
}

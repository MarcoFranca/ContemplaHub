"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Mail, Phone, UserRound, BadgeInfo, Target, CalendarRange } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput } from "@/components/form/MoneyInput";
import { SectionFX } from "@/components/marketing/SectionFX";
import { updateLeadAction } from "./actions";
import type { LeadCadastroPF } from "./pf-cadastro";
import { ImportarDocumentoButton } from "@/app/app/lances/components/ImportarDocumentoButton";
import type { DocumentoImportado } from "@/app/app/lances/actions/importar-documento";

function maskCPF(v: string) {
    const d = (v || "").replace(/\D/g, "").slice(0, 11);
    return d
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskCEP(v: string) {
    const d = (v || "").replace(/\D/g, "").slice(0, 8);
    return d.replace(/(\d{5})(\d)/, "$1-$2");
}

function moneyDisplay(n: number | null | undefined) {
    if (n == null || !Number.isFinite(n)) return "";
    return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

type LeadEditData = {
    id: string;
    nome: string | null;
    telefone: string | null;
    email: string | null;
    origem: string | null;
    valor_interesse: number | null;
    prazo_meses: number | null;
};

export type LeadInteresseData = {
    produto: string | null;
    perfil_desejado: string | null;
    objetivo: string | null;
    observacao: string | null;
};

const ORIGEM_OPTIONS = [
    { value: "lp", label: "Landing Page" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "indicacao", label: "Indicação" },
    { value: "orgânico", label: "Orgânico" },
    { value: "pago", label: "Pago" },
    { value: "outro", label: "Outro" },
];

export function EditLeadSheet({
    lead,
    interesse,
    pf,
}: {
    lead: LeadEditData;
    interesse?: LeadInteresseData | null;
    pf?: LeadCadastroPF | null;
}) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [cpf, setCpf] = React.useState(maskCPF(pf?.cpf ?? ""));
    const [nascimento, setNascimento] = React.useState(pf?.data_nascimento ?? "");
    const [cpfConjuge, setCpfConjuge] = React.useState(maskCPF(pf?.cpf_conjuge ?? ""));
    const [renda, setRenda] = React.useState(moneyDisplay(pf?.renda_mensal));
    const [cep, setCep] = React.useState(maskCEP(pf?.cep ?? ""));
    const [endereco, setEndereco] = React.useState(pf?.endereco ?? "");
    const [bairro, setBairro] = React.useState(pf?.bairro ?? "");
    const [cidade, setCidade] = React.useState(pf?.cidade ?? "");
    const [uf, setUf] = React.useState(pf?.uf ?? "");
    const [nomeConjuge, setNomeConjuge] = React.useState(pf?.nome_conjuge ?? "");
    const [nomeMae, setNomeMae] = React.useState(pf?.nome_mae ?? "");
    const [cidadeNascimento, setCidadeNascimento] = React.useState(pf?.cidade_nascimento ?? "");
    const [rgNumero, setRgNumero] = React.useState(pf?.rg_numero ?? "");
    const [rgOrgao, setRgOrgao] = React.useState(pf?.rg_orgao_emissor ?? "");
    const [rgEmissao, setRgEmissao] = React.useState(pf?.rg_data_emissao ?? "");
    const [profissao, setProfissao] = React.useState(pf?.profissao ?? "");
    const [estadoCivil, setEstadoCivil] = React.useState(pf?.estado_civil ?? "");
    const [cepLoading, setCepLoading] = React.useState(false);

    const buscarCep = React.useCallback(async (valor: string) => {
        const digits = valor.replace(/\D/g, "");
        if (digits.length !== 8) return;
        try {
            setCepLoading(true);
            const r = await fetch(`https://viacep.com.br/ws/${digits}/json/`, { cache: "no-store" });
            const data = await r.json();
            if (data?.erro) return;
            setEndereco((cur) => cur || (data.logradouro?.trim() ?? ""));
            setBairro((cur) => cur || (data.bairro?.trim() ?? ""));
            setCidade(data.localidade?.trim() ?? "");
            setUf(data.uf?.trim() ?? "");
        } catch {
            // silencioso
        } finally {
            setCepLoading(false);
        }
    }, []);

    function handleImport(doc: DocumentoImportado) {
        const d = doc.dados;
        if (d.cliente_cpf) setCpf(maskCPF(d.cliente_cpf));
        if (d.cliente_nascimento) setNascimento(d.cliente_nascimento);
        if (d.cliente_renda != null) setRenda(moneyDisplay(d.cliente_renda));
        if (d.cliente_nome_conjuge) setNomeConjuge(d.cliente_nome_conjuge);
        if (d.cliente_cpf_conjuge) setCpfConjuge(maskCPF(d.cliente_cpf_conjuge));
        if (d.cliente_estado_civil) setEstadoCivil(d.cliente_estado_civil);
        if (d.cliente_nome_mae) setNomeMae(d.cliente_nome_mae);
        if (d.cliente_local_nascimento) setCidadeNascimento(d.cliente_local_nascimento);
        if (d.cliente_rg) setRgNumero(d.cliente_rg);
        if (d.cliente_rg_orgao) setRgOrgao(d.cliente_rg_orgao);
        if (d.cliente_rg_emissao) setRgEmissao(d.cliente_rg_emissao);
        if (d.cliente_profissao) setProfissao(d.cliente_profissao);
        if (d.cliente_cep) setCep(maskCEP(d.cliente_cep));
        if (d.cliente_endereco) setEndereco(d.cliente_endereco);
        if (d.cliente_bairro) setBairro(d.cliente_bairro);
        if (d.cliente_cidade) setCidade(d.cliente_cidade);
        if (d.cliente_uf) setUf(d.cliente_uf);
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Editar cliente
                </Button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className="isolate w-[400px] border-l border-white/10 bg-slate-950/70 px-0 shadow-2xl backdrop-blur-xl sm:w-[560px]"
            >
                <SectionFX
                    preset="nebula"
                    variant="emerald"
                    showGrid
                    className="absolute inset-0 -z-10"
                />

                <SheetHeader className="border-b border-white/10 px-6 pt-6 pb-3">
                    <SheetTitle className="flex items-center gap-2 text-base">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/30">
              <Pencil className="h-3.5 w-3.5 text-emerald-300" />
            </span>
                        Editar cliente
                    </SheetTitle>
                </SheetHeader>

                <form
                    action={async (formData: FormData) => {
                        const toastId = toast.loading("Salvando alterações...");

                        const result = await updateLeadAction(lead.id, formData);

                        if (!result.ok) {
                            toast.error(result.error, { id: toastId });
                            return;
                        }

                        toast.success("Cliente atualizado com sucesso!", { id: toastId });
                        setOpen(false);
                        router.refresh();
                    }}
                    className="relative flex h-[calc(100dvh-56px)] flex-col overflow-hidden"
                >
                    <div className="flex-1 space-y-6 overflow-auto px-6 py-5">
                        <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                                Dados principais
                            </legend>

                            <div className="mt-3 space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nome" className="flex items-center gap-2 text-xs">
                                        <UserRound className="h-3.5 w-3.5" />
                                        Nome
                                    </Label>
                                    <Input
                                        id="nome"
                                        name="nome"
                                        required
                                        defaultValue={lead.nome ?? ""}
                                        placeholder="Ex.: João Silva"
                                    />
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="telefone" className="flex items-center gap-2 text-xs">
                                            <Phone className="h-3.5 w-3.5" />
                                            Telefone
                                        </Label>
                                        <Input
                                            id="telefone"
                                            name="telefone"
                                            defaultValue={lead.telefone ?? ""}
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="email" className="flex items-center gap-2 text-xs">
                                            <Mail className="h-3.5 w-3.5" />
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            defaultValue={lead.email ?? ""}
                                            placeholder="cliente@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="flex items-center gap-2 text-xs">
                                            <BadgeInfo className="h-3.5 w-3.5"/>
                                            Origem
                                        </Label>

                                        <select
                                            name="origem"
                                            defaultValue={lead.origem ?? ""}
                                            className="h-10 w-full rounded-md border border-white/10 bg-background px-3 text-sm"
                                        >
                                            <option value="">Não informado</option>
                                            {ORIGEM_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="valor_interesse" className="flex items-center gap-2 text-xs">
                                            <Target className="h-3.5 w-3.5"/>
                                            Valor de interesse
                                        </Label>
                                        <Input
                                            id="valor_interesse"
                                            name="valor_interesse"
                                            inputMode="decimal"
                                            defaultValue={lead.valor_interesse ?? ""}
                                            placeholder="300000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="prazo_meses" className="flex items-center gap-2 text-xs">
                                        <CalendarRange className="h-3.5 w-3.5"/>
                                        Prazo desejado (meses)
                                    </Label>
                                    <Input
                                        id="prazo_meses"
                                        name="prazo_meses"
                                        type="number"
                                        defaultValue={lead.prazo_meses ?? ""}
                                        placeholder="180"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                                Interesse comercial
                            </legend>

                            <div className="mt-3 space-y-4">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Produto</Label>
                                        <select
                                            name="produto"
                                            defaultValue={interesse?.produto ?? ""}
                                            className="h-10 w-full rounded-md border border-white/10 bg-background px-3 text-sm"
                                        >
                                            <option value="">Não informado</option>
                                            <option value="imobiliario">Imóvel</option>
                                            <option value="auto">Automóvel</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Perfil</Label>
                                        <select
                                            name="perfil_desejado"
                                            defaultValue={interesse?.perfil_desejado ?? ""}
                                            className="h-10 w-full rounded-md border border-white/10 bg-background px-3 text-sm"
                                        >
                                            <option value="">Não informado</option>
                                            <option value="conservador">Conservador</option>
                                            <option value="moderado">Moderado</option>
                                            <option value="arrojado">Arrojado</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="objetivo" className="text-xs">Objetivo</Label>
                                    <Input
                                        id="objetivo"
                                        name="objetivo"
                                        defaultValue={interesse?.objetivo ?? ""}
                                        placeholder="Compra do imóvel / troca do carro…"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="observacao" className="text-xs">Observação</Label>
                                    <Textarea
                                        id="observacao"
                                        name="observacao"
                                        defaultValue={interesse?.observacao ?? ""}
                                        placeholder="Notas sobre o interesse do cliente…"
                                        className="min-h-[90px]"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                                    Cadastro completo
                                </legend>
                                <ImportarDocumentoButton onImported={handleImport} label="Importar extrato/apólice" />
                            </div>

                            <div className="mt-3 space-y-4">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="pf_cpf" className="text-xs">CPF</Label>
                                        <Input id="pf_cpf" name="pf_cpf" value={cpf} onChange={(e) => setCpf(maskCPF(e.target.value))} inputMode="numeric" placeholder="000.000.000-00" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="pf_data_nascimento" className="text-xs">Data de nascimento</Label>
                                        <Input id="pf_data_nascimento" name="pf_data_nascimento" type="date" value={nascimento} onChange={(e) => setNascimento(e.target.value)} />
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Estado civil</Label>
                                        <select name="pf_estado_civil" value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} className="h-10 w-full rounded-md border border-white/10 bg-background px-3 text-sm">
                                            <option value="">Não informado</option>
                                            <option value="solteiro">Solteiro(a)</option>
                                            <option value="casado">Casado(a)</option>
                                            <option value="divorciado">Divorciado(a)</option>
                                            <option value="viuvo">Viúvo(a)</option>
                                            <option value="uniao_estavel">União estável</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Profissão</Label>
                                        <Input name="pf_profissao" value={profissao} onChange={(e) => setProfissao(e.target.value)} placeholder="Ex.: Médico" />
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Nome do cônjuge</Label>
                                        <Input name="pf_nome_conjuge" value={nomeConjuge} onChange={(e) => setNomeConjuge(e.target.value)} placeholder="—" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">CPF do cônjuge</Label>
                                        <Input name="pf_cpf_conjuge" value={cpfConjuge} onChange={(e) => setCpfConjuge(maskCPF(e.target.value))} inputMode="numeric" placeholder="000.000.000-00" />
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Nome da mãe</Label>
                                        <Input name="pf_nome_mae" value={nomeMae} onChange={(e) => setNomeMae(e.target.value)} placeholder="—" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Renda mensal</Label>
                                        <MoneyInput value={renda} onChange={setRenda} />
                                        <input type="hidden" name="pf_renda_mensal" value={renda} />
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">RG</Label>
                                        <Input name="pf_rg_numero" value={rgNumero} onChange={(e) => setRgNumero(e.target.value)} placeholder="Nº do RG" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Órgão emissor</Label>
                                        <Input name="pf_rg_orgao_emissor" value={rgOrgao} onChange={(e) => setRgOrgao(e.target.value)} placeholder="SSP" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Emissão</Label>
                                        <Input name="pf_rg_data_emissao" type="date" value={rgEmissao} onChange={(e) => setRgEmissao(e.target.value)} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs">Cidade de nascimento</Label>
                                    <Input name="pf_cidade_nascimento" value={cidadeNascimento} onChange={(e) => setCidadeNascimento(e.target.value)} placeholder="—" />
                                </div>

                                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Endereço</p>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="pf_cep" className="text-xs">CEP</Label>
                                        <Input id="pf_cep" name="pf_cep" value={cep} onChange={(e) => setCep(maskCEP(e.target.value))} onBlur={() => void buscarCep(cep)} inputMode="numeric" placeholder="00000-000" />
                                        <p className="text-[11px] text-muted-foreground">
                                            {cepLoading ? "Buscando endereço…" : "Ao informar o CEP, buscamos cidade, UF e bairro."}
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="pf_cidade" className="text-xs">Cidade</Label>
                                        <Input id="pf_cidade" name="pf_cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="São Paulo" />
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="pf_uf" className="text-xs">Estado (UF)</Label>
                                        <Input id="pf_uf" name="pf_uf" value={uf} onChange={(e) => setUf(e.target.value.toUpperCase().slice(0, 2))} maxLength={2} placeholder="SP" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="pf_bairro" className="text-xs">Bairro</Label>
                                        <Input id="pf_bairro" name="pf_bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Centro" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="pf_endereco" className="text-xs">Logradouro</Label>
                                    <Input id="pf_endereco" name="pf_endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, avenida, alameda…" />
                                </div>
                            </div>
                        </fieldset>
                    </div>

                    <SheetFooter className="sticky bottom-0 w-full border-t border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur-xl">
                        <div className="flex w-full items-center justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>

                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500">
                                Salvar alterações
                            </Button>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
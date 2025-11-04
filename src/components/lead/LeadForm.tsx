"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { onlyDigits } from "@/lib/masks";
import { BrazilPhoneInput, PlainCurrencyInput } from "@/features/leads/inputs";
import { PERFIS, objetivosByProduto, type ProdutoTipo } from "@/features/leads/catalogs";
import { PerfilCombobox } from "@/features/leads/PerfilCombobox";

type LeadFormProps = {
    hash?: string;              // 👈 adicionamos o hash
    onSuccess?: () => void;
};


type LeadPost = {
    nome: string; email: string; telefone: string;
    valor_carta?: string; prazo_meses?: string;
    objetivo?: string; perfil_psico?: string; observacoes?: string;
    origem?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string;
    consentimento: boolean; tipo?: ProdutoTipo; company?: string;
};

export function LeadForm({ hash = "autentika", onSuccess }: LeadFormProps) {
    const [pending, start] = useTransition();
    const [err, setErr] = useState<string | null>(null);
    const [consented, setConsented] = useState(false);

    const [loading, setLoading] = useState(false);
    const [tipo, setTipo] = useState<ProdutoTipo>("imobiliario");
    const [prazo, setPrazo] = useState<string>("180");
    const [prazoOutro, setPrazoOutro] = useState<string>("");

    const [objetivo, setObjetivo] = useState<string>("");
    const [objetivoOutro, setObjetivoOutro] = useState<string>("");

    const [perfil, setPerfil] = useState<string>("");
    const [perfilOutro, setPerfilOutro] = useState<string>("");

    const fieldH = "h-11";
    const textAreaH = "min-h-28";

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        (["utm_source", "utm_medium", "utm_campaign"] as const).forEach((k) => {
            const el = document.querySelector<HTMLInputElement>(`input[name="${k}"]`);
            const v = params.get(k);
            if (el && v) el.value = v;
        });
    }, []);

    function formToLeadPost(fd: FormData): LeadPost {
        const gs = (k: string): string | undefined => {
            const val = fd.get(k); return typeof val === "string" && val.trim() ? val : undefined;
        };
        const obj = gs("objetivo") === "outro" ? gs("objetivo_outro") : gs("objetivo");
        const per = gs("perfil_psico") === "outro" ? gs("perfil_outro") : gs("perfil_psico");

        const base: LeadPost = {
            nome: gs("nome") ?? "", email: gs("email") ?? "", telefone: gs("telefone") ?? "",
            valor_carta: gs("valor_carta"),
            prazo_meses: gs("prazo_meses") ?? gs("prazo_outro"),
            objetivo: obj, perfil_psico: per, observacoes: gs("observacoes"),
            origem: gs("origem") ?? "lp-home",
            utm_source: gs("utm_source"), utm_medium: gs("utm_medium"), utm_campaign: gs("utm_campaign"),
            consentimento: true, tipo, company: gs("company"),
        };

        if (base.valor_carta) base.valor_carta = onlyDigits(base.valor_carta);
        if (base.telefone) base.telefone = onlyDigits(base.telefone);
        if (prazo === "outro") base.prazo_meses = onlyDigits(prazoOutro ?? "");
        return base;
    }

    async function onSubmit(formData: FormData) {
        setErr(null);
        const body = { hash, ...formToLeadPost(formData)};

        if (!body.nome || !body.email || !body.telefone) { setErr("Preencha nome, WhatsApp e e-mail."); return; }
        if (!consented) { setErr("É necessário aceitar a Política de Privacidade."); return; }
        if (body.company && body.company.trim().length > 0) { return; }

        start(async () => {
            const res = await fetch("/api/leads", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) { const txt = await res.text(); setErr(`Falha ao enviar: ${txt}`); return; }
            onSuccess?.();
        });
    }

    const objetivos = objetivosByProduto(tipo);

    return (
        <form
            onSubmit={(e)=>{ e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }}
            // 👉 mobile: 2 colunas; desktop: 12
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-12 gap-4 md:gap-6"
            noValidate
        >
            {/* Nome (full no mobile) */}
            <div className="grid gap-2 col-span-2 md:col-span-6 min-w-0">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" name="nome" className={`${fieldH} w-full`} autoComplete="name" placeholder="Davi Campos" required />
            </div>

            {/* WhatsApp (full mobile) */}
            <div className="grid gap-2 col-span-2 md:col-span-6 min-w-0">
                <Label htmlFor="telefone">WhatsApp</Label>
                <BrazilPhoneInput id="telefone" nameDisplay="telefone" className={`${fieldH} w-full`} required />
            </div>

            {/* E-mail (full mobile) */}
            <div className="grid gap-2 col-span-2 md:col-span-6 min-w-0">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" className={`${fieldH} w-full`} autoComplete="email" placeholder="voce@exemplo.com" required />
            </div>

            {/* 👉 Grupo compacto no mobile: Tipo + Prazo lado a lado */}
            <div className="grid gap-2 col-span-1 md:col-span-6 min-w-0">
                <Label htmlFor="tipo">Tipo de consórcio</Label>
                <Select value={tipo} onValueChange={(v: "imobiliario" | "auto") => setTipo(v)}>
                    <SelectTrigger id="tipo" className={`${fieldH} w-full`}>
                        <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent
                        className="z-[70] w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                        sideOffset={6}
                    >
                        <SelectItem value="imobiliario">Imobiliário</SelectItem>
                        <SelectItem value="auto">Automóvel</SelectItem>
                    </SelectContent>
                </Select>
                <input type="hidden" name="tipo" value={tipo} />
            </div>

            <div className="grid gap-2 col-span-1 md:col-span-6 min-w-0">
                <Label htmlFor="prazo_meses">Prazo (meses)</Label>
                <Select value={prazo} onValueChange={setPrazo} name="prazo_meses">
                    <SelectTrigger id="prazo_meses" className={`${fieldH} w-full`}>
                        <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent
                        className="z-[70] w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                        sideOffset={6}
                    >
                        {[60,80,100,120,150,180,200].map(v=>(
                            <SelectItem key={v} value={String(v)}>{v}</SelectItem>
                        ))}
                        <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                </Select>

                {prazo === "outro" && (
                    <Input
                        name="prazo_outro"
                        value={prazoOutro}
                        onChange={(e) => setPrazoOutro(e.target.value)}
                        inputMode="numeric"
                        placeholder="Digite o prazo"
                        className={`mt-2 ${fieldH} w-full`}
                        aria-label="Informe o prazo em meses"
                    />
                )}
            </div>

            {/* Valor da carta (ocupa as 2 colunas do mobile) */}
            <div className="grid gap-2 col-span-2 md:col-span-6 min-w-0">
                <Label htmlFor="valor_carta_visual">Valor da carta (R$)</Label>
                <PlainCurrencyInput id="valor_carta_visual" className={`${fieldH} w-full`} required />
            </div>

            {/* Objetivo (2 col mobile) */}
            <div className="grid gap-2 col-span-2 md:col-span-6 min-w-0">
                <Label htmlFor="objetivo" className="flex items-center gap-1">
                    Objetivo
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-emerald-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-sm" side="right" sideOffset={6}>
                            Escolha o principal. Você pode detalhar nas Observações.
                        </TooltipContent>
                    </Tooltip>
                </Label>

                <Select value={objetivo} onValueChange={setObjetivo} name="objetivo">
                    <SelectTrigger id="objetivo" className={`${fieldH} w-full`}>
                        <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent
                        className="z-[70] w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                        sideOffset={6}
                    >
                        {objetivos.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
                        <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                </Select>

                {objetivo === "outro" && (
                    <Input
                        name="objetivo_outro"
                        value={objetivoOutro}
                        onChange={(e) => setObjetivoOutro(e.target.value)}
                        placeholder="Descreva seu objetivo"
                        className={`mt-2 ${fieldH} w-full`}
                    />
                )}
            </div>

            {/* 👉 Seu perfil usando Combobox com descrição (2 col mobile) */}
            <div className="grid gap-2 col-span-2 md:col-span-6 min-w-0">
                <Label htmlFor="perfil_psico">Seu perfil</Label>
                <PerfilCombobox
                    id="perfil_psico"
                    name="perfil_psico"
                    value={perfil}
                    onChange={setPerfil}
                    options={PERFIS}
                    placeholder="Selecione"
                    className="w-full"
                />
                {perfil === "outro" && (
                    <Input
                        name="perfil_outro"
                        value={perfilOutro}
                        onChange={(e) => setPerfilOutro(e.target.value)}
                        placeholder="Descreva seu perfil"
                        className={`mt-2 ${fieldH} w-full`}
                    />
                )}
            </div>

            {/* Observações */}
            <div className="grid gap-2 col-span-2 md:col-span-12 min-w-0">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" name="observacoes" className={`${textAreaH} w-full`} />
            </div>

            {/* LGPD + CTA */}
            <label className="mt-2 col-span-2 md:col-span-8 flex items-start gap-3 text-sm">
                <Checkbox id="consentimento" checked={consented} onCheckedChange={(v)=>setConsented(Boolean(v))}/>
                <span>
          Autorizo o contato via WhatsApp e e-mail. Li e aceito a{" "}
                    <a href="/privacidade" className="underline">Política de Privacidade</a>.
        </span>
            </label>

            <div className="col-span-2 md:col-span-4 mt-3 md:mt-6 md:justify-self-end">
                <Button type="submit" size="lg" disabled={pending || !consented} className="w-full md:w-auto">
                    {pending ? "Enviando..." : "Receber diagnóstico"}
                </Button>
                {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
            </div>

            {/* Hidden tracking + honeypot */}
            <input type="hidden" name="origem" value="lp-home" />
            <input type="hidden" name="utm_source" />
            <input type="hidden" name="utm_medium" />
            <input type="hidden" name="utm_campaign" />
            <div className="sr-only" aria-hidden>
                <label htmlFor="company">Company</label>
                <input id="company" name="company" tabIndex={-1} autoComplete="off" />
            </div>
        </form>
    );
}

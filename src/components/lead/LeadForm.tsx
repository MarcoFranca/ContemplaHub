"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/* ============================================================
   Catálogos (ótimos p/ filtros no CRM)
   ============================================================ */
const OBJETIVOS_IMOBILIARIO = [
    { v: "primeira-casa", l: "Primeira casa" },
    { v: "upgrade-moradia", l: "Upgrade da moradia" },
    { v: "terreno", l: "Comprar terreno" },
    { v: "construcao", l: "Construir" },
    { v: "reforma", l: "Reforma" },
    { v: "segunda-moradia", l: "Segunda moradia" },
    { v: "quitacao", l: "Quitar imóvel atual" },
    { v: "sala-comercial", l: "Sala/comercial" },
    { v: "renda-airbnb", l: "Renda com temporada (Airbnb)" },
    { v: "renda-aluguel", l: "Renda com aluguel longo prazo" },
    { v: "diversificacao", l: "Diversificação patrimonial" },
    { v: "protecao-patrimonial", l: "Proteção patrimonial" },
];

const OBJETIVOS_AUTO = [
    { v: "primeiro-carro", l: "Primeiro carro" },
    { v: "upgrade-carro", l: "Upgrade do carro" },
    { v: "utilitario", l: "Utilitário/Trabalho" },
    { v: "frota-pj", l: "Frota PJ" },
    { v: "moto", l: "Moto" },
    { v: "veiculo-premium", l: "Veículo premium" },
    { v: "veiculo-acessibilidade", l: "Veículo com acessibilidade" },
];

const PERFIS = [
    { v: "disciplinado-acumulador", l: "Disciplinado Acumulador" },
    { v: "sonhador-familiar", l: "Sonhador Familiar" },
    { v: "corporativo-racional", l: "Corporativo Racional (PJ)" },
    { v: "impulsivo-emocional", l: "Impulsivo Emocional (guiado)" },
    { v: "estrategico-oportunista", l: "Estratégico Oportunista" },
    { v: "conservador", l: "Conservador" },
    { v: "moderado", l: "Moderado" },
    { v: "arrojado", l: "Arrojado" },
];

/* ============================================================
   Máscaras / normalização
   ============================================================ */
const onlyDigits = (v: string) => v.replace(/\D+/g, "");

function maskPhoneBR(v: string) {
    const d = onlyDigits(v).slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

function normalizePhoneBR(v: string) {
    const d = onlyDigits(v);
    const withDDI = d.startsWith("55") ? d : `55${d}`;
    return withDDI.slice(0, 13); // 55 + 2 DDD + 9 número
}

function maskCurrencyPlain(v: string) {
    const d = onlyDigits(v).slice(0, 9);
    return d ? Number(d).toLocaleString("pt-BR") : "";
}

function normalizeCurrencyPlain(v: string) {
    return onlyDigits(v);
}

/* ============================================================
   Inputs com máscara (display + hidden normalizado)
   ============================================================ */
type PhoneInputProps = {
    id?: string;
    nameDisplay?: string;
    nameNormalized?: string;
    required?: boolean;
    defaultValue?: string;
    autoFocus?: boolean;
    className?: string;
};

function BrazilPhoneInput({
                              id,
                              nameDisplay = "telefone_visual",
                              nameNormalized = "telefone",
                              required,
                              defaultValue = "",
                              autoFocus,
                              className,
                          }: PhoneInputProps) {
    // FIX: hook sempre chamado (sem condicional)
    const autoId = useId();
    const _id = id ?? autoId;

    const [value, setValue] = useState(maskPhoneBR(defaultValue));
    const normalized = normalizePhoneBR(value);

    return (
        <>
            <Input
                id={_id}
                name={nameDisplay}
                value={value}
                onChange={(e) => setValue(maskPhoneBR(e.target.value))}
                placeholder="(11) 98765-4321"
                inputMode="tel"
                autoComplete="tel-national"
                aria-label="WhatsApp com DDD"
                required={required}
                autoFocus={autoFocus}
                className={className}
            />
            <input type="hidden" name={nameNormalized} value={normalized} />
        </>
    );
}

type CurrencyInputProps = {
    id?: string;
    nameDisplay?: string;
    nameNormalized?: string;
    placeholder?: string;
    required?: boolean;
    defaultValue?: string;
    className?: string;
};

function PlainCurrencyInput({
                                id,
                                nameDisplay = "valor_carta_visual",
                                nameNormalized = "valor_carta",
                                placeholder = "300.000",
                                required,
                                defaultValue = "",
                                className,
                            }: CurrencyInputProps) {
    // FIX: hook sempre chamado (sem condicional)
    const autoId = useId();
    const _id = id ?? autoId;

    const [value, setValue] = useState(maskCurrencyPlain(defaultValue));
    const normalized = normalizeCurrencyPlain(value);

    return (
        <>
            <Input
                id={_id}
                name={nameDisplay}
                value={value}
                onChange={(e) => setValue(maskCurrencyPlain(e.target.value))}
                placeholder={placeholder}
                inputMode="numeric"
                autoComplete="off"
                aria-label="Valor da carta em reais (sem centavos)"
                required={required}
                className={className}
            />
            <input type="hidden" name={nameNormalized} value={normalized} />
        </>
    );
}

/* ============================================================
   LeadForm
   ============================================================ */
type LeadFormProps = { onSuccess?: () => void };

type LeadPost = {
    nome: string;
    email: string;
    telefone: string;               // hidden normalizado (só dígitos, com 55)
    valor_carta?: string;
    prazo_meses?: string;
    objetivo?: string;
    perfil_psico?: string;
    observacoes?: string;
    origem?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    consentimento: boolean;
    tipo?: "imobiliario" | "auto";  // não vai para leads; útil p/ deal
    company?: string;               // honeypot
};

export function LeadForm({ onSuccess }: LeadFormProps) {
    const [pending, start] = useTransition();
    const [err, setErr] = useState<string | null>(null);
    const [consented, setConsented] = useState(false);

    const [tipo, setTipo] = useState<"imobiliario" | "auto">("imobiliario");
    const [prazo, setPrazo] = useState<string>("180");
    const [prazoOutro, setPrazoOutro] = useState<string>("");
    const [objetivo, setObjetivo] = useState<string>("");
    const [objetivoOutro, setObjetivoOutro] = useState<string>("");
    const [perfil, setPerfil] = useState<string>("");
    const [perfilOutro, setPerfilOutro] = useState<string>("");

    const objetivos = tipo === "imobiliario" ? OBJETIVOS_IMOBILIARIO : OBJETIVOS_AUTO;

    // UI: altura proporcional
    const fieldH = "h-11";
    const textAreaH = "min-h-28";

    // Preenche UTM (se existirem no form)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        (["utm_source", "utm_medium", "utm_campaign"] as const).forEach((k) => {
            const el = document.querySelector<HTMLInputElement>(`input[name="${k}"]`);
            const v = params.get(k);
            if (el && v) el.value = v;
        });
    }, []);

    // Constrói corpo tipado a partir do FormData (sem any)
    function formToLeadPost(fd: FormData): LeadPost {
        const gs = (k: string): string | undefined => {
            const val = fd.get(k);
            return typeof val === "string" && val.trim() ? val : undefined;
        };

        const base: LeadPost = {
            nome: gs("nome") ?? "",
            email: gs("email") ?? "",
            telefone: gs("telefone") ?? "",                // hidden do BrazilPhoneInput
            valor_carta: gs("valor_carta"),
            prazo_meses: gs("prazo_meses") ?? gs("prazo_outro"),
            objetivo: gs("objetivo") === "outro" ? gs("objetivo_outro") : gs("objetivo"),
            perfil_psico: gs("perfil_psico") === "outro" ? gs("perfil_outro") : gs("perfil_psico"),
            observacoes: gs("observacoes"),
            origem: gs("origem") ?? "lp-home",
            utm_source: gs("utm_source"),
            utm_medium: gs("utm_medium"),
            utm_campaign: gs("utm_campaign"),
            consentimento: true,
            tipo,                                           // do state
            company: gs("company"),
        };

        // normalizações defensivas finais do lado do client
        if (base.valor_carta) base.valor_carta = onlyDigits(base.valor_carta);
        if (base.telefone) base.telefone = onlyDigits(base.telefone);
        if (prazo === "outro") base.prazo_meses = onlyDigits(prazoOutro ?? "");
        return base;
    }

    async function onSubmit(formData: FormData) {
        setErr(null);
        const body = formToLeadPost(formData);

        // UX validations
        if (!body.nome || !body.email || !body.telefone) {
            setErr("Preencha nome, WhatsApp e e-mail.");
            return;
        }
        if (!consented) {
            setErr("É necessário aceitar a Política de Privacidade.");
            return;
        }
        if (body.company && body.company.trim().length > 0) {
            // honeypot → ignorar
            return;
        }

        await start(async () => {
            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const txt = await res.text(); // captura a mensagem vinda da API
                setErr(`Falha ao enviar: ${txt}`);
                return;
            }
            onSuccess?.();
        });
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit(new FormData(e.currentTarget));
            }}
            className="grid gap-4"
            noValidate
        >
            {/* Nome / WhatsApp */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input id="nome" name="nome" placeholder="Seu nome" autoComplete="name" required className={fieldH} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="telefone">WhatsApp</Label>
                    <BrazilPhoneInput id="telefone" required className={fieldH} />
                </div>
            </div>

            {/* Email / Tipo */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" name="email" type="email" autoComplete="email" required className={fieldH} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="tipo">Tipo de consórcio</Label>
                    <Select value={tipo} onValueChange={(v: "imobiliario" | "auto") => setTipo(v)}>
                        <SelectTrigger id="tipo" className={fieldH}>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="imobiliario">Imobiliário</SelectItem>
                            <SelectItem value="auto">Automóvel</SelectItem>
                        </SelectContent>
                    </Select>
                    <input type="hidden" name="tipo" value={tipo} />
                </div>
            </div>

            {/* Valor / Prazo */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="valor_carta_visual">Valor da carta (R$)</Label>
                    <PlainCurrencyInput id="valor_carta_visual" required className={fieldH} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="prazo_meses">Prazo (meses)</Label>
                    <Select value={prazo} onValueChange={(v: string) => setPrazo(v)} name="prazo_meses">
                        <SelectTrigger id="prazo_meses" className={fieldH}>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {[60, 80, 100, 120, 150, 180, 200].map((v) => (
                                <SelectItem key={v} value={String(v)}>
                                    {v}
                                </SelectItem>
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
                            className={`mt-2 ${fieldH}`}
                            aria-label="Informe o prazo em meses"
                        />
                    )}
                </div>
            </div>

            {/* Objetivo / Perfil */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="objetivo" className="flex items-center gap-1">
                        Objetivo
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-emerald-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-sm">
                                Escolha o principal. Você pode detalhar nas Observações.
                            </TooltipContent>
                        </Tooltip>
                    </Label>
                    <Select value={objetivo} onValueChange={(v: string) => setObjetivo(v)} name="objetivo">
                        <SelectTrigger id="objetivo" className={fieldH}>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {objetivos.map((o) => (
                                <SelectItem key={o.v} value={o.v}>
                                    {o.l}
                                </SelectItem>
                            ))}
                            <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                    </Select>
                    {objetivo === "outro" && (
                        <Input
                            name="objetivo_outro"
                            value={objetivoOutro}
                            onChange={(e) => setObjetivoOutro(e.target.value)}
                            placeholder="Descreva seu objetivo"
                            className={`${fieldH} mt-2`}
                        />
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="perfil_psico" className="flex items-center gap-1">
                        Seu perfil
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-emerald-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-sm">
                                Disciplinado, planejador, sonhador, investidor...
                            </TooltipContent>
                        </Tooltip>
                    </Label>
                    <Select value={perfil} onValueChange={(v: string) => setPerfil(v)} name="perfil_psico">
                        <SelectTrigger id="perfil_psico" className={fieldH}>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {PERFIS.map((p) => (
                                <SelectItem key={p.v} value={p.v}>
                                    {p.l}
                                </SelectItem>
                            ))}
                            <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                    </Select>
                    {perfil === "outro" && (
                        <Input
                            name="perfil_outro"
                            value={perfilOutro}
                            onChange={(e) => setPerfilOutro(e.target.value)}
                            placeholder="Descreva seu perfil"
                            className={`${fieldH} mt-2`}
                        />
                    )}
                </div>
            </div>

            {/* Observações */}
            <div className="grid gap-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                    id="observacoes"
                    name="observacoes"
                    placeholder="Conte-nos mais sobre seu plano e momento de vida"
                    autoComplete="off"
                    className={textAreaH}
                />
            </div>

            {/* Origem/UTM */}
            <input type="hidden" name="origem" value="lp-home" />
            <input type="hidden" name="utm_source" />
            <input type="hidden" name="utm_medium" />
            <input type="hidden" name="utm_campaign" />

            {/* Honeypot anti-bot (esconda com sr-only) */}
            <div className="sr-only" aria-hidden>
                <label htmlFor="company">Company</label>
                <input id="company" name="company" tabIndex={-1} autoComplete="off" />
            </div>

            {/* LGPD */}
            <label className="mt-2 flex items-start gap-3 text-sm">
                <Checkbox id="consentimento" checked={consented} onCheckedChange={(v) => setConsented(Boolean(v))} />
                <span>
          Autorizo o contato via WhatsApp e e-mail. Li e aceito a{" "}
                    <a href="/privacidade" className="underline">Política de Privacidade</a>.
        </span>
            </label>

            {/* CTA / feedback */}
            <div className="mt-3">
                <Button type="submit" size="lg" disabled={pending || !consented}>
                    {pending ? "Enviando..." : "Receber diagnóstico"}
                </Button>
                {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
            </div>
        </form>
    );
}

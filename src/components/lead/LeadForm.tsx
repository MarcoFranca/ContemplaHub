"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Info } from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {BrazilPhoneInput} from "@/components/form/BrazilPhoneInput";
import {PlainCurrencyInput} from "@/components/form/PlainCurrencyInput";

type Props = { onSuccess?: () => void };

// --- catálogos controlados (ótimos p/ filtros no CRM) ---
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
    // ICP Autentika (psicológico)
    { v: "disciplinado-acumulador", l: "Disciplinado Acumulador" },
    { v: "sonhador-familiar", l: "Sonhador Familiar" },
    { v: "corporativo-racional", l: "Corporativo Racional (PJ)" },
    { v: "impulsivo-emocional", l: "Impulsivo Emocional (guiado)" },
    { v: "estrategico-oportunista", l: "Estratégico Oportunista" },
    // Apetite de risco (opcional)
    { v: "conservador", l: "Conservador" },
    { v: "moderado", l: "Moderado" },
    { v: "arrojado", l: "Arrojado" },
];

export function LeadForm({ onSuccess }: Props) {
    const [pending, start] = useTransition();
    const [err, setErr] = useState<string | null>(null);
    const [consented, setConsented] = useState(false);

    // estados controlados (p/ UX e dados limpos)
    const [tipo, setTipo] = useState<"imobiliario" | "auto">("imobiliario");
    const [valorCarta, setValorCarta] = useState("");
    const [prazo, setPrazo] = useState("180");
    const [prazoOutro, setPrazoOutro] = useState("");
    const [objetivo, setObjetivo] = useState("");
    const [objetivoOutro, setObjetivoOutro] = useState("");
    const [perfil, setPerfil] = useState("");
    const [perfilOutro, setPerfilOutro] = useState("");

    async function onSubmit(formData: FormData) {
        setErr(null);

        const payload: Record<string, any> = Object.fromEntries(formData.entries());

        // normalizações/overrides
        payload["tipo"] = tipo;
        payload["valor_carta"] = valorCarta.replace(/\D+/g, "");
        payload["prazo_meses"] = prazo === "outro" ? prazoOutro.replace(/\D+/g, "") : prazo;
        payload["objetivo"] = objetivo === "outro" ? objetivoOutro.trim() : objetivo;
        payload["perfil_psico"] = perfil === "outro" ? perfilOutro.trim() : perfil;

        // validações mínimas
        if (!payload["nome"] || !payload["telefone"] || !payload["email"]) {
            setErr("Preencha nome, WhatsApp e e-mail.");
            return;
        }
        if (!consented) {
            setErr("É necessário aceitar a Política de Privacidade.");
            return;
        }

        start(async () => {
            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...payload,
                    origem: payload["origem"] ?? "lp-home",
                }),
            });
            if (!res.ok) {
                setErr("Falha ao enviar. Tente novamente.");
                return;
            }
            onSuccess?.();
        });
    }

    const objetivos = tipo === "imobiliario" ? OBJETIVOS_IMOBILIARIO : OBJETIVOS_AUTO;

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit(new FormData(e.currentTarget));
            }}
            className="grid gap-4"
        >
            {/* Nome / telefone */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input id="nome" name="nome" placeholder="Seu nome"
                           autoComplete="name" required/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="telefone">WhatsApp</Label>
                    <BrazilPhoneInput id="telefone" required/>
                </div>
            </div>

            {/* Email / Tipo */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" name="email" type="email" placeholder={"nome@exemplo.com "} required/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="tipo">Tipo de consórcio</Label>
                    <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                        <SelectTrigger id="tipo"><SelectValue placeholder="Selecione"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="imobiliario">Imobiliário</SelectItem>
                            <SelectItem value="auto">Automóvel</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* hidden p/ manter compatibilidade com back/analytics */}
                    <input type="hidden" name="tipo" value={tipo}/>
                </div>
            </div>

            {/* Valor e prazo */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="valor_carta_visual">Valor da carta (R$)</Label>
                    <PlainCurrencyInput id="valor_carta_visual" required/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="prazo_meses">Prazo (meses)</Label>
                    <Select value={prazo} onValueChange={setPrazo} name="prazo_meses">
                        <SelectTrigger id="prazo_meses"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            {[60, 80, 100, 120, 150, 180, 200].map((v) => (
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
                            className="mt-2"
                        />
                    )}
                </div>
            </div>

            {/* Objetivo / Perfil (dinâmico + outro) */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="objetivo" className="flex items-center gap-1">
                        Objetivo
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-emerald-400 cursor-help"/>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-sm">
                                Escolha o principal. Você pode detalhar nas Observações.
                            </TooltipContent>
                        </Tooltip>
                    </Label>
                    <Select value={objetivo} onValueChange={setObjetivo} name="objetivo">
                        <SelectTrigger id="objetivo"><SelectValue placeholder="Selecione"/></SelectTrigger>
                        <SelectContent>
                            {objetivos.map((o) => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
                            <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                    </Select>
                    {objetivo === "outro" && (
                        <Input
                            name="objetivo_outro"
                            value={objetivoOutro}
                            onChange={(e) => setObjetivoOutro(e.target.value)}
                            placeholder="Descreva seu objetivo"
                            className="mt-2"
                        />
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="perfil_psico" className="flex items-center gap-1">
                        Seu perfil
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-emerald-400 cursor-help"/>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-sm">
                                Disciplinado, planejador, sonhador, investidor...
                            </TooltipContent>
                        </Tooltip>
                    </Label>
                    <Select value={perfil} onValueChange={setPerfil} name="perfil_psico">
                        <SelectTrigger id="perfil_psico"><SelectValue placeholder="Selecione"/></SelectTrigger>
                        <SelectContent>
                            {PERFIS.map((p) => <SelectItem key={p.v} value={p.v}>{p.l}</SelectItem>)}
                            <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                    </Select>
                    {perfil === "outro" && (
                        <Input
                            name="perfil_outro"
                            value={perfilOutro}
                            onChange={(e) => setPerfilOutro(e.target.value)}
                            placeholder="Descreva seu perfil"
                            className="mt-2"
                        />
                    )}
                </div>
            </div>

            {/* Observações */}
            <div className="grid gap-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" name="observacoes"
                          placeholder="Conte-nos mais sobre seu plano e momento de vida"/>
            </div>

            {/* UTM/Origem (opcional — pode preencher via efeito no wrapper) */}
            <input type="hidden" name="origem" value="lp-home"/>

            {/* LGPD */}
            <label className="mt-2 flex items-start gap-3 text-sm">
                <Checkbox id="consentimento" checked={consented} onCheckedChange={(v) => setConsented(Boolean(v))}/>
                <span>
          Autorizo o contato via WhatsApp e e-mail. Li e aceito a{" "}
                    <a href="/privacidade" className="underline">Política de Privacidade</a>.
        </span>
            </label>

            {/* botão / feedback */}
            <div className="mt-3">
                <Button type="submit" size="lg" disabled={pending || !consented}>
                    {pending ? "Enviando..." : "Receber diagnóstico"}
                </Button>
                {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
            </div>
        </form>
    );
}

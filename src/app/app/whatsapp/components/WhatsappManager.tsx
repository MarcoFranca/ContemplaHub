"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, MessageCircle, Loader2, PlugZap, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    connectWhatsappAction,
    connectWhatsappManualAction,
    disconnectWhatsappAction,
    testSendWhatsappAction,
    updateWhatsappTemplateAction,
    type WhatsappConfig,
    type WhatsappIntegration,
    type WhatsappTemplate,
} from "../actions";

// FB JS SDK (carregado sob demanda para o Embedded Signup)
declare global {
    interface Window {
        FB?: {
            init: (opts: Record<string, unknown>) => void;
            login: (
                cb: (resp: { authResponse?: { code?: string } }) => void,
                opts: Record<string, unknown>,
            ) => void;
        };
        fbAsyncInit?: () => void;
    }
}

function loadFbSdk(appId: string, version: string): Promise<void> {
    return new Promise((resolve) => {
        if (window.FB) {
            resolve();
            return;
        }
        window.fbAsyncInit = () => {
            window.FB?.init({ appId, autoLogAppEvents: true, xfbml: false, version });
            resolve();
        };
        const existing = document.getElementById("facebook-jssdk");
        if (existing) return;
        const js = document.createElement("script");
        js.id = "facebook-jssdk";
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        js.async = true;
        js.defer = true;
        document.body.appendChild(js);
    });
}

export function WhatsappManager({
    config,
    integration,
    template,
}: {
    config: WhatsappConfig;
    integration: WhatsappIntegration | null;
    template: WhatsappTemplate;
}) {
    const router = useRouter();
    const [connecting, setConnecting] = React.useState(false);
    const sessionInfo = React.useRef<{ waba_id?: string; phone_number_id?: string }>({});

    // captura waba_id/phone_number_id emitidos pelo fluxo de Embedded Signup
    React.useEffect(() => {
        function onMessage(event: MessageEvent) {
            if (
                event.origin !== "https://www.facebook.com" &&
                event.origin !== "https://web.facebook.com"
            ) {
                return;
            }
            try {
                const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
                if (data?.type === "WA_EMBEDDED_SIGNUP" && data?.data) {
                    sessionInfo.current = {
                        waba_id: data.data.waba_id,
                        phone_number_id: data.data.phone_number_id,
                    };
                }
            } catch {
                // mensagens não-JSON do SDK são ignoradas
            }
        }
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, []);

    async function handleConnect() {
        if (!config.app_id || !config.config_id) {
            toast.error("Embedded Signup não configurado (app_id/config_id ausentes no backend).");
            return;
        }
        setConnecting(true);
        try {
            await loadFbSdk(config.app_id, config.graph_version);
            window.FB?.login(
                async (resp) => {
                    const code = resp?.authResponse?.code;
                    const { waba_id, phone_number_id } = sessionInfo.current;
                    if (!code || !waba_id || !phone_number_id) {
                        setConnecting(false);
                        toast.error("Conexão cancelada ou incompleta. Tente novamente.");
                        return;
                    }
                    const res = await connectWhatsappAction({ code, waba_id, phone_number_id });
                    setConnecting(false);
                    if (!res.ok) {
                        toast.error(res.error);
                        return;
                    }
                    toast.success("WhatsApp conectado!");
                    router.refresh();
                },
                {
                    config_id: config.config_id,
                    response_type: "code",
                    override_default_response_type: true,
                    extras: { setup: {}, featureType: "", sessionInfoVersion: "3" },
                },
            );
        } catch {
            setConnecting(false);
            toast.error("Não foi possível iniciar o Embedded Signup.");
        }
    }

    return (
        <div className="space-y-6">
            <ConnectionCard
                integration={integration}
                connecting={connecting}
                onConnect={handleConnect}
                onDone={() => router.refresh()}
            />
            {!integration?.ativo && <ManualConnectCard onDone={() => router.refresh()} />}
            <TemplateEditor template={template} />
        </div>
    );
}

function ConnectionCard({
    integration,
    connecting,
    onConnect,
    onDone,
}: {
    integration: WhatsappIntegration | null;
    connecting: boolean;
    onConnect: () => void;
    onDone: () => void;
}) {
    const [pending, start] = React.useTransition();
    const connected = Boolean(integration?.ativo);

    return (
        <Card className="border-white/10">
            <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-semibold">
                        <MessageCircle className="h-5 w-5 text-emerald-500" />
                        Conexão do WhatsApp
                    </h2>
                    {connected ? (
                        <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Conectado
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="border-white/15">Não conectado</Badge>
                    )}
                </div>

                {connected && integration ? (
                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                        <Info label="Número" value={integration.display_phone_number || "-"} />
                        <Info label="Nome verificado" value={integration.verified_name || "-"} />
                        <Info label="Qualidade" value={integration.quality_rating || "-"} />
                        <Info label="Limite de mensagens" value={integration.messaging_limit || "-"} />
                        {integration.last_error_message ? (
                            <p className="sm:col-span-2 text-xs text-rose-300">
                                Último erro: {integration.last_error_message}
                            </p>
                        ) : null}
                        <div className="sm:col-span-2">
                            <TestSend />
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Conecte a conta oficial do WhatsApp (WhatsApp Business / Cloud API) da sua organização
                        para enviar a mensagem de boas-vindas automática aos leads.
                    </p>
                )}

                <div className="flex gap-2">
                    {connected && integration ? (
                        <Button
                            variant="outline"
                            className="gap-1.5 border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                            disabled={pending}
                            onClick={() => {
                                if (!confirm("Desconectar o WhatsApp desta organização?")) return;
                                start(async () => {
                                    const res = await disconnectWhatsappAction(integration.id);
                                    if (!res.ok) {
                                        toast.error(res.error || "Falha ao desconectar.");
                                        return;
                                    }
                                    toast.success("WhatsApp desconectado.");
                                    onDone();
                                });
                            }}
                        >
                            <Unplug className="h-4 w-4" /> Desconectar
                        </Button>
                    ) : (
                        <Button className="gap-1.5" disabled={connecting} onClick={onConnect}>
                            {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />}
                            {connecting ? "Conectando..." : "Conectar WhatsApp"}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function ManualConnectCard({ onDone }: { onDone: () => void }) {
    const [open, setOpen] = React.useState(false);
    const [phoneId, setPhoneId] = React.useState("");
    const [wabaId, setWabaId] = React.useState("");
    const [token, setToken] = React.useState("");
    const [pending, start] = React.useTransition();

    return (
        <Card className="border-white/10">
            <CardContent className="space-y-3 p-5">
                <button
                    type="button"
                    className="flex w-full items-center justify-between text-left"
                    onClick={() => setOpen((v) => !v)}
                >
                    <div>
                        <h2 className="font-semibold">Conectar manualmente (número de teste)</h2>
                        <p className="text-sm text-muted-foreground">
                            Use enquanto a análise do app não está aprovada. Cole os dados da aba
                            &quot;Configuração da API&quot; do seu app na Meta.
                        </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{open ? "Ocultar" : "Abrir"}</span>
                </button>

                {open && (
                    <div className="space-y-3 border-t border-white/10 pt-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">
                                    Identificação do número de telefone (phone_number_id)
                                </label>
                                <Input value={phoneId} onChange={(e) => setPhoneId(e.target.value)} placeholder="ex.: 123456789012345" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">
                                    Identificação da conta WhatsApp Business (waba_id)
                                </label>
                                <Input value={wabaId} onChange={(e) => setWabaId(e.target.value)} placeholder="ex.: 987654321098765" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Token de acesso</label>
                            <Input
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Cole o token gerado na Meta"
                                type="password"
                            />
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                O token fica guardado só no servidor. Números de teste geram token temporário;
                                para produção use um token de usuário do sistema (não expira).
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <Button
                                disabled={pending}
                                onClick={() => {
                                    if (!phoneId.trim() || !wabaId.trim() || !token.trim()) {
                                        toast.error("Preencha os três campos.");
                                        return;
                                    }
                                    start(async () => {
                                        const res = await connectWhatsappManualAction({
                                            phone_number_id: phoneId.trim(),
                                            waba_id: wabaId.trim(),
                                            access_token: token.trim(),
                                        });
                                        if (!res.ok) {
                                            toast.error(res.error || "Falha ao conectar.");
                                            return;
                                        }
                                        toast.success("WhatsApp conectado!");
                                        onDone();
                                    });
                                }}
                            >
                                {pending ? "Conectando..." : "Conectar manualmente"}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function TestSend() {
    const [to, setTo] = React.useState("");
    const [pending, start] = React.useTransition();
    return (
        <div className="mt-1 rounded-lg border border-white/10 p-3">
            <p className="text-xs font-medium text-muted-foreground">Enviar mensagem de teste</p>
            <div className="mt-2 flex gap-2">
                <Input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Número com DDD (ex.: 31999998888)"
                />
                <Button
                    variant="outline"
                    disabled={pending}
                    onClick={() => {
                        if (to.trim().length < 8) {
                            toast.error("Informe um número válido.");
                            return;
                        }
                        start(async () => {
                            const res = await testSendWhatsappAction(to.trim());
                            if (!res.ok) {
                                toast.error(res.error || "Falha ao enviar.");
                                return;
                            }
                            toast.success("Enviado! Confira o WhatsApp do número.");
                        });
                    }}
                >
                    {pending ? "Enviando..." : "Enviar"}
                </Button>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
                Em número de teste, só destinatários cadastrados na Meta recebem. Sem template aprovado, envia o
                &quot;hello_world&quot;.
            </p>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-white/10 p-2.5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}

function TemplateEditor({ template }: { template: WhatsappTemplate }) {
    const [body, setBody] = React.useState(template.body_text ?? "");
    const [name, setName] = React.useState(template.template_name ?? "");
    const [pending, start] = React.useTransition();

    return (
        <Card className="border-white/10">
            <CardContent className="space-y-4 p-5">
                <div>
                    <h2 className="font-semibold">Mensagem de boas-vindas</h2>
                    <p className="text-sm text-muted-foreground">
                        Enviada automaticamente quando um lead novo entra. Use {"{{1}}"} para o nome do cliente.
                    </p>
                </div>

                <div>
                    <label className="text-xs font-medium text-muted-foreground">
                        Nome do template aprovado na Meta
                    </label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ex.: lead_boas_vindas"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        O texto abaixo precisa corresponder ao template aprovado na Meta (categoria utilidade).
                    </p>
                </div>

                <div>
                    <label className="text-xs font-medium text-muted-foreground">Texto</label>
                    <Textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={4}
                        placeholder="Olá {{1}}! Recebemos seu contato..."
                    />
                </div>

                <div className="flex justify-end">
                    <Button
                        disabled={pending}
                        onClick={() => {
                            start(async () => {
                                const res = await updateWhatsappTemplateAction({
                                    body_text: body,
                                    // envia string (inclusive vazia) para permitir LIMPAR o nome
                                    template_name: name.trim(),
                                });
                                if (!res.ok) {
                                    toast.error(res.error || "Falha ao salvar.");
                                    return;
                                }
                                toast.success("Mensagem salva.");
                            });
                        }}
                    >
                        {pending ? "Salvando..." : "Salvar mensagem"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

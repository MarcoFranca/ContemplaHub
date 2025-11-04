import {ToastAnnouncer} from "@/components/ToastAnnouncer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getCurrentProfile } from "@/lib/auth/server";
import { getLandingDetail, updateLandingSecurity, rotateWebhookSecret } from "../actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/CopyInline";
import Link from "next/link";
import { Globe2, ArrowLeft } from "lucide-react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function Hint({ children }: { children: React.ReactNode }) {
    return <p className="text-xs text-muted-foreground">{children}</p>;
}

function Kbd({ children }: { children: React.ReactNode }) {
    return (
        <kbd className="rounded border bg-black/30 px-1.5 py-0.5 text-[11px]">
            {children}
        </kbd>
    );
}

function Tt({ tip }: { tip: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Info className="ml-1 inline-block h-4 w-4 text-emerald-400 align-middle" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
                {tip}
            </TooltipContent>
        </Tooltip>
    );
}

/**
 * Next 15 / React 19:
 * params e searchParams são Promise e precisam de await.
 */
type Params = Promise<{ id?: string }>;
type Qs = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({
                                       params,
                                       searchParams,
                                   }: {
    params: Params;
    searchParams: Qs;
}) {
    // 1) Desembrulha params/searchParams
    const { id: idParamRaw } = await params;
    const qs = await searchParams;

    // 2) Resolve id/slug/hash
    const idFromPath = (idParamRaw ?? "").toString().trim();
    const idFromQuery =
        (Array.isArray(qs?.id) ? qs.id[0] : qs?.id)?.toString().trim() || "";
    const hFromQuery =
        (Array.isArray(qs?.h) ? qs.h[0] : qs?.h)?.toString().trim() || "";

    const idOrKey = decodeURIComponent(idFromPath || idFromQuery || hFromQuery || "");
    console.log("🔎 LP Detail — idFromPath:", idFromPath, "idFromQuery:", idFromQuery, "hFromQuery:", hFromQuery, "→ idOrKey:", idOrKey);

    if (!idOrKey) {
        return (
            <main className="p-6">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader><CardTitle>Landing Pages</CardTitle></CardHeader>
                    <CardContent>Parâmetro de página ausente.</CardContent>
                </Card>
            </main>
        );
    }

    // 3) Perfil/organização
    let me: Awaited<ReturnType<typeof getCurrentProfile>> | null = null;
    try {
        me = await getCurrentProfile();
    } catch (e) {
        console.error("getCurrentProfile error:", e);
    }
    if (!me?.orgId) {
        return (
            <main className="p-6">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader><CardTitle>Landing Pages</CardTitle></CardHeader>
                    <CardContent>Vincule-se a uma organização para acessar.</CardContent>
                </Card>
            </main>
        );
    }

    // 4) Carrega do banco (aceita UUID, slug ou public_hash)
    const lp = await getLandingDetail(idOrKey);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const publicUrl = lp.slug ? `${siteUrl}/lp/${lp.slug}` : `${siteUrl}/lp?h=${lp.public_hash}`;
    const PUBLIC_CONFIG_URL = `${siteUrl}/api/lp/${encodeURIComponent(lp.slug || lp.public_hash)}/config`;

    const ENV_BLOCK = [
        `# --- CRM LP CONFIG ---`,
        `CRM_ORG_ID=${lp.org.id}`,
        `CRM_LANDING_ID=${lp.id}`,
        `CRM_LANDING_HASH=${lp.public_hash}`,
        `CRM_LEADS_ENDPOINT=${siteUrl}/api/leads`,
    ].join("\n");

    const HTML_FORM = `<!-- Exemplo de formulário HTML puro enviando ao seu /api/leads -->

<form id="lead-form" method="post" action="${siteUrl}/api/leads">
  <input type="hidden" name="origem" value="lp_externa">
  <input type="hidden" name="org_id" value="${lp.org.id}">
  <input type="hidden" name="landing_id" value="${lp.id}">
  <input type="hidden" name="public_hash" value="${lp.public_hash}">
  <!-- UTMs -->
  <input type="hidden" name="utm_source">
  <input type="hidden" name="utm_medium">
  <input type="hidden" name="utm_campaign">
  <input type="hidden" name="utm_term">
  <input type="hidden" name="utm_content">
  <!-- Campos de origem (relatórios) -->
  <input type="hidden" name="source_label" value="Campanha Natal 2025">
  <input type="hidden" name="form_label" value="LP Principal / Google">
  <input type="hidden" name="channel" value="google_ads">
  <!-- Honeypot -->
  <div style="position:absolute;left:-9999px;">
    <label>Company</label><input name="company" tabindex="-1" autocomplete="off">
  </div>
  <label>Nome</label><input name="nome" required>
  <label>WhatsApp</label><input name="telefone" required>
  <label>Email</label><input name="email" type="email">
  <label>Valor carta (R$)</label><input name="valorInteresse">
  <label>Prazo (meses)</label><input name="prazoMeses">
  <label>Objetivo</label><input name="objetivo">
  <label>Perfil</label><input name="perfil">
  <label>Observações</label><textarea name="observacoes"></textarea>
  <label><input type="checkbox" name="consentimento" value="true" checked> Autorizo contato</label>
  <button type="submit">Enviar</button>
</form>

<script>
(function(){
  var p = new URLSearchParams(window.location.search);
  var keys = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"];
  keys.forEach(function(k){
    var el = document.querySelector('input[name="'+k+'"]');
    if (el) el.value = p.get(k) || "";
  });
})();
</script>`;

    const JS_UTM = `// Preenche UTMs a partir da URL + defaults da LP
(function(){
  var d = document, p = new URLSearchParams(window.location.search);
  var keys = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"];
  var defaults = ${JSON.stringify(lp.utm_defaults ?? {}, null, 2)};
  keys.forEach(function(k){
    var el = d.querySelector('input[name="'+k+'"]');
    if (el) el.value = p.get(k) || defaults[k] || "";
  });
})();`;

    const PUBLIC_JSON = JSON.stringify({
        landing: {
            id: lp.id, slug: lp.slug, public_hash: lp.public_hash, active: lp.active,
            utm_defaults: lp.utm_defaults ?? {},
        },
        org: { id: lp.org.id, nome: lp.org.nome, slug: lp.org.slug },
        leads_endpoint: `${siteUrl}/api/leads`,
    }, null, 2);

    // ======= Server Actions locais =======
    async function actionSaveDomains(formData: FormData) {
        "use server";
        const raw = String(formData.get("domains") || "");
        const domains = raw.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
        await updateLandingSecurity(lp.id, domains);
    }

    async function actionRotateSecret() {
        "use server";
        await rotateWebhookSecret(lp.id);
    }

    const DOMAINS_TEXT = Array.isArray(lp.allowed_domains)
        ? lp.allowed_domains.join("\n")
        : typeof lp.allowed_domains === "string"
            ? lp.allowed_domains
            : "";
    const EMBED_HTML = HTML_FORM;

    const WEBHOOK_JSON = `// Exemplo JSON assinado (Node)
import crypto from "node:crypto";
const url = "${siteUrl}/api/leads";
const body = {
  org_id: "${lp.org.id}",
  landing_id: "${lp.id}",
  public_hash: "${lp.public_hash}",
  nome: "Maria",
  telefone: "5511999999999",
  email: "maria@email.com",
  consentimento: true,
  // origem
  source_label: "Campanha Natal 2025",
  form_label: "LP Principal / Google",
  channel: "google_ads",
  // utms
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "natal",
};
const secret = "${lp.webhook_secret || "GERAR_SECRET_NO_PAINEL"}";
const payload = JSON.stringify(body);
const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
await fetch(url, {
  method: "POST",
  headers: { "content-type": "application/json", "X-Auth-Signature": sig },
  body: payload,
});`;

    return (
        <main className="p-6 space-y-6">
            <ToastAnnouncer />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Globe2 className="h-5 w-5 text-emerald-400" />
                    <h1 className="text-2xl font-semibold">LP • {lp.slug ?? lp.public_hash}</h1>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/app/landing-pages"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Link>
                </Button>
            </div>

            <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label>URL pública</Label>
                        <div className="flex gap-2">
                            <Input readOnly value={publicUrl} />
                            <CopyButton value={publicUrl} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Config JSON pública</Label>
                        <div className="flex gap-2">
                            <Input readOnly value={PUBLIC_CONFIG_URL} />
                            <CopyButton value={PUBLIC_CONFIG_URL} />
                        </div>
                    </div>
                    <Hint>
                        Use a <Kbd>URL pública</Kbd> para testar a LP pronta no nosso domínio.
                        A <Kbd>Config JSON</Kbd> expõe dados básicos para quem quiser renderizar a LP do lado do cliente (sem credenciais).
                    </Hint>
                </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle>ENV (projetos Next/Node)</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-end"><CopyButton value={ENV_BLOCK} /></div>
                    <Hint>
                        Em projetos Next/Node, coloque isso no <Kbd>.env</Kbd> e use em seu front-end
                        quando precisar compor requests para <Kbd>/api/leads</Kbd>.
                    </Hint>
                    <pre className="text-xs bg-black/40 p-3 rounded-md overflow-x-auto">{ENV_BLOCK}</pre>
                </CardContent>

            </Card>

            <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle>HTML do formulário (LP externa)</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-end"><CopyButton value={HTML_FORM} /></div>
                    <Hint>
                        Copie e cole em qualquer site (WordPress, Elementor, HTML puro).
                        Campos obrigatórios: <Kbd>nome</Kbd>, <Kbd>telefone</Kbd> e <Kbd>consentimento</Kbd>.{" "}
                        O formulário já inclui honeypot contra bots e UTMs automáticas
                        <Tt tip="O script preenche utm_source/utm_medium/utm_campaign/utm_term/utm_content a partir da URL." />.
                    </Hint>
                    <Hint>
                        <strong>Dica:</strong> o campo <Kbd>telefone</Kbd> deve ir somente com dígitos (ex.: 5511999999999).
                        Se seu formulário mascara o número, normalize antes de enviar.
                    </Hint>
                    <pre className="text-xs bg-black/40 p-3 rounded-md overflow-x-auto">{HTML_FORM}</pre>
                </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle>Script de UTMs</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-end"><CopyButton value={`<script>${JS_UTM}</script>`} /></div>
                    <Hint>
                        Cole este <Kbd>&lt;script&gt;</Kbd> no fim da sua página. Ele puxa as UTMs da URL
                        e preenche os <Kbd>inputs hidden</Kbd> do formulário automaticamente.
                    </Hint>
                    <pre className="text-xs bg-black/40 p-3 rounded-md overflow-x-auto">{JS_UTM}</pre>
                </CardContent>

            </Card>

            <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle>Config pública (exemplo)</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-end"><CopyButton value={PUBLIC_JSON} /></div>
                    <Hint>
                        Útil para renderizar breadcrumbs/labels no seu site sem expor segredos.{" "}
                        <Tt tip="Não inclui chaves privadas; é seguro para ser usado client-side." />
                    </Hint>
                    <pre className="text-xs bg-black/40 p-3 rounded-md overflow-x-auto">{PUBLIC_JSON}</pre>
                </CardContent>

            </Card>

            {/* Segurança e Integração */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle>Segurança da Integração</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Hint>
                        Informe domínios permitidos (um por linha). Ex.: <Kbd>seudominio.com</Kbd> ou{" "}
                        <Kbd>app.seudominio.com</Kbd>. Nós validamos <Kbd>Origin</Kbd>/<Kbd>Referer</Kbd> contra essa lista.
                    </Hint>
                    <form action={actionSaveDomains} className="space-y-2">
                        <Label>Allowed Domains (um por linha ou separados por vírgula)</Label>
                        <textarea name="domains" defaultValue={DOMAINS_TEXT} className="w-full h-28 rounded-md bg-black/30 p-2 text-sm" />
                        <div className="flex gap-2">
                            <Button type="submit">Salvar domínios</Button>
                            <span className="text-xs text-muted-foreground">Referer/Origin devem conter um desses domínios.</span>
                        </div>
                    </form>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Webhook Secret (HMAC)</Label>
                            <Input readOnly value={lp.webhook_secret || ""} />
                            <form action={actionRotateSecret}>
                                <Button type="submit" variant="secondary">Gerar/Rotacionar Secret</Button>
                            </form>
                            <p className="text-xs text-muted-foreground">
                                Obrigatório apenas para integrações <strong>JSON</strong>. Formulários HTML não precisam de HMAC.
                            </p>
                        </div>
                    </div>
                    <Hint>
                        <strong>Use HMAC somente para JSON</strong>. Se for formulário HTML puro (post de navegador), não precisa assinar.{" "}
                        <Tt tip="Quando você envia application/json via fetch/axios, exigimos X-Auth-Signature = HMAC_SHA256(secret, body)" />
                    </Hint>

                </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle>Teste rápido (sem programar)</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <Hint>
                        Envie um lead de teste direto daqui. Isso usa <Kbd>form-data</Kbd> (como um formulário de site) e
                        respeita seus <Kbd>Allowed Domains</Kbd>.
                    </Hint>
                    <form
                        action={`${siteUrl}/api/leads`}
                        method="post"
                        target="_blank"
                        className="grid gap-2 md:grid-cols-3"
                    >
                        <input type="hidden" name="org_id" value={lp.org.id} />
                        <input type="hidden" name="landing_id" value={lp.id} />
                        <input type="hidden" name="public_hash" value={lp.public_hash} />
                        <Input name="nome" placeholder="Nome" required />
                        <Input name="telefone" placeholder="5511999999999" required />
                        <Input name="email" type="email" placeholder="email@exemplo.com" />
                        <Input name="valorInteresse" placeholder="350000" />
                        <Input name="prazoMeses" placeholder="180" />
                        <Input name="objetivo" placeholder="Comprar imóvel" />
                        <Input name="perfil" placeholder="nao_informado" />
                        <Input name="observacoes" placeholder="Lead de teste" />
                        <input type="hidden" name="consentimento" value="true" />
                        <div className="md:col-span-3">
                            <Button type="submit">Enviar lead de teste</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Embeds (cópia rápida) */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle>Embed • Form HTML</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex justify-end"><CopyButton value={EMBED_HTML} /></div>
                    <Hint>
                        Para um teste rápido sem publicar no seu site, abra a URL pública da LP e verifique se os leads chegam no Kanban.
                    </Hint>
                    <pre className="text-xs bg-black/40 p-3 rounded-md overflow-x-auto">{EMBED_HTML}</pre>
                </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle>Webhook • JSON Assinado (HMAC)</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex justify-end"><CopyButton value={WEBHOOK_JSON} /></div>
                    <Hint>
                        Para integrações headless (React, Vue, Apps), envie <Kbd>application/json</Kbd> assinado.
                        Exemplo em Node abaixo. Em outras linguagens, gere o HMAC SHA-256 do <Kbd>body JSON</Kbd> com o <Kbd>secret</Kbd> e
                        envie no header <Kbd>X-Auth-Signature</Kbd>.
                    </Hint>
                    <pre className="text-xs bg-black/40 p-3 rounded-md overflow-x-auto">{WEBHOOK_JSON}</pre>
                </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle>Ajuda rápida</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>“Origem não permitida”</strong>: inclua seu domínio em <Kbd>Allowed Domains</Kbd> e salve.</li>
                        <li><strong>Telefone inválido</strong>: envie apenas dígitos com DDI/DDD (ex.: 5511999999999).</li>
                        <li><strong>Erro de enum/perfil</strong>: use valores como <Kbd>nao_informado</Kbd> ou um dos perfis sugeridos no painel.</li>
                        <li><strong>JSON com HMAC</strong>: calcule o SHA-256 do body e envie no header <Kbd>X-Auth-Signature</Kbd>.</li>
                        <li><strong>Spam</strong>: mantemos um campo honeypot <Kbd>company</Kbd>; não preencha esse campo no formulário real.</li>
                    </ul>
                </CardContent>
            </Card>

        </main>
    );
}

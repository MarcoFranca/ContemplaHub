export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Facebook,
  Plus,
  Siren,
  Unplug,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentProfile } from "@/lib/auth/server";
import { listUsers } from "@/app/app/usuarios/actions";
import { MetaIntegrationFormDialog } from "@/features/meta-integracoes/components/meta-integration-form-dialog";
import { MetaIntegrationOperations } from "@/features/meta-integracoes/components/meta-integration-operations";
import { MetaOAuthAssistant } from "@/features/meta-integracoes/components/meta-oauth-assistant";
import type { MetaOwnerOption } from "@/features/meta-integracoes/types";
import {
  listMetaIntegrationsAction,
} from "./actions";

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "inline-flex rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-300"
          : "inline-flex rounded-full bg-slate-500/15 px-2 py-1 text-xs font-medium text-slate-300"
      }
    >
      {active ? "ativo" : "inativo"}
    </span>
  );
}

export default async function MetaIntegracoesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const profile = await getCurrentProfile();
  const sp = (await searchParams) ?? {};
  const requestedTab =
    typeof sp.tab === "string" && sp.tab === "oauth" ? "oauth" : "manual";
  const oauthConnected = sp.oauth_connected === "1";
  const oauthError =
    typeof sp.oauth_error === "string" ? decodeURIComponent(sp.oauth_error) : null;

  if (!profile?.orgId) {
    return <main className="p-6">Vincule-se a uma organização.</main>;
  }

  if (!profile.isManager) {
    return (
      <main className="p-6">
        Apenas gestores e administradores podem configurar integrações Meta.
      </main>
    );
  }

  const [integrations, usersResult] = await Promise.all([
    listMetaIntegrationsAction(),
    listUsers({ page: 1, pageSize: 200, withOwner: false }),
  ]);

  const ownerOptions: MetaOwnerOption[] = usersResult.rows.map((row) => ({
    id: row.user_id,
    nome: row.nome ?? row.email ?? "Usuário sem nome",
    email: row.email ?? null,
  }));

  const activeCount = integrations.filter((item) => item.ativo).length;
  const withSuccess = integrations.filter((item) => item.last_success_at).length;
  const withErrors = integrations.filter((item) => item.last_error_at).length;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Meta Lead Ads</h1>
          <p className="text-sm text-muted-foreground">
            Configure páginas e formulários da Meta por organização para jogar
            leads automaticamente na etapa <strong>novo</strong> do funil.
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          Manual para admins e homologação. Assistido para conexão real com a Meta.
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Integrações</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-semibold">
            <Facebook className="h-5 w-5 text-emerald-500" />
            {integrations.length}
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ativas</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-semibold">
            <Activity className="h-5 w-5 text-emerald-500" />
            {activeCount}
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Com sucesso recente</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-semibold">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            {withSuccess}
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Com erro recente</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-semibold">
            <Siren className="h-5 w-5 text-amber-400" />
            {withErrors}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={requestedTab} className="space-y-4">
        <TabsList className="bg-white/[0.04]">
          <TabsTrigger value="manual">Modo manual</TabsTrigger>
          <TabsTrigger value="oauth">Conectar Meta</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-4">
                <span>Cadastro manual</span>
                <MetaIntegrationFormDialog
                  ownerOptions={ownerOptions}
                  trigger={
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nova integração
                    </Button>
                  }
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Use este modo quando precisar informar `page_id`, `form_id`,
                `verify_token` e `access_token` manualmente. Ele continua
                disponível para fallback operacional, admins e homologação.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oauth">
          <MetaOAuthAssistant
            ownerOptions={ownerOptions}
            oauthConnected={oauthConnected}
            oauthError={oauthError}
          />
        </TabsContent>
      </Tabs>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader>
          <CardTitle>Integrações da organização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Integração</TableHead>
                <TableHead>Status operacional</TableHead>
                <TableHead>Página</TableHead>
                <TableHead>Formulário</TableHead>
                <TableHead>Source label</TableHead>
                <TableHead>Responsável padrão</TableHead>
                <TableHead>Último webhook</TableHead>
                <TableHead>Último sucesso</TableHead>
                <TableHead>Último erro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integrations.map((integration) => {
                const owner = ownerOptions.find(
                  (option) => option.id === integration.default_owner_id,
                );

                return (
                  <TableRow key={integration.id}>
                    <TableCell>
                      <div className="font-medium">{integration.nome}</div>
                      <div className="text-xs text-muted-foreground">
                        provider: {integration.provider}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-3">
                        <StatusBadge active={integration.ativo} />
                        <MetaIntegrationOperations integration={integration} compact />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{integration.page_name ?? "Página sem nome"}</div>
                      <div className="text-xs text-muted-foreground">
                        {integration.page_id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{integration.form_name ?? "Todos os formulários"}</div>
                      <div className="text-xs text-muted-foreground">
                        {integration.form_id ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell>{integration.source_label}</TableCell>
                    <TableCell>{owner?.nome ?? "—"}</TableCell>
                    <TableCell>{formatDateTime(integration.last_webhook_at)}</TableCell>
                    <TableCell>{formatDateTime(integration.last_success_at)}</TableCell>
                    <TableCell>
                      <div>{formatDateTime(integration.last_error_at)}</div>
                      {integration.last_error_message ? (
                        <div className="mt-1 max-w-xs text-xs text-amber-300">
                          {integration.last_error_message}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <MetaIntegrationFormDialog
                          ownerOptions={ownerOptions}
                          initialData={integration}
                          trigger={
                            <Button variant="outline" size="sm">
                              Editar
                            </Button>
                          }
                        />
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/app/meta-integracoes/${integration.id}`}>
                            Eventos
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {integrations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="py-10 text-center text-muted-foreground"
                  >
                    <div className="inline-flex flex-col items-center gap-2">
                      <Unplug className="h-5 w-5" />
                      Nenhuma integração Meta cadastrada nesta organização.
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

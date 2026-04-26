import Link from "next/link";
import type { ComponentType } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Facebook,
  Link2,
  RadioTower,
  TriangleAlert,
} from "lucide-react";

import { listMetaIntegrationsAction } from "@/app/app/meta-integracoes/actions";
import { listUsers } from "@/app/app/usuarios/actions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MetaIntegrationFormDialog } from "@/features/meta-integracoes/components/meta-integration-form-dialog";
import { MetaIntegrationOperations } from "@/features/meta-integracoes/components/meta-integration-operations";
import { MetaOAuthAssistant } from "@/features/meta-integracoes/components/meta-oauth-assistant";
import type {
  MetaIntegration,
  MetaOwnerOption,
} from "@/features/meta-integracoes/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type MetaIntegracoesPageProps = {
  searchParams?: SearchParams;
};

type SummaryCardProps = {
  title: string;
  value: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "default" | "ok" | "warn";
};

function getFriendlyStatus(integration: MetaIntegration) {
  if (!integration.ativo) {
    return {
      label: "Inativo",
      tone: "border-white/10 bg-white/[0.04] text-slate-300",
    };
  }

  if (integration.last_error_at || integration.connection_error || integration.subscription_error) {
    return {
      label: "Requer atenção",
      tone: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    };
  }

  if (integration.page_subscribed && integration.connection_ok) {
    return {
      label: "Ativo",
      tone: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    };
  }

  return {
    label: "Configurado",
    tone: "border-teal-400/30 bg-teal-400/10 text-teal-200",
  };
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}

function SummaryCard({
                       title,
                       value,
                       description,
                       icon: Icon,
                       tone = "default",
                     }: SummaryCardProps) {
  const toneClasses =
      tone === "ok"
          ? "border-emerald-400/20 bg-emerald-400/10"
          : tone === "warn"
              ? "border-amber-400/20 bg-amber-400/10"
              : "border-white/10 bg-white/[0.03]";

  return (
      <Card className={toneClasses}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardDescription>{title}</CardDescription>
            <CardTitle className="text-3xl">{value}</CardTitle>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-2.5 text-emerald-200">
            <Icon className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-slate-300">{description}</CardContent>
      </Card>
  );
}

export default async function MetaIntegracoesPage({
                                                    searchParams,
                                                  }: MetaIntegracoesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const successParam = resolvedSearchParams.success;
  const metaConnectedParam = resolvedSearchParams.meta_connected;
  const errorParam = resolvedSearchParams.error;

  const oauthSuccess =
      successParam === "true" ||
      metaConnectedParam === "1" ||
      (Array.isArray(successParam) && successParam.includes("true")) ||
      (Array.isArray(metaConnectedParam) && metaConnectedParam.includes("1"));

  const oauthError = Array.isArray(errorParam)
      ? errorParam[0] ?? null
      : errorParam ?? null;

  let integrations: MetaIntegration[] = [];
  let ownerOptions: MetaOwnerOption[] = [];
  let pageError: string | null = null;

  try {
    const [integrationsResult, users] = await Promise.all([
      listMetaIntegrationsAction(),
      listUsers(),
    ]);

    integrations = integrationsResult;
    ownerOptions = users.rows.map((user) => ({
      id: user.user_id,
      nome: user.nome ?? user.email ?? "Usuário sem nome",
      email: user.email,
    }));
  } catch (error) {
    pageError =
        error instanceof Error
            ? error.message
            : "Falha ao carregar a tela de integrações Meta.";
  }

  const totalIntegrations = integrations.length;
  const activeIntegrations = integrations.filter((integration) => integration.ativo).length;
  const recentErrors = integrations.filter(
      (integration) =>
          integration.last_error_at ||
          integration.connection_error ||
          integration.subscription_error,
  ).length;

  const lastSuccessfulIntegration = [...integrations]
      .filter((integration) => integration.last_success_at)
      .sort((a, b) =>
          new Date(b.last_success_at ?? 0).getTime() -
          new Date(a.last_success_at ?? 0).getTime(),
      )[0];

  const nextStepMessage = pageError
      ? "Não conseguimos carregar os dados da integração agora. Revise a mensagem abaixo antes de continuar."
      : totalIntegrations === 0
          ? "Conecte sua conta Meta para escolher a página e o formulário que vão abastecer o funil automaticamente."
          : recentErrors > 0
              ? "Existe pelo menos uma integração pedindo atenção. Revise o status da linha correspondente ou abra o diagnóstico avançado."
              : activeIntegrations === 0
                  ? "As páginas já estão cadastradas, mas ainda é preciso ativar a integração que deve receber os próximos leads."
                  : "Sua operação Meta já está configurada. Os próximos leads desse formulário devem cair automaticamente no funil.";

  const nextStepTone = pageError
      ? "border-amber-500/20 bg-amber-500/10 text-amber-100"
      : recentErrors > 0
          ? "border-amber-500/20 bg-amber-500/10 text-amber-100"
          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-100";

  return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto px-6 py-6 pb-24">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
          <section className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-emerald-200">
                  <Facebook className="h-3.5 w-3.5" />
                  Meta Lead Ads
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-white">
                    Leads do Facebook
                  </h1>
                  <p className="max-w-3xl text-sm leading-6 text-slate-300">
                    Conecte páginas e formulários da Meta para receber leads
                    automaticamente no funil.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <MetaIntegrationFormDialog
                    ownerOptions={ownerOptions}
                    trigger={<Button variant="outline" className="border-white/10">Cadastro manual</Button>}
                />
              </div>
            </div>

            <Alert className={nextStepTone}>
              {pageError || recentErrors > 0 ? (
                  <TriangleAlert className="h-4 w-4" />
              ) : (
                  <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertTitle>
                {pageError
                    ? "Há um bloqueio para revisar"
                    : recentErrors > 0
                        ? "Existe uma integração pedindo atenção"
                        : "Próximo passo claro"}
              </AlertTitle>
              <AlertDescription>{nextStepMessage}</AlertDescription>
            </Alert>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
                title="Integrações totais"
                value={String(totalIntegrations)}
                description="Páginas e formulários já cadastrados nesta organização."
                icon={Link2}
            />
            <SummaryCard
                title="Integrações ativas"
                value={String(activeIntegrations)}
                description="Integrações prontas para receber leads automaticamente."
                icon={RadioTower}
                tone={activeIntegrations > 0 ? "ok" : "default"}
            />
            <SummaryCard
                title="Último lead recebido"
                value={lastSuccessfulIntegration ? formatDateTime(lastSuccessfulIntegration.last_success_at) : "—"}
                description={
                  lastSuccessfulIntegration
                      ? `${lastSuccessfulIntegration.page_name ?? lastSuccessfulIntegration.page_id} recebeu o último lead com sucesso.`
                      : "Nenhum lead confirmado ainda para esta organização."
                }
                icon={CheckCircle2}
                tone={lastSuccessfulIntegration ? "ok" : "default"}
            />
            <SummaryCard
                title="Erros recentes"
                value={String(recentErrors)}
                description="Integrações com falha recente ou pendência operacional."
                icon={AlertCircle}
                tone={recentErrors > 0 ? "warn" : "default"}
            />
          </section>

          {pageError ? (
              <Card className="border-amber-500/20 bg-amber-500/10">
                <CardHeader>
                  <CardTitle className="text-amber-100">
                    Falha ao carregar integrações Meta
                  </CardTitle>
                  <CardDescription className="text-amber-50/90">
                    {pageError}
                  </CardDescription>
                </CardHeader>
              </Card>
          ) : (
              <>
                <MetaOAuthAssistant
                    ownerOptions={ownerOptions}
                    oauthSuccess={oauthSuccess}
                    oauthError={oauthError}
                />

                <Card className="border-white/10 bg-white/[0.03]">
                  <CardHeader className="space-y-2">
                    <CardTitle>Integrações existentes</CardTitle>
                    <CardDescription>
                      Acompanhe rapidamente quais páginas já estão conectadas, quem recebe os
                      leads e quais integrações ainda precisam de atenção.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {integrations.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-6 py-10 text-center text-sm text-slate-400">
                          Nenhuma integração Meta cadastrada ainda. Use o fluxo assistido acima para
                          conectar sua primeira página.
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-white/10">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-white/10">
                                <TableHead>Integração</TableHead>
                                <TableHead>Página</TableHead>
                                <TableHead>Formulário</TableHead>
                                <TableHead>Responsável</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Último lead</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {integrations.map((integration) => {
                                const owner = ownerOptions.find(
                                    (option) => option.id === integration.default_owner_id,
                                );
                                const ownerLabel =
                                    owner?.nome ||
                                    owner?.email ||
                                    "Sem responsável padrão";
                                const friendlyStatus = getFriendlyStatus(integration);

                                return (
                                    <TableRow key={integration.id} className="border-white/10 align-top">
                                      <TableCell className="min-w-[220px]">
                                        <div className="space-y-1">
                                          <div className="font-medium text-white">
                                            {integration.nome}
                                          </div>
                                          <p className="text-xs text-slate-400">
                                            Origem: {integration.source_label || "Meta Ads"}
                                          </p>
                                        </div>
                                      </TableCell>
                                      <TableCell className="min-w-[190px]">
                                        <div className="space-y-1">
                                          <div className="text-sm text-slate-100">
                                            {integration.page_name ?? "Página sem nome"}
                                          </div>
                                          <div className="text-xs text-slate-400">
                                            {integration.page_id}
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="min-w-[180px]">
                                        <div className="space-y-1">
                                          <div className="text-sm text-slate-100">
                                            {integration.form_name ?? "Todos os formulários"}
                                          </div>
                                          <div className="text-xs text-slate-400">
                                            {integration.form_id ?? "Sem filtro por formulário"}
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="min-w-[190px] text-sm text-slate-300">
                                        {ownerLabel}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${friendlyStatus.tone}`}
                                        >
                                          {friendlyStatus.label}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-sm text-slate-300">
                                        {formatDateTime(integration.last_success_at)}
                                      </TableCell>
                                      <TableCell className="min-w-[320px]">
                                        <div className="flex flex-col items-end gap-3">
                                          <div className="flex flex-wrap justify-end gap-2">
                                            <MetaIntegrationFormDialog
                                                ownerOptions={ownerOptions}
                                                initialData={integration}
                                                trigger={<Button size="sm" variant="outline" className="border-white/10">Editar</Button>}
                                            />
                                            <Button asChild size="sm" variant="outline" className="border-white/10">
                                              <Link href={`/app/meta-integracoes/${integration.id}`}>
                                                Eventos
                                              </Link>
                                            </Button>
                                          </div>
                                          <div className="w-full max-w-[320px]">
                                            <MetaIntegrationOperations integration={integration} compact />
                                          </div>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-white/[0.03]">
                  <CardHeader className="space-y-2">
                    <CardTitle>Fallback manual</CardTitle>
                    <CardDescription>
                      Use esta área apenas quando precisar cadastrar uma página manualmente,
                      corrigir campos específicos ou apoiar um caso de suporte.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="manual" className="border-white/10">
                        <AccordionTrigger className="text-sm text-slate-200 hover:no-underline">
                          Avançado e diagnóstico
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <Alert className="border-white/10 bg-black/10 text-slate-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Quando usar este bloco</AlertTitle>
                            <AlertDescription>
                              Ele é útil para suporte, migração de páginas antigas, revisão de
                              dados técnicos e remoção manual da integração quando necessário.
                            </AlertDescription>
                          </Alert>

                          <div className="flex flex-wrap gap-3">
                            <MetaIntegrationFormDialog
                                ownerOptions={ownerOptions}
                                trigger={<Button variant="outline" className="border-white/10">Cadastrar manualmente</Button>}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </>
          )}
        </div>
      </div>
  );
}

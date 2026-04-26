"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Link2,
  Power,
  RadioTower,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  deleteMetaIntegrationAction,
  getMetaIntegrationSubscriptionStatusAction,
  setMetaIntegrationActiveAction,
  subscribeMetaIntegrationPageAction,
  testMetaIntegrationConnectionAction,
} from "@/app/app/meta-integracoes/actions";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MetaIntegration } from "@/features/meta-integracoes/types";
import { cn } from "@/lib/utils";

type Props = {
  integration: MetaIntegration;
  compact?: boolean;
};

type FriendlyStatus = {
  label: string;
  tone: "ok" | "warn" | "unknown";
  description: string;
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}

function statusClasses(tone: FriendlyStatus["tone"]) {
  if (tone === "ok") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }
  if (tone === "warn") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  }
  return "border-white/10 bg-white/[0.04] text-slate-300";
}

function getFriendlyStatus(integration: MetaIntegration): FriendlyStatus {
  if (!integration.ativo) {
    return {
      label: "Inativo",
      tone: "unknown",
      description:
        "A página está cadastrada, mas a entrada automática de leads está desligada.",
    };
  }

  if (integration.last_error_at || integration.connection_error || integration.subscription_error) {
    return {
      label: "Requer atenção",
      tone: "warn",
      description:
        "A integração existe, mas há um erro operacional que merece revisão.",
    };
  }

  if (integration.page_subscribed && integration.connection_ok) {
    return {
      label: "Ativo",
      tone: "ok",
      description:
        "A integração está pronta para receber leads automaticamente desta página.",
    };
  }

  if (integration.access_token_configured || integration.webhook_configured) {
    return {
      label: "Configurado",
      tone: "ok",
      description:
        "A conexão principal foi feita. Falta apenas confirmar os últimos detalhes operacionais.",
    };
  }

  return {
    label: "Inativo",
    tone: "unknown",
    description: "Ainda falta concluir a configuração desta integração.",
  };
}

export function MetaIntegrationOperations({
  integration,
  compact = false,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const friendlyStatus = getFriendlyStatus(integration);

  const runAction = <TData,>(
    fn: () => Promise<{ ok: boolean; error?: string; data?: TData }>,
    successMessage: string,
  ) => {
    startTransition(async () => {
      try {
        const result = await fn();
        if (!result.ok) {
          toast.error(result.error || "Erro na operação da integração Meta.");
          return;
        }
        toast.success(successMessage);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erro na operação da integração Meta.",
        );
      }
    });
  };

  const advancedLabel = compact ? "Avançado" : "Avançado e diagnóstico";

  return (
    <div
      className={cn(
        "space-y-3",
        !compact &&
          "rounded-lg border border-white/10 bg-white/[0.03] p-4 shadow-[0_18px_55px_-42px_rgba(16,185,129,0.45)]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", statusClasses(friendlyStatus.tone))}>
            {friendlyStatus.label}
          </Badge>
          <p className="max-w-xl text-xs leading-5 text-slate-300">
            {friendlyStatus.description}
          </p>
        </div>

        {!compact ? (
          <div className="grid min-w-[220px] gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <div className="inline-flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              Último webhook: {formatDateTime(integration.last_webhook_at)}
            </div>
            <div className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
              Último lead: {formatDateTime(integration.last_success_at)}
            </div>
          </div>
        ) : null}
      </div>

      {(integration.connection_error || integration.subscription_error) && !compact ? (
        <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-100">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Há um ponto pendente nesta integração</AlertTitle>
          <AlertDescription>
            {integration.subscription_error ||
              integration.connection_error ||
              "Revise o diagnóstico avançado para entender o bloqueio."}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={integration.ativo ? "outline" : "default"}
          size="sm"
          disabled={isPending}
          className={cn(
            "gap-2",
            integration.ativo
              ? "border-white/10"
              : "bg-emerald-500 text-black hover:bg-emerald-400",
          )}
          onClick={() =>
            runAction(
              () => setMetaIntegrationActiveAction(integration.id, !integration.ativo),
              integration.ativo
                ? "Integração Meta desativada."
                : "Integração Meta ativada.",
            )
          }
        >
          <Power className="h-4 w-4" />
          {integration.ativo ? "Desativar" : "Reativar"}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isPending}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Remover
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border border-red-500/40 bg-slate-950">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-300">
                Remover página integrada?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-300">
                A página <strong>{integration.page_name ?? integration.page_id}</strong> será
                desconectada do ContemplaHub. Vamos tentar desinscrever o app da Meta antes de
                remover o vínculo local.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                disabled={isPending}
                className="bg-red-600 text-white hover:bg-red-500"
                onClick={() =>
                  runAction(async () => {
                    const result = await deleteMetaIntegrationAction(integration.id);
                    if (result.ok && result.data?.detail) {
                      toast.warning(
                        "Integração removida com aviso da Meta.",
                        {
                          description: result.data.detail,
                        },
                      );
                    }
                    return result;
                  }, "Integração Meta removida.")
                }
              >
                Remover definitivamente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Accordion type="single" collapsible className="rounded-lg border border-white/10 bg-black/10 px-4">
        <AccordionItem value="advanced" className="border-none">
          <AccordionTrigger className="py-3 text-sm font-medium text-slate-200 hover:no-underline">
            {advancedLabel}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", statusClasses(integration.webhook_configured ? "ok" : "warn"))}>
                Webhook {integration.webhook_configured ? "configurado" : "pendente"}
              </Badge>
              <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", statusClasses(integration.access_token_configured ? "ok" : "warn"))}>
                Token {integration.access_token_configured ? "presente" : "ausente"}
              </Badge>
              <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", statusClasses(integration.page_subscribed === true ? "ok" : integration.page_subscribed === false ? "warn" : "unknown"))}>
                {integration.page_subscribed === true
                  ? "Página inscrita"
                  : integration.page_subscribed === false
                    ? "Página não inscrita"
                    : "Inscrição não verificada"}
              </Badge>
              <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", statusClasses(integration.connection_ok === true ? "ok" : integration.connection_ok === false ? "warn" : "unknown"))}>
                {integration.connection_ok === true
                  ? "Conexão validada"
                  : integration.connection_ok === false
                    ? "Conexão com erro"
                    : "Conexão não testada"}
              </Badge>
            </div>

            <div className={cn("grid gap-2 text-xs text-muted-foreground", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
              <div className="inline-flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                Último webhook: {formatDateTime(integration.last_webhook_at)}
              </div>
              <div className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                Último lead recebido: {formatDateTime(integration.last_success_at)}
              </div>
              <div className="inline-flex items-center gap-2">
                <Link2 className="h-3.5 w-3.5 text-emerald-300" />
                Verificação de inscrição: {formatDateTime(integration.subscription_checked_at)}
              </div>
              <div className="inline-flex items-center gap-2">
                <RadioTower className="h-3.5 w-3.5 text-emerald-300" />
                Teste de conexão: {formatDateTime(integration.connection_checked_at)}
              </div>
            </div>

            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
              <div>
                <div className="font-medium text-slate-200">Page ID</div>
                <div>{integration.page_id}</div>
              </div>
              <div>
                <div className="font-medium text-slate-200">Form ID</div>
                <div>{integration.form_id ?? "Todos os formulários"}</div>
              </div>
              <div>
                <div className="font-medium text-slate-200">Integration ID</div>
                <div className="break-all">{integration.id}</div>
              </div>
            </div>

            {integration.subscription_error ? (
              <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-100">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Último erro de assinatura</AlertTitle>
                <AlertDescription>{integration.subscription_error}</AlertDescription>
              </Alert>
            ) : null}

            {integration.connection_error ? (
              <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-100">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Último erro de conexão</AlertTitle>
                <AlertDescription>{integration.connection_error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                className="gap-2 border-white/10"
                onClick={() =>
                  runAction(
                    () => testMetaIntegrationConnectionAction(integration.id),
                    "Conexão com a Meta validada.",
                  )
                }
              >
                <RadioTower className="h-4 w-4" />
                Testar conexão
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={isPending}
                className="gap-2 bg-emerald-500 text-black hover:bg-emerald-400"
                onClick={() =>
                  runAction(
                    () => subscribeMetaIntegrationPageAction(integration.id),
                    "Página inscrita no app da Meta.",
                  )
                }
              >
                <Link2 className="h-4 w-4" />
                Inscrever página
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending}
                className="gap-2"
                onClick={() =>
                  runAction(
                    () => getMetaIntegrationSubscriptionStatusAction(integration.id),
                    "Assinatura da página verificada.",
                  )
                }
              >
                <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
                Verificar assinatura
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

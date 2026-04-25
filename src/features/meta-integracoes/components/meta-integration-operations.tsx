"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
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

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}

function StatusPill({
  label,
  value,
}: {
  label: string;
  value: "ok" | "warn" | "unknown";
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border px-2.5 py-1 text-[11px] font-medium",
        value === "ok" &&
          "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
        value === "warn" &&
          "border-amber-400/30 bg-amber-400/10 text-amber-200",
        value === "unknown" &&
          "border-white/10 bg-white/[0.04] text-slate-300",
      )}
    >
      {label}
    </Badge>
  );
}

export function MetaIntegrationOperations({
  integration,
  compact = false,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const webhookStatus = integration.webhook_configured ? "ok" : "warn";
  const tokenStatus = integration.access_token_configured ? "ok" : "warn";
  const subscriptionStatus =
    integration.page_subscribed === true
      ? "ok"
      : integration.page_subscribed === false
        ? "warn"
        : "unknown";
  const connectionStatus =
    integration.connection_ok === true
      ? "ok"
      : integration.connection_ok === false
        ? "warn"
        : "unknown";

  const runAction = (
    fn: () => Promise<{ ok: boolean; error?: string }>,
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

  return (
    <div
      className={cn(
        "space-y-3",
        !compact &&
          "rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_20px_60px_-40px_rgba(16,185,129,0.45)]",
      )}
    >
      <div className="flex flex-wrap gap-2">
        <StatusPill
          label={`Webhook ${integration.webhook_configured ? "configurado" : "pendente"}`}
          value={webhookStatus}
        />
        <StatusPill
          label={`Token ${integration.access_token_configured ? "presente" : "ausente"}`}
          value={tokenStatus}
        />
        <StatusPill
          label={
            integration.page_subscribed === true
              ? "Página inscrita"
              : integration.page_subscribed === false
                ? "Página não inscrita"
                : "Inscrição não verificada"
          }
          value={subscriptionStatus}
        />
        <StatusPill
          label={
            integration.connection_ok === true
              ? "Conexão validada"
              : integration.connection_ok === false
                ? "Conexão com erro"
                : "Conexão não testada"
          }
          value={connectionStatus}
        />
      </div>

      <div
        className={cn(
          "grid gap-2 text-xs text-muted-foreground",
          compact ? "grid-cols-1" : "sm:grid-cols-2",
        )}
      >
        <div className="inline-flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
          Último webhook: {formatDateTime(integration.last_webhook_at)}
        </div>
        <div className="inline-flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
          Último sucesso: {formatDateTime(integration.last_success_at)}
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

      {integration.subscription_error ? (
        <p className="text-xs text-amber-300">
          Último erro de assinatura: {integration.subscription_error}
        </p>
      ) : null}

      {integration.connection_error ? (
        <p className="text-xs text-amber-300">
          Último erro de conexão: {integration.connection_error}
        </p>
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
          {integration.ativo ? "Desativar" : "Ativar integração"}
        </Button>

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
              Remover página
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border border-red-500/40 bg-slate-950">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-300">
                Remover integração Meta?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-300">
                A página <strong>{integration.page_name ?? integration.page_id}</strong> será
                removida do ContemplaHub. O sistema tenta desinscrever o app da Meta antes de
                apagar o vínculo local, mas a remoção local continua mesmo se a Meta devolver
                aviso de desinscrição.
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
                    if (result.ok && result.data.detail) {
                      toast.warning(
                        "Integração removida, mas a Meta retornou um aviso ao desinscrever a página.",
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
    </div>
  );
}

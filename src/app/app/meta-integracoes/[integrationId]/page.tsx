export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentProfile } from "@/lib/auth/server";
import {
  listMetaIntegrationEventsAction,
  listMetaIntegrationsAction,
} from "../actions";

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}

export default async function MetaIntegrationEventsPage({
  params,
}: {
  params: Promise<{ integrationId: string }>;
}) {
  const profile = await getCurrentProfile();
  const { integrationId } = await params;

  if (!profile?.orgId) {
    return <main className="p-6">Vincule-se a uma organização.</main>;
  }

  if (!profile.isManager) {
    return (
      <main className="p-6">
        Apenas gestores e administradores podem inspecionar eventos Meta.
      </main>
    );
  }

  const [integrations, events] = await Promise.all([
    listMetaIntegrationsAction(),
    listMetaIntegrationEventsAction(integrationId),
  ]);

  const integration = integrations.find((item) => item.id === integrationId);
  if (!integration) notFound();

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" className="gap-2 px-0">
            <Link href="/app/meta-integracoes">
              <ArrowLeft className="h-4 w-4" />
              Voltar para integrações
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{integration.nome}</h1>
            <p className="text-sm text-muted-foreground">
              Eventos recebidos do webhook da Meta para a página{" "}
              <strong>{integration.page_name ?? integration.page_id}</strong>.
            </p>
          </div>
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground">
          <div>Page ID: {integration.page_id}</div>
          <div>Form ID: {integration.form_id ?? "—"}</div>
          <div>Último webhook: {formatDateTime(integration.last_webhook_at)}</div>
        </div>
      </div>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader>
          <CardTitle>Eventos recebidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Leadgen</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Processado em</TableHead>
                <TableHead>Erro</TableHead>
                <TableHead>Payload</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.status}</TableCell>
                  <TableCell>{event.leadgen_id ?? "—"}</TableCell>
                  <TableCell>
                    <div>{event.event_type}</div>
                    <div className="text-xs text-muted-foreground">
                      {event.event_id ?? "—"}
                    </div>
                  </TableCell>
                  <TableCell>{formatDateTime(event.created_at)}</TableCell>
                  <TableCell>{formatDateTime(event.processed_at)}</TableCell>
                  <TableCell>
                    <div className="max-w-xs text-xs text-amber-300">
                      {event.error_message ?? "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <details className="max-w-sm rounded-lg border border-white/10 bg-black/20 p-3">
                      <summary className="cursor-pointer text-sm">
                        Ver payload
                      </summary>
                      <pre className="mt-3 whitespace-pre-wrap break-all text-xs text-slate-300">
                        {JSON.stringify(event.payload, null, 2)}
                      </pre>
                    </details>
                  </TableCell>
                </TableRow>
              ))}

              {events.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <div className="inline-flex flex-col items-center gap-2">
                      <ReceiptText className="h-5 w-5" />
                      Nenhum evento recebido ainda para esta integração.
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

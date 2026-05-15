"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, CircleSlash, FileSpreadsheet, Loader2, ShieldAlert, Upload } from "lucide-react";
import { toast } from "sonner";

import {
    confirmCarteiraImportAction,
    previewCarteiraImportAction,
    type ImportConfirmResponse,
    type ImportPreviewResponse,
    type ImportProduto,
} from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Props = {
    initialProduto?: ImportProduto;
};

function statusBadge(status: string) {
    switch (status) {
        case "pronta":
            return <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/15">Pronta</Badge>;
        case "aviso":
            return <Badge className="border-amber-500/30 bg-amber-500/15 text-amber-200 hover:bg-amber-500/15">Aviso</Badge>;
        case "erro":
            return <Badge variant="destructive">Erro</Badge>;
        case "ignorada":
            return <Badge variant="secondary">Ignorada</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function SummaryCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-md border border-border bg-card px-4 py-3">
            <div className="text-xs uppercase tracking-normal text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
        </div>
    );
}

export function ImportadorClient({ initialProduto = "imobiliario" }: Props) {
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const [rawText, setRawText] = React.useState("");
    const [produtoPadrao, setProdutoPadrao] = React.useState<ImportProduto>(initialProduto);
    const [preview, setPreview] = React.useState<ImportPreviewResponse | null>(null);
    const [confirmResult, setConfirmResult] = React.useState<ImportConfirmResponse | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isPreviewPending, startPreviewTransition] = React.useTransition();
    const [isConfirmPending, startConfirmTransition] = React.useTransition();

    const canValidate = rawText.trim().length > 0 && !isPreviewPending && !isConfirmPending;
    const canConfirm =
        !!preview &&
        preview.rows.some((row) => row.status === "pronta" || row.status === "aviso") &&
        !isPreviewPending &&
        !isConfirmPending;

    async function handlePreview() {
        if (!rawText.trim()) {
            setError("Cole os dados da planilha antes de validar.");
            return;
        }

        setError(null);
        setConfirmResult(null);
        startPreviewTransition(async () => {
            try {
                const data = await previewCarteiraImportAction({ rawText, produtoPadrao });
                setPreview(data);
                toast.success("Preview gerado.");
            } catch (err) {
                const message = err instanceof Error ? err.message : "Falha ao validar importação.";
                setPreview(null);
                setError(message);
                toast.error(message);
            }
        });
    }

    async function handleConfirm() {
        if (!preview) return;

        setError(null);
        startConfirmTransition(async () => {
            try {
                const data = await confirmCarteiraImportAction({ rawText, produtoPadrao });
                setConfirmResult(data);
                toast.success(`Importação concluída: ${data.imported_rows} linha(s) importada(s).`);
            } catch (err) {
                const message = err instanceof Error ? err.message : "Falha ao confirmar importação.";
                setError(message);
                toast.error(message);
            }
        });
    }

    async function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            setRawText(text);
            setPreview(null);
            setConfirmResult(null);
            setError(null);
            toast.success(`Arquivo carregado: ${file.name}`);
        } catch {
            setError("Não foi possível ler o arquivo selecionado.");
            toast.error("Não foi possível ler o arquivo selecionado.");
        } finally {
            event.target.value = "";
        }
    }

    return (
        <div className="flex flex-col gap-6 pb-8">
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileSpreadsheet className="h-4 w-4" />
                        Cole uma planilha com cabeçalho na primeira linha. Pode ser texto tabulado ou CSV.
                    </div>

                    <div className="space-y-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.txt,text/csv,text/plain"
                            className="hidden"
                            onChange={handleFileSelection}
                        />

                        <ToggleGroup
                            type="single"
                            value={produtoPadrao}
                            onValueChange={(value) => {
                                if (value === "imobiliario" || value === "auto") {
                                    setProdutoPadrao(value);
                                }
                            }}
                            className="justify-start"
                        >
                            <ToggleGroupItem value="imobiliario" aria-label="Produto padrão imobiliário">
                                Imobiliário
                            </ToggleGroupItem>
                            <ToggleGroupItem value="auto" aria-label="Produto padrão auto">
                                Auto
                            </ToggleGroupItem>
                        </ToggleGroup>

                        <Textarea
                            value={rawText}
                            onChange={(event) => setRawText(event.target.value)}
                            placeholder={"sistema\tLance feito\tCONTEMPLADA\toptin\tCliente\tTIPO DE LANCE\tempresa\tvalor da cota\tgrupo\tcota\tprazo\tforma de pagamento\tindice de coreção\tfuro\tobjetivo\testrategia / obs\tParcela reduzida\tdata ultimo lance\tdetalhes lance\tAPORTE\tVALOR FINAL DA CARTA\tVALOR DA PARCELA"}
                            className="min-h-[320px] resize-y font-mono text-xs"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isPreviewPending || isConfirmPending}
                        >
                            <Upload className="h-4 w-4" />
                            Carregar CSV
                        </Button>
                        <Button onClick={handlePreview} disabled={!canValidate}>
                            {isPreviewPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Validar
                        </Button>
                        <Button variant="secondary" onClick={handleConfirm} disabled={!canConfirm}>
                            {isConfirmPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                            Confirmar importação
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <Alert>
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Regras aplicadas no backend</AlertTitle>
                        <AlertDescription className="space-y-2 text-sm">
                            <p>O backend resolve organização e role pela sessão autenticada.</p>
                            <p>Somente admin e gestor conseguem validar ou confirmar.</p>
                            <p>Linhas vazias são ignoradas, e o preview diferencia erro de aviso antes de gravar.</p>
                        </AlertDescription>
                    </Alert>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Falha na operação</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {preview && (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <SummaryCard label="Clientes encontrados" value={preview.summary.clientes_encontrados} />
                            <SummaryCard label="Clientes a criar" value={preview.summary.clientes_a_criar} />
                            <SummaryCard label="Administradoras a criar" value={preview.summary.administradoras_a_criar} />
                            <SummaryCard label="Grupos a criar" value={preview.summary.grupos_a_criar} />
                            <SummaryCard label="Cotas a criar" value={preview.summary.cotas_a_criar} />
                            <SummaryCard label="Contratos a criar" value={preview.summary.contratos_a_criar} />
                            <SummaryCard label="Lances a criar" value={preview.summary.lances_a_criar} />
                            <SummaryCard label="Contemplações a criar" value={preview.summary.contemplacoes_a_criar} />
                        </div>
                    )}

                    {confirmResult && (
                        <Alert>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertTitle>Importação finalizada</AlertTitle>
                            <AlertDescription>
                                {confirmResult.imported_rows} importadas, {confirmResult.failed_rows} com falha, {confirmResult.ignored_rows} ignoradas.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </section>

            {preview && (
                <section className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {statusBadge("pronta")} <span>{preview.summary.prontas}</span>
                        {statusBadge("aviso")} <span>{preview.summary.avisos}</span>
                        {statusBadge("erro")} <span>{preview.summary.erros}</span>
                        {statusBadge("ignorada")} <span>{preview.summary.ignoradas}</span>
                    </div>

                    <Card className="overflow-hidden">
                        <CardHeader className="border-b border-border">
                            <CardTitle className="text-base">Preview por linha</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[560px]">
                                <Table>
                                    <TableHeader className="sticky top-0 z-10 bg-background">
                                        <TableRow>
                                            <TableHead className="w-20">Linha</TableHead>
                                            <TableHead className="w-28">Status</TableHead>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Administradora</TableHead>
                                            <TableHead>Grupo</TableHead>
                                            <TableHead>Cota</TableHead>
                                            <TableHead className="min-w-[360px]">Mensagens</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {preview.rows.map((row) => {
                                            const messages = [...row.errors, ...row.warnings];
                                            return (
                                                <TableRow key={row.row_number} className="align-top">
                                                    <TableCell className="font-mono text-xs">{row.row_number}</TableCell>
                                                    <TableCell>{statusBadge(row.status)}</TableCell>
                                                    <TableCell>{row.cliente_nome || "—"}</TableCell>
                                                    <TableCell>{row.administradora_nome || "—"}</TableCell>
                                                    <TableCell>{row.grupo_codigo || "—"}</TableCell>
                                                    <TableCell>{row.numero_cota || "—"}</TableCell>
                                                    <TableCell>
                                                        {messages.length === 0 ? (
                                                            <div className="text-sm text-muted-foreground">Sem observações.</div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {messages.map((message, index) => (
                                                                    <div
                                                                        key={`${row.row_number}-${index}`}
                                                                        className="text-sm text-muted-foreground"
                                                                    >
                                                                        {message}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </section>
            )}

            {confirmResult && (
                <section className="space-y-4">
                    <Card className="overflow-hidden">
                        <CardHeader className="border-b border-border">
                            <CardTitle className="text-base">Resultado da confirmação</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[320px]">
                                <Table>
                                    <TableHeader className="sticky top-0 z-10 bg-background">
                                        <TableRow>
                                            <TableHead className="w-20">Linha</TableHead>
                                            <TableHead className="w-28">Status</TableHead>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Cota</TableHead>
                                            <TableHead className="min-w-[340px]">Mensagens</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {confirmResult.rows.map((row) => (
                                            <TableRow key={`confirm-${row.row_number}`} className="align-top">
                                                <TableCell className="font-mono text-xs">{row.row_number}</TableCell>
                                                <TableCell>{statusBadge(row.status)}</TableCell>
                                                <TableCell>{row.cliente_nome || "—"}</TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {row.cota_id || <span className="text-muted-foreground">—</span>}
                                                </TableCell>
                                                <TableCell>
                                                    {row.errors.length === 0 && row.warnings.length === 0 ? (
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <CircleSlash className="h-4 w-4" />
                                                            Sem observações.
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {[...row.errors, ...row.warnings].map((message, index) => (
                                                                <div
                                                                    key={`confirm-${row.row_number}-${index}`}
                                                                    className="text-sm text-muted-foreground"
                                                                >
                                                                    {message}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </section>
            )}
        </div>
    );
}

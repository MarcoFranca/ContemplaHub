export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import {
    listLeadsForKanban,
    moveLeadStage,
    createLeadManual,
    listContractOptions,
    type Stage,
    type LeadCard,
} from "./actions";
import KanbanBoard from "./ui/KanbanBoard";
import { getCurrentProfile } from "@/lib/auth/server";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STAGES: Stage[] = [
    "novo",
    "diagnostico",
    "proposta",
    "negociacao",
    "fechamento",
    "ativo",
    "perdido",
];

export default async function LeadsKanbanPage() {
    const me = await getCurrentProfile();
    if (!me?.orgId) {
        return <main className="p-6">Vincule-se a uma organização para acessar os leads.</main>;
    }

    const rows = await listLeadsForKanban();

    // Tipagem correta das colunas
    const columns = STAGES.reduce<Record<Stage, LeadCard[]>>((acc, s) => {
        acc[s] = [];
        return acc;
    }, {} as Record<Stage, LeadCard[]>);

    rows.forEach((l) => columns[l.etapa as Stage].push(l));

    const contractOptions = await listContractOptions();

    return (
        <main className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Leads — Kanban</h1>
                <CreateLeadDialog />
            </div>

            <KanbanBoard
                initialColumns={columns}
                stages={STAGES}
                onMove={async (leadId, to) => {
                    "use server";
                    await moveLeadStage({ leadId, to });
                }}
                contractOptions={contractOptions}
            />
        </main>
    );
}

/** Dialog de criação de lead + (opcional) interesse aberto */
function CreateLeadDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Novo lead</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Novo lead manual</DialogTitle>
                </DialogHeader>

                {/* Server Action direta; sem onSubmit (usa required nativo) */}
                <form action={createLeadManual} className="space-y-4">
                    {/* DADOS DO LEAD */}
                    <div className="grid gap-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input id="nome" name="nome" required placeholder="Ex.: Ana Lima" />
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="telefone">Telefone</Label>
                            <Input id="telefone" name="telefone" placeholder="(11) 99999-9999" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" name="email" placeholder="ana@exemplo.com" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="origem">Origem</Label>
                        <select
                            id="origem"
                            name="origem"
                            defaultValue="orgânico"
                            className="h-9 rounded-md bg-background border px-2 text-sm"
                        >
                            <option value="orgânico">Orgânico</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="indicacao">Indicação</option>
                            <option value="lp">Landing Page</option>
                            <option value="pago">Tráfego Pago</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>

                    {/* INTERESSE (opcional) */}
                    <div className="pt-3 border-t border-white/10">
                        <p className="text-sm font-medium">Interesse (opcional)</p>
                        <div className="grid gap-2 md:grid-cols-2 mt-2">
                            <div className="grid gap-2">
                                <Label htmlFor="produto">Produto</Label>
                                <select id="produto" name="produto" className="h-9 rounded-md bg-background border px-2 text-sm">
                                    <option value="">—</option>
                                    <option value="imobiliario">Imobiliário</option>
                                    <option value="auto">Auto</option>
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="valorTotal">Valor total</Label>
                                <Input id="valorTotal" name="valorTotal" placeholder="Ex.: 350.000,00" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="prazoMeses">Prazo (meses)</Label>
                                <Input id="prazoMeses" name="prazoMeses" type="number" placeholder="Ex.: 180" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="perfilDesejado">Perfil</Label>
                                <select id="perfilDesejado" name="perfilDesejado" className="h-9 rounded-md bg-background border px-2 text-sm">
                                    <option value="">—</option>
                                    <option value="disciplinado_acumulador">Disciplinado acumulador</option>
                                    <option value="sonhador_familiar">Sonhador familiar</option>
                                    <option value="corporativo_racional">Corporativo racional</option>
                                    <option value="impulsivo_emocional">Impulsivo emocional</option>
                                    <option value="estrategico_oportunista">Estratégico oportunista</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-2 mt-2">
                            <Label htmlFor="objetivo">Objetivo</Label>
                            <Input id="objetivo" name="objetivo" placeholder="Compra de imóvel / troca do carro / etc." />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="observacao">Observação</Label>
                            <textarea
                                id="observacao"
                                name="observacao"
                                className="min-h-[80px] rounded-md bg-background border px-3 py-2 text-sm"
                                placeholder="Notas adicionais sobre o interesse…"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit">Salvar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

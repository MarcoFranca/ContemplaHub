// src/app/app/leads/page.tsx
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

/** Dialog 100% compatível com Server Component (sem handlers de cliente) */
function CreateLeadDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Novo lead</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Novo lead manual</DialogTitle>
                </DialogHeader>

                {/* Server Action direta; sem onSubmit (usa required nativo) */}
                <form action={createLeadManual} className="space-y-3">
                    <div className="grid gap-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input id="nome" name="nome" required placeholder="Ex.: Ana Lima" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input id="telefone" name="telefone" placeholder="(11) 99999-9999" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" type="email" name="email" placeholder="ana@exemplo.com" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="origem">Origem</Label>
                        {/* select nativo: evita onValueChange em Client Component */}
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

                    <div className="grid gap-2">
                        <Label htmlFor="valorInteresse">Valor de interesse (opcional)</Label>
                        <Input id="valorInteresse" name="valorInteresse" placeholder="Ex.: 350000" />
                    </div>

                    <DialogFooter>
                        <Button type="submit">Salvar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

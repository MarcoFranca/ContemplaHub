"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Save, Ban, CalendarPlus, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    type CalendarioConfig,
    type Consultor,
    type Regra,
    createCalendarioAction,
    updateCalendarioAction,
    deleteCalendarioAction,
    saveRegrasAction,
    addBloqueioAction,
    deleteBloqueioAction,
} from "./actions";

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function fmtDT(v: string) {
    try {
        return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(v));
    } catch {
        return v;
    }
}

type RangeLocal = { hora_inicio: string; hora_fim: string };

function CalendarioEditor({
    cal,
    consultores,
    onChanged,
}: {
    cal: CalendarioConfig;
    consultores: Consultor[];
    onChanged: () => void;
}) {
    const [pending, start] = React.useTransition();

    // disponibilidade local: por weekday, lista de faixas
    const [grade, setGrade] = React.useState<Record<number, RangeLocal[]>>(() => {
        const g: Record<number, RangeLocal[]> = {};
        for (let d = 0; d < 7; d++) g[d] = [];
        for (const r of cal.regras) g[r.weekday]?.push({ hora_inicio: r.hora_inicio.slice(0, 5), hora_fim: r.hora_fim.slice(0, 5) });
        return g;
    });

    const [bloqInicio, setBloqInicio] = React.useState("");
    const [bloqFim, setBloqFim] = React.useState("");
    const [bloqMotivo, setBloqMotivo] = React.useState("");

    function addRange(d: number) {
        setGrade((g) => ({ ...g, [d]: [...g[d], { hora_inicio: "09:00", hora_fim: "18:00" }] }));
    }
    function removeRange(d: number, i: number) {
        setGrade((g) => ({ ...g, [d]: g[d].filter((_, idx) => idx !== i) }));
    }
    function setRange(d: number, i: number, field: keyof RangeLocal, value: string) {
        setGrade((g) => ({ ...g, [d]: g[d].map((r, idx) => (idx === i ? { ...r, [field]: value } : r)) }));
    }

    function salvarDisponibilidade() {
        const regras: Regra[] = [];
        for (let d = 0; d < 7; d++) for (const r of grade[d]) regras.push({ weekday: d, hora_inicio: r.hora_inicio, hora_fim: r.hora_fim });
        start(async () => {
            const res = await saveRegrasAction(cal.id, regras);
            if (!res.ok) { toast.error(res.error || "Falha ao salvar."); return; }
            toast.success("Disponibilidade salva.");
            onChanged();
        });
    }

    function patch(p: Parameters<typeof updateCalendarioAction>[1]) {
        start(async () => {
            const res = await updateCalendarioAction(cal.id, p);
            if (!res.ok) { toast.error(res.error || "Falha ao salvar."); return; }
            onChanged();
        });
    }

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Input
                    defaultValue={cal.nome}
                    className="max-w-xs font-medium"
                    onBlur={(e) => e.target.value.trim() && e.target.value !== cal.nome && patch({ nome: e.target.value.trim() })}
                />
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Switch checked={cal.ativo} onCheckedChange={(v) => patch({ ativo: v })} />
                        <span className="text-sm text-muted-foreground">{cal.ativo ? "Ativa" : "Inativa"}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-300 hover:bg-red-500/10"
                        disabled={pending}
                        onClick={() => {
                            if (!confirm(`Excluir a agenda "${cal.nome}"?`)) return;
                            start(async () => {
                                const res = await deleteCalendarioAction(cal.id);
                                if (!res.ok) { toast.error(res.error || "Falha ao excluir."); return; }
                                toast.success("Agenda excluída.");
                                onChanged();
                            });
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Config básica */}
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div>
                    <Label className="text-xs text-muted-foreground">Especialista</Label>
                    <select
                        defaultValue={cal.especialista_id ?? ""}
                        onChange={(e) => patch({ especialista_id: e.target.value || null })}
                        className="mt-1 w-full rounded-md border border-white/15 bg-transparent px-2 py-1.5 text-sm"
                    >
                        <option value="">Sem especialista</option>
                        {consultores.map((c) => (
                            <option key={c.user_id} value={c.user_id}>
                                {c.nome || c.user_id.slice(0, 8)}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">Duração (min)</Label>
                    <Input type="number" defaultValue={cal.slot_min} min={10} step={5} className="mt-1"
                        onBlur={(e) => Number(e.target.value) > 0 && Number(e.target.value) !== cal.slot_min && patch({ slot_min: Number(e.target.value) })} />
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">Antecedência (min)</Label>
                    <Input type="number" defaultValue={cal.antecedencia_min} min={0} step={30} className="mt-1"
                        onBlur={(e) => Number(e.target.value) !== cal.antecedencia_min && patch({ antecedencia_min: Number(e.target.value) })} />
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">Horizonte (dias)</Label>
                    <Input type="number" defaultValue={cal.horizonte_dias} min={1} max={90} className="mt-1"
                        onBlur={(e) => Number(e.target.value) > 0 && Number(e.target.value) !== cal.horizonte_dias && patch({ horizonte_dias: Number(e.target.value) })} />
                </div>
            </div>

            {cal.public_hash ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Link2 className="h-3 w-3" /> Link público:{" "}
                    <code className="rounded bg-white/10 px-1.5 py-0.5">/agendar/{cal.public_hash}</code>
                </p>
            ) : null}

            {/* Disponibilidade semanal */}
            <div className="mt-4">
                <p className="mb-2 text-sm font-semibold">Disponibilidade semanal</p>
                <div className="space-y-2">
                    {DIAS.map((dia, d) => (
                        <div key={d} className="flex flex-wrap items-center gap-2">
                            <span className="w-20 shrink-0 text-sm text-muted-foreground">{dia}</span>
                            {grade[d].map((r, i) => (
                                <div key={i} className="flex items-center gap-1">
                                    <Input type="time" value={r.hora_inicio} onChange={(e) => setRange(d, i, "hora_inicio", e.target.value)} className="w-28" />
                                    <span className="text-muted-foreground">–</span>
                                    <Input type="time" value={r.hora_fim} onChange={(e) => setRange(d, i, "hora_fim", e.target.value)} className="w-28" />
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-300" onClick={() => removeRange(d, i)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                            <Button variant="ghost" size="sm" className="gap-1 text-emerald-300" onClick={() => addRange(d)}>
                                <Plus className="h-3.5 w-3.5" /> faixa
                            </Button>
                        </div>
                    ))}
                </div>
                <Button className="mt-3 gap-1.5" disabled={pending} onClick={salvarDisponibilidade}>
                    <Save className="h-4 w-4" /> Salvar disponibilidade
                </Button>
            </div>

            {/* Bloqueios */}
            <div className="mt-5">
                <p className="mb-2 text-sm font-semibold">Bloqueios (folgas, feriados)</p>
                {cal.bloqueios.length ? (
                    <div className="mb-2 space-y-1">
                        {cal.bloqueios.map((b) => (
                            <div key={b.id} className="flex items-center justify-between rounded-md border border-white/10 px-2.5 py-1.5 text-xs">
                                <span>
                                    {fmtDT(b.inicio)} até {fmtDT(b.fim)} {b.motivo ? `• ${b.motivo}` : ""}
                                </span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-300"
                                    onClick={() => start(async () => {
                                        const res = await deleteBloqueioAction(b.id);
                                        if (!res.ok) { toast.error(res.error || "Falha."); return; }
                                        onChanged();
                                    })}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : null}
                <div className="flex flex-wrap items-end gap-2">
                    <div>
                        <Label className="text-xs text-muted-foreground">Início</Label>
                        <Input type="datetime-local" value={bloqInicio} onChange={(e) => setBloqInicio(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">Fim</Label>
                        <Input type="datetime-local" value={bloqFim} onChange={(e) => setBloqFim(e.target.value)} className="mt-1" />
                    </div>
                    <Input placeholder="Motivo (opcional)" value={bloqMotivo} onChange={(e) => setBloqMotivo(e.target.value)} className="max-w-[180px]" />
                    <Button variant="outline" className="gap-1.5" disabled={pending}
                        onClick={() => start(async () => {
                            const res = await addBloqueioAction(cal.id, bloqInicio, bloqFim, bloqMotivo);
                            if (!res.ok) { toast.error(res.error || "Falha."); return; }
                            setBloqInicio(""); setBloqFim(""); setBloqMotivo("");
                            toast.success("Bloqueio adicionado.");
                            onChanged();
                        })}>
                        <Ban className="h-4 w-4" /> Bloquear
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function AgendaConfigClient({
    initialCalendarios,
    consultores,
}: {
    initialCalendarios: CalendarioConfig[];
    consultores: Consultor[];
}) {
    const router = useRouter();
    const onChanged = () => router.refresh();
    const [pending, start] = React.useTransition();
    const [novoNome, setNovoNome] = React.useState("");

    function criar() {
        const nome = novoNome.trim();
        if (!nome) return toast.error("Dê um nome à agenda.");
        start(async () => {
            const res = await createCalendarioAction({ nome, especialista_id: null, slot_min: 30, antecedencia_min: 120, horizonte_dias: 14 });
            if (!res.ok) { toast.error(res.error || "Falha ao criar."); return; }
            setNovoNome("");
            toast.success("Agenda criada.");
            onChanged();
        });
    }

    return (
        <div className="space-y-4">
            <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Nova agenda</Label>
                    <Input placeholder="Ex.: Agenda do João" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} className="mt-1" />
                </div>
                <Button className="gap-1.5" disabled={pending} onClick={criar}>
                    <CalendarPlus className="h-4 w-4" /> Criar
                </Button>
            </div>

            {initialCalendarios.length ? (
                initialCalendarios.map((cal) => (
                    <CalendarioEditor key={cal.id} cal={cal} consultores={consultores} onChanged={onChanged} />
                ))
            ) : (
                <p className="text-sm text-muted-foreground">Nenhuma agenda ainda. Crie a primeira acima.</p>
            )}
        </div>
    );
}

"use client";

import * as React from "react";

// mapa de cores e textos padrão
const STATUS_META: Record<string, { color: string; fallback: string }> = {
    navigating: { color: "bg-emerald-400", fallback: "Navegando" },
    loading: { color: "bg-cyan-400", fallback: "Carregando" },
    saving: { color: "bg-amber-400", fallback: "Salvando" },
    rendering: { color: "bg-violet-400", fallback: "Renderizando" },
    default: { color: "bg-slate-300", fallback: "Processando" },
};

type PendingKind = keyof typeof STATUS_META;
type PendingEventDetail = { kind?: PendingKind; label?: string };

export function GlobalPending() {
    const [visible, setVisible] = React.useState(false);
    const [kind, setKind] = React.useState<PendingKind>("default");
    const [label, setLabel] = React.useState(STATUS_META.default.fallback);

    const countRef = React.useRef(0);
    const lockedRef = React.useRef(false);
    const showTimer = React.useRef<number | null>(null);
    const hideTimer = React.useRef<number | null>(null);
    const killTimer = React.useRef<number | null>(null);

    const show = React.useCallback(
        (k?: PendingKind, custom?: string, lock = false) => {
            const meta = STATUS_META[k ?? "default"] ?? STATUS_META.default;
            setKind(k ?? "default");
            setLabel(custom || meta.fallback);
            lockedRef.current = lock;

            if (showTimer.current) clearTimeout(showTimer.current);
            showTimer.current = window.setTimeout(() => setVisible(true), 80);

            if (killTimer.current) clearTimeout(killTimer.current);
            killTimer.current = window.setTimeout(() => {
                countRef.current = 0;
                lockedRef.current = false;
                setVisible(false);
            }, 15000);
        },
        []
    );

    const hide = React.useCallback(() => {
        if (showTimer.current) clearTimeout(showTimer.current);
        if (hideTimer.current) clearTimeout(hideTimer.current);
        if (killTimer.current) clearTimeout(killTimer.current);
        hideTimer.current = window.setTimeout(() => setVisible(false), 150);
    }, []);

    const start = React.useCallback(
        (detail?: PendingEventDetail) => {
            const isFirst = countRef.current === 0;
            countRef.current += 1;

            if (isFirst) {
                const k = detail?.kind ?? "default";
                const hasCustom = Boolean(detail?.label);
                show(k, detail?.label, hasCustom);
            } else if (!lockedRef.current && detail?.kind) {
                const meta = STATUS_META[detail.kind] ?? STATUS_META.default;
                setKind(detail.kind);
                setLabel(detail.label || meta.fallback);
            }
        },
        [show]
    );

    const stop = React.useCallback(() => {
        countRef.current = Math.max(0, countRef.current - 1);
        if (countRef.current === 0) {
            lockedRef.current = false;
            hide();
        }
    }, [hide]);

    React.useEffect(() => {
        const onStart = (e: Event) =>
            start((e as CustomEvent<PendingEventDetail>).detail);
        const onStop = () => stop();

        window.addEventListener("pending:start", onStart as EventListener);
        window.addEventListener("pending:stop", onStop as EventListener);

        return () => {
            window.removeEventListener("pending:start", onStart as EventListener);
            window.removeEventListener("pending:stop", onStop as EventListener);
        };
    }, [start, stop]);

    if (!visible) return null;
    const meta = STATUS_META[kind] ?? STATUS_META.default;

    return (
        <div className="fixed left-3 bottom-3 z-[60] pointer-events-none select-none">
            <div className="flex items-center gap-2 rounded-full bg-black/70 text-white px-3 py-1.5 shadow-lg ring-1 ring-white/10">
        <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${meta.color} shadow-[0_0_8px_rgba(255,255,255,.8)]`}
        />
                <span className="text-xs font-medium">
          {label}
                    <span className="ml-1 inline-flex align-middle">
            <span className="dot" />
            <span className="dot dot2" />
            <span className="dot dot3" />
          </span>
        </span>
            </div>
        </div>
    );
}

// src/components/commun/ConfirmInputSubmitButton.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ButtonVariant = React.ComponentProps<typeof Button>["variant"];
type ButtonSize = React.ComponentProps<typeof Button>["size"];

export type ConfirmMatchMode = "equals" | "equals-insensitive" | "custom";
type PendingKind = "saving" | "loading" | "rendering" | "navigating";

// >>> helper para preferência
function setPendingPref(kind?: PendingKind, label?: string) {
    window.__pendingPref = { kind, label, ts: Date.now() };
}

type Props = {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    iconLeft?: React.ReactNode;
    label?: string;
    ariaLabel?: string;

    expected?: string;
    mode?: ConfirmMatchMode;
    placeholder?: string;
    helperText?: string;
    validate?: (value: string) => string | null;
    transform?: (value: string) => string;
    mismatchMessage?: string;

    pendingLabel?: string;
    pendingKind?: PendingKind;
    onBeforeSubmit?: () => void | boolean;
};

export function ConfirmInputSubmitButton({
                                             title,
                                             description,
                                             confirmLabel = "Confirmar",
                                             cancelLabel = "Cancelar",
                                             variant = "destructive",
                                             size = "icon",
                                             className,
                                             iconLeft,
                                             label,
                                             ariaLabel,

                                             expected = "",
                                             mode = "equals",
                                             placeholder,
                                             helperText,
                                             validate,
                                             transform,
                                             mismatchMessage = "O valor digitado não confere.",

                                             pendingLabel = "Salvando…",
                                             pendingKind = "saving",

                                             onBeforeSubmit,
                                         }: Props) {
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);

    const check = React.useCallback((raw: string): string | null => {
        const v = transform ? transform(raw) : raw;
        if (mode === "custom") return validate ? validate(v) : null;
        if (!expected) return "Valor esperado não configurado.";
        if (mode === "equals") return v === expected ? null : mismatchMessage;
        if (mode === "equals-insensitive") return v.toLowerCase() === expected.toLowerCase() ? null : mismatchMessage;
        return null;
    }, [expected, mismatchMessage, mode, transform, validate]);

    const onConfirm = React.useCallback(() => {
        const err = check(value);
        if (err) { setError(err); return; }

        if (onBeforeSubmit && onBeforeSubmit() === false) return;

        // preferência de label/kind para o próximo fetch
        if (pendingLabel || pendingKind) setPendingPref(pendingKind, pendingLabel);

        const btn = triggerRef.current;
        const form = btn?.closest("form") as HTMLFormElement | null;
        form?.requestSubmit();

        setOpen(false);
        setValue("");
        setError(null);
    }, [check, onBeforeSubmit, pendingKind, pendingLabel, value]);

    const isDisabled = !!check(value);

    return (
        <AlertDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setValue(""); setError(null); } }}>
            <AlertDialogTrigger asChild>
                <Button
                    ref={triggerRef}
                    type="button"
                    variant={variant}
                    size={size}
                    className={className}
                    aria-label={label ? undefined : ariaLabel}
                    onClick={() => setOpen(true)}
                >
                    {iconLeft}
                    {label}
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
                </AlertDialogHeader>

                <div className="space-y-2">
                    <Input
                        autoFocus
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        aria-invalid={!!error}
                        aria-describedby="confirm-input-help confirm-input-error"
                    />
                    {helperText ? <p id="confirm-input-help" className="text-xs text-muted-foreground">{helperText}</p> : null}
                    {error ? <p id="confirm-input-error" className="text-xs text-red-400">{error}</p> : null}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => { setValue(""); setError(null); }}>
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} disabled={isDisabled}>
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

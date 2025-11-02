"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

type PendingKind = "saving" | "loading" | "rendering" | "navigating";

declare global {
    interface Window {
        __pendingPref?: { kind?: PendingKind; label?: string; ts: number };
    }
}

export type ConfirmSubmitButtonProps = {
    title: string;
    description?: string;
    confirmLabel?: string;
    variant?: React.ComponentProps<typeof Button>["variant"];
    size?: React.ComponentProps<typeof Button>["size"];
    className?: string;
    iconLeft?: React.ReactNode;
    children?: React.ReactNode;
    pendingLabel?: string;
    pendingKind?: PendingKind;
};

export function ConfirmSubmitButton({
                                        title,
                                        description,
                                        confirmLabel = "Confirmar",
                                        variant = "ghost",
                                        size = "icon",
                                        className,
                                        iconLeft,
                                        children,
                                        pendingLabel,
                                        pendingKind = "saving",
                                    }: ConfirmSubmitButtonProps) {
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);

    const findNearestForm = React.useCallback((): HTMLFormElement | null => {
        let el: HTMLElement | null = triggerRef.current;
        while (el) {
            if (el.tagName === "FORM") return el as HTMLFormElement;
            el = el.parentElement;
        }
        return null;
    }, []);

    const onConfirm = React.useCallback(() => {
        // apenas prepara a preferência para o PRÓXIMO request
        window.__pendingPref = { kind: pendingKind, label: pendingLabel, ts: Date.now() };
        const form = findNearestForm();
        if (form) form.requestSubmit();
    }, [findNearestForm, pendingKind, pendingLabel]);

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button ref={triggerRef} variant={variant} size={size} className={cn(className)}>
                    {iconLeft}
                    {children}
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

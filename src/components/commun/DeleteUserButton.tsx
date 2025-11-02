"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { setPendingPref } from "@/lib/pendingPref";

type Props = {
    disabled?: boolean;
    confirmText?: string;
    title?: string;
    description?: string;
};

export function DeleteUserButton({
                                     disabled,
                                     confirmText = "Excluir",
                                     title = "Excluir usuário?",
                                     description = "Esta ação é irreversível e removerá o acesso deste usuário.",
                                 }: Props) {
    const btnRef = React.useRef<HTMLButtonElement | null>(null);

    const submitNearestForm = () => {
        let el: HTMLElement | null = btnRef.current;
        while (el) {
            if (el.tagName === "FORM") {
                (el as HTMLFormElement).requestSubmit();
                break;
            }
            el = el.parentElement;
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button ref={btnRef} type="button" variant="ghost" size="icon" className="text-red-400 hover:text-red-300" disabled={disabled} aria-label="Excluir">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            setPendingPref("saving", "Deletando…");
                            submitNearestForm();
                        }}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

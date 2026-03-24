import {backendAuthed} from "@/app/app/lances/actions/_shared";

export type Administradora = {
    id: string;
    nome: string;
};

export async function getAdministradoras(): Promise<Administradora[]> {
    return backendAuthed<Administradora[]>("/administradoras", {
        method: "GET",
    });
}
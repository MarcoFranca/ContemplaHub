export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { listUsers, createUser, updateRole, removeUser, resendInvite } from "./actions";
import { getCurrentProfile } from "@/lib/auth/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { SelectAutoSubmit } from "@/components/commun/SelectAutoSubmit";
import { DeleteUserButton } from "@/components/commun/DeleteUserButton";
import { SearchUsers } from "./search-users";
import { PageToasts } from "./page-toasts";
import {
    Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink,
} from "@/components/ui/pagination";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

function RoleBadge({ role }: { role: string }) {
    const map: Record<string, string> = {
        admin: "bg-emerald-600/20 text-emerald-300",
        gestor: "bg-sky-600/20 text-sky-300",
        vendedor: "bg-slate-600/20 text-slate-200",
        viewer: "bg-zinc-600/20 text-zinc-200",
    };
    return <span className={`px-2 py-1 rounded text-xs capitalize ${map[role] ?? "bg-slate-600/20"}`}>{role}</span>;
}

export default async function UsersPage({
                                            searchParams,
                                        }: { searchParams?: { q?: string; page?: string; ok?: string; err?: string } }) {
    const me = await getCurrentProfile();

    const q = (searchParams?.q ?? "").trim();
    const page = Math.max(1, Number(searchParams?.page ?? "1"));
    const pageSize = 20;

    const { rows, total } = await listUsers({ q, page, pageSize, withOwner: true });

    const isManager = !!me?.isManager;
    const isAdmin = (me?.role ?? "").toLowerCase() === "admin";

    const pages = Math.max(1, Math.ceil(total / pageSize));
    const mkHref = (p: number) => {
        const sp = new URLSearchParams();
        if (q) sp.set("q", q);
        sp.set("page", String(p));
        return `/app/usuarios?${sp.toString()}`;
    };

    return (
        <main className="p-6 space-y-6">
            {/* Toaster que lê ?ok / ?err */}
            <PageToasts ok={searchParams?.ok} err={searchParams?.err} />

            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Usuários</h1>
                    <p className="text-sm text-muted-foreground">Gerencie os acessos da sua organização.</p>
                </div>
                <div className="flex items-center gap-2">
                    <SearchUsers initialValue={q} />
                    {isManager && <CreateUserDialog />}
                </div>
            </div>

            <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle>Equipe</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <TooltipProvider delayDuration={200}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>E-mail</TableHead>
                                    <TableHead>Função</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Criado em</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((r) => {
                                    const role = (r.role ?? "vendedor").toLowerCase();
                                    const imSelf = r._me;
                                    const isOwner = r._owner;

                                    const canChangeRole = isManager && !isOwner && (!imSelf || isAdmin);
                                    const canDelete = isManager && !isOwner && !imSelf;

                                    const whyCannotChange =
                                        !isManager ? "Apenas gestor/admin podem alterar função."
                                            : isOwner ? "O dono da organização é sempre admin."
                                                : (imSelf && !isAdmin) ? "Você não pode alterar sua própria função."
                                                    : "";

                                    const whyCannotDelete =
                                        !isManager ? "Apenas gestor/admin podem remover."
                                            : isOwner ? "Não é permitido remover o dono da organização."
                                                : imSelf ? "Você não pode remover a si mesmo."
                                                    : "";

                                    return (
                                        <TableRow key={r.user_id} className="align-middle">
                                            <TableCell className="font-medium">{r.nome ?? "—"}</TableCell>
                                            <TableCell className="text-xs md:text-sm text-muted-foreground break-all">{r.email ?? "—"}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <RoleBadge role={role} />
                                                    {isOwner && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600/20 text-emerald-300">dono</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {r.invited ? (
                                                    <span className="text-xs rounded bg-amber-500/20 text-amber-300 px-2 py-1">convite pendente</span>
                                                ) : (
                                                    <span className="text-xs rounded bg-emerald-600/20 text-emerald-300 px-2 py-1">ativo</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs md:text-sm">
                                                {new Date(r.created_at).toLocaleString("pt-BR")}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {/* alterar função */}
                                                <form
                                                    action={async (fd: FormData) => {
                                                        "use server";
                                                        const roleNext = String(fd.get("role") ?? role);
                                                        await updateRole({ userId: r.user_id, role: roleNext });
                                                    }}
                                                    className="inline-flex"
                                                >
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div>
                                                                <SelectAutoSubmit
                                                                    name="role"
                                                                    defaultValue={role}
                                                                    disabled={!canChangeRole}
                                                                    pendingLabel="Alterando função…"
                                                                    values={["admin", "gestor", "vendedor", "viewer"]}
                                                                />
                                                            </div>
                                                        </TooltipTrigger>
                                                        {!canChangeRole && whyCannotChange && (
                                                            <TooltipContent side="top" className="max-w-xs">
                                                                {whyCannotChange}
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </form>

                                                {/* reenviar convite apenas se pendente */}
                                                {isManager && r.email && r.invited && (
                                                    <form action={async () => { "use server"; await resendInvite(r.email!); }}>
                                                        <Button type="submit" variant="outline" size="sm" className="ml-1">Reenviar convite</Button>
                                                    </form>
                                                )}

                                                {/* excluir */}
                                                <form action={async () => { "use server"; await removeUser(r.user_id); }} className="inline-flex">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="inline-flex">
                                                                <DeleteUserButton disabled={!canDelete} />
                                                            </div>
                                                        </TooltipTrigger>
                                                        {!canDelete && whyCannotDelete && (
                                                            <TooltipContent side="top" className="max-w-xs">
                                                                {whyCannotDelete}
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </form>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {rows.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                                            Nenhum usuário. Clique em <strong>Novo usuário</strong> para começar.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TooltipProvider>

                    {/* Paginação shadcn */}
                    <div className="flex justify-end">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious href={mkHref(Math.max(1, page - 1))} aria-disabled={page <= 1} />
                                </PaginationItem>
                                {/* páginas (simples: atual +/- 1) */}
                                {page > 1 && (
                                    <PaginationItem>
                                        <PaginationLink href={mkHref(page - 1)}>{page - 1}</PaginationLink>
                                    </PaginationItem>
                                )}
                                <PaginationItem>
                                    <PaginationLink href={mkHref(page)} isActive>
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                                {page < pages && (
                                    <PaginationItem>
                                        <PaginationLink href={mkHref(page + 1)}>{page + 1}</PaginationLink>
                                    </PaginationItem>
                                )}
                                <PaginationItem>
                                    <PaginationNext href={mkHref(Math.min(pages, page + 1))} aria-disabled={page >= pages} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}

function CreateUserDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Novo usuário</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Adicionar usuário</DialogTitle></DialogHeader>

                <form action={async (fd: FormData) => {
                    "use server";
                    await createUser({
                        email: String(fd.get("email") ?? ""),
                        nome: String(fd.get("nome") ?? ""),
                        role: String(fd.get("role") ?? "vendedor"),
                    });
                }} className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Nome</Label>
                        <Input name="nome" required placeholder="Ex.: Ana Lima" />
                    </div>
                    <div className="grid gap-2">
                        <Label>E-mail</Label>
                        <Input name="email" type="email" required placeholder="ana@empresa.com" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Função</Label>
                        <select name="role" defaultValue="vendedor" className="h-9 rounded-md bg-background border px-2 text-sm">
                            <option value="admin">admin</option>
                            <option value="gestor">gestor</option>
                            <option value="vendedor">vendedor</option>
                            <option value="viewer">viewer</option>
                        </select>
                        <p className="text-xs text-muted-foreground">
                            Apenas <strong>admin</strong> pode criar outro admin.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="submit">Salvar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

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

function RoleBadge({ role }: { role: string }) {
    const map: Record<string, string> = {
        admin: "bg-emerald-600/20 text-emerald-300",
        gestor: "bg-sky-600/20 text-sky-300",
        vendedor: "bg-slate-600/20 text-slate-200",
        viewer: "bg-zinc-600/20 text-zinc-200",
    };
    return <span className={`px-2 py-1 rounded text-xs capitalize ${map[role] ?? "bg-slate-600/20"}`}>{role}</span>;
}

export default async function UsersPage() {
    const me = await getCurrentProfile();
    const rows = await listUsers();

    // Dono da org (para travas visuais)
    let ownerId: string | null = null;
    try {
        const org = me?.orgId ? await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/org-owner?id=${me.orgId}`).then(r=>r.ok?r.json():null) : null;
        ownerId = org?.owner_user_id ?? null;
    } catch {}

    const isManager = !!me?.isManager;
    const isAdmin = (me?.role ?? "").toLowerCase() === "admin";

    return (
        <main className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Usuários</h1>
                    <p className="text-sm text-muted-foreground">Gerencie os acessos da sua organização.</p>
                </div>
                {isManager && <CreateUserDialog />}
            </div>

            <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle>Equipe</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>E-mail</TableHead>
                                <TableHead>Função</TableHead>
                                <TableHead>Criado em</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((r: { user_id: string; nome: string | null; role: string | null; created_at: string; email?: string }) => {
                                const role = (r.role ?? "vendedor").toLowerCase();
                                const imSelf = me?.userId === r.user_id;
                                const isOwner = ownerId === r.user_id;

                                const canChangeRole =
                                    isManager &&
                                    !isOwner && // dono é sempre admin
                                    (!imSelf || isAdmin); // evitar que não-admin mexa em si

                                const canDelete =
                                    isManager &&
                                    !isOwner &&
                                    !imSelf;

                                return (
                                    <TableRow key={r.user_id} className="align-middle">
                                        <TableCell className="font-medium">{r.nome ?? "—"}</TableCell>
                                        <TableCell className="text-xs md:text-sm text-muted-foreground break-all">{r.email ?? "—"}</TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <RoleBadge role={role} />
                                                {isOwner && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600/20 text-emerald-300">dono</span>}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-xs md:text-sm">
                                            {new Date(r.created_at).toLocaleString("pt-BR")}
                                        </TableCell>

                                        <TableCell className="text-right space-x-2">
                                            {/* alterar função */}
                                            <form action={async (fd: FormData) => {
                                                "use server";
                                                const roleNext = String(fd.get("role") ?? role);
                                                await updateRole({ userId: r.user_id, role: roleNext });
                                            }} className="inline-flex">
                                                <SelectAutoSubmit
                                                    name="role"
                                                    defaultValue={role}
                                                    disabled={!canChangeRole}
                                                    pendingLabel="Alterando função…"
                                                    values={["admin","gestor","vendedor","viewer"]}
                                                />
                                            </form>

                                            {/* reenviar convite (se tiver e-mail) */}
                                            {isManager && r.email ? (
                                                <form action={async () => { "use server"; await resendInvite(r.email!); }}>
                                                    <Button type="submit" variant="outline" size="sm" className="ml-1">Reenviar convite</Button>
                                                </form>
                                            ) : null}

                                            {/* excluir */}
                                            <form action={async () => { "use server"; await removeUser(r.user_id); }} className="inline-flex">
                                                <DeleteUserButton disabled={!canDelete} />
                                            </form>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                                        Nenhum usuário ainda. Clique em <strong>Novo usuário</strong> para começar.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
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
                        {/* simples select HTML funciona bem em Server Action */}
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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { listUsers, createUser, updateRole, removeUser } from "./actions";
import { getCurrentProfile } from "@/lib/auth/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Trash2 } from "lucide-react";

function RoleBadge({ role }: { role: string }) {
    const map: Record<string, string> = {
        admin: "bg-emerald-600/20 text-emerald-300",
        gestor: "bg-sky-600/20 text-sky-300",
        vendedor: "bg-slate-600/20 text-slate-200",
        viewer: "bg-zinc-600/20 text-zinc-200",
    };
    return <span className={`px-2 py-1 rounded text-xs ${map[role] ?? "bg-slate-600/20"}`}>{role}</span>;
}

export default async function UsersPage() {
    const me = await getCurrentProfile();
    const rows = await listUsers();

    return (
        <main className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Usuários</h1>
                    <p className="text-sm text-muted-foreground">Gerencie os acessos da sua organização.</p>
                </div>
                {me?.isManager && (
                    <CreateUserDialog />
                )}
            </div>

            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle>Equipe</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Função</TableHead>
                                <TableHead>Criado em</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((r: any) => (
                                <TableRow key={r.user_id}>
                                    <TableCell>{r.nome ?? "—"}</TableCell>
                                    <TableCell><RoleBadge role={r.role ?? "vendedor"} /></TableCell>
                                    <TableCell>{new Date(r.created_at).toLocaleString("pt-BR")}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {me?.isManager && (
                                            <>
                                                <UpdateRoleSelect userId={r.user_id} current={r.role ?? "vendedor"} />
                                                <form action={async () => { "use server"; await removeUser(r.user_id); }}>
                                                    <Button type="submit" variant="ghost" size="icon" className="text-red-400 hover:text-red-300">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </form>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {rows.length === 0 && (
                                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum usuário.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}

function UpdateRoleSelect({ userId, current }: { userId: string; current: string }) {
    return (
        <form action={async (fd: FormData) => {
            "use server";
            const role = String(fd.get("role") ?? "vendedor");
            await updateRole({ userId, role });
        }}>
            <Select name="role" defaultValue={current}>
                <SelectTrigger className="w-36">
                    <SelectValue placeholder="Função" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="admin">admin</SelectItem>
                    <SelectItem value="gestor">gestor</SelectItem>
                    <SelectItem value="vendedor">vendedor</SelectItem>
                    <SelectItem value="viewer">viewer</SelectItem>
                </SelectContent>
            </Select>
        </form>
    );
}

function CreateUserDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Novo usuário</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar usuário</DialogTitle>
                </DialogHeader>
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
                        <Input name="nome" required />
                    </div>
                    <div className="grid gap-2">
                        <Label>E-mail</Label>
                        <Input name="email" type="email" required />
                    </div>
                    <div className="grid gap-2">
                        <Label>Função</Label>
                        <Select name="role" defaultValue="vendedor">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">admin</SelectItem>
                                <SelectItem value="gestor">gestor</SelectItem>
                                <SelectItem value="vendedor">vendedor</SelectItem>
                                <SelectItem value="viewer">viewer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Salvar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

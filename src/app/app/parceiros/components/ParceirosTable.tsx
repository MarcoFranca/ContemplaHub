"use client";

import * as React from "react";
import { Pencil, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { resendPartnerInviteAction } from "../actions";
import type { Parceiro, ParceiroAcessoMap } from "../types";
import { ParceiroSheet } from "./ParceiroSheet";
import { ParceiroStatusBadge } from "./ParceiroStatusBadge";
import { ParceiroAcessoBadge } from "./ParceiroAcessoBadge";

type Props = {
  items: Parceiro[];
  acessosByParceiroId: ParceiroAcessoMap;
};

export function ParceirosTable({ items, acessosByParceiroId }: Props) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Parceiro | null>(null);

  return (
      <>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Parceiros cadastrados</CardTitle>
            <Button
                onClick={() => {
                  setSelected(null);
                  setOpen(true);
                }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo parceiro
            </Button>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>PIX</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => {
                  const acesso = acessosByParceiroId[item.id];

                  return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.nome}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.cpf_cnpj || "Sem documento"}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div>{item.telefone || "—"}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.email || "Sem e-mail"}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div>{item.pix_chave || "—"}</div>
                          <div className="text-xs text-muted-foreground uppercase">
                            {item.pix_tipo || "não informado"}
                          </div>
                        </TableCell>

                        <TableCell>
                          <ParceiroStatusBadge ativo={item.ativo} />
                        </TableCell>

                        <TableCell>
                          <div className="space-y-2">
                            <ParceiroAcessoBadge acesso={acesso} />
                            {acesso ? (
                                <div className="text-xs text-muted-foreground">
                                  {acesso.email}
                                </div>
                            ) : (
                                <div className="text-xs text-muted-foreground">
                                  Sem portal liberado
                                </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {acesso ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      try {
                                        toast.dismiss();
                                        toast.loading("Reenviando convite...");
                                        await resendPartnerInviteAction(acesso.id);
                                        toast.dismiss();
                                        toast.success("Convite reenviado com sucesso.");
                                        window.location.reload();
                                      } catch (error) {
                                        console.error(error);
                                        toast.dismiss();
                                        toast.error(
                                            error instanceof Error
                                                ? error.message
                                                : "Erro ao reenviar convite."
                                        );
                                      }
                                    }}
                                >
                                  <Send className="mr-2 h-4 w-4" />
                                  Reenviar
                                </Button>
                            ) : null}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelected(item);
                                  setOpen(true);
                                }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                  );
                })}

                {!items.length && (
                    <TableRow>
                      <TableCell
                          colSpan={6}
                          className="py-8 text-center text-muted-foreground"
                      >
                        Nenhum parceiro cadastrado ainda.
                      </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <ParceiroSheet
            open={open}
            onOpenChange={setOpen}
            parceiro={selected}
            acesso={selected ? acessosByParceiroId[selected.id] ?? null : null}
            onSuccess={() => window.location.reload()}
        />
      </>
  );
}
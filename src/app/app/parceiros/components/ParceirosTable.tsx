"use client";

import * as React from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Parceiro } from "../types";
import { ParceiroSheet } from "./ParceiroSheet";
import { ParceiroStatusBadge } from "./ParceiroStatusBadge";

type Props = {
  items: Parceiro[];
};

export function ParceirosTable({ items }: Props) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Parceiro | null>(null);

  return (
    <>
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Parceiros cadastrados</CardTitle>
          <Button onClick={() => { setSelected(null); setOpen(true); }}>
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
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.nome}</div>
                    <div className="text-xs text-muted-foreground">{item.cpf_cnpj || "Sem documento"}</div>
                  </TableCell>
                  <TableCell>
                    <div>{item.telefone || "—"}</div>
                    <div className="text-xs text-muted-foreground">{item.email || "Sem e-mail"}</div>
                  </TableCell>
                  <TableCell>
                    <div>{item.pix_chave || "—"}</div>
                    <div className="text-xs text-muted-foreground uppercase">{item.pix_tipo || "não informado"}</div>
                  </TableCell>
                  <TableCell><ParceiroStatusBadge ativo={item.ativo} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => { setSelected(item); setOpen(true); }}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!items.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum parceiro cadastrado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ParceiroSheet open={open} onOpenChange={setOpen} parceiro={selected} onSuccess={() => window.location.reload()} />
    </>
  );
}

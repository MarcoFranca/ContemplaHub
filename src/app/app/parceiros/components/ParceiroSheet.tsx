"use client";

import * as React from "react";
import { toast } from "sonner";
import { Handshake, Save, ShieldCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  resendPartnerInviteAction,
  saveParceiroAndAccessAction,
} from "../actions";
import type { Parceiro, ParceiroAcesso, PixTipo } from "../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parceiro?: Parceiro | null;
  acesso?: ParceiroAcesso | null;
  onSuccess?: () => void;
};

const PIX_OPTIONS: Array<{ value: PixTipo; label: string }> = [
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
  { value: "email", label: "E-mail" },
  { value: "telefone", label: "Telefone" },
  { value: "aleatoria", label: "Chave aleatória" },
];

export function ParceiroSheet({
                                open,
                                onOpenChange,
                                parceiro,
                                acesso,
                                onSuccess,
                              }: Props) {
  const [ativo, setAtivo] = React.useState(true);
  const [liberarAcesso, setLiberarAcesso] = React.useState(false);
  const [acessoAtivo, setAcessoAtivo] = React.useState(true);
  const [sendingInvite, setSendingInvite] = React.useState(false);

  React.useEffect(() => {
    setAtivo(parceiro?.ativo ?? true);
    setLiberarAcesso(Boolean(acesso));
    setAcessoAtivo(acesso?.ativo ?? true);
  }, [parceiro, acesso, open]);

  return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-emerald-400" />
              {parceiro ? "Editar parceiro" : "Novo parceiro"}
            </SheetTitle>
          </SheetHeader>

          <form
              action={async (formData: FormData) => {
                try {
                  toast.dismiss();
                  toast.loading(parceiro ? "Salvando parceiro..." : "Criando parceiro...");

                  if (parceiro?.id) {
                    formData.set("parceiro_id", parceiro.id);
                  }

                  if (acesso?.id) {
                    formData.set("partner_user_id", acesso.id);
                  }

                  await saveParceiroAndAccessAction(formData);

                  toast.dismiss();
                  toast.success(
                      parceiro
                          ? "Parceiro atualizado com sucesso."
                          : "Parceiro criado com sucesso."
                  );

                  onOpenChange(false);
                  onSuccess?.();
                } catch (error) {
                  console.error(error);
                  toast.dismiss();
                  toast.error(
                      error instanceof Error
                          ? error.message
                          : "Erro ao salvar parceiro."
                  );
                }
              }}
              className="mt-6 space-y-6"
          >
            {parceiro?.id ? (
                <input type="hidden" name="parceiro_id" value={parceiro.id} />
            ) : null}

            {acesso?.id ? (
                <input type="hidden" name="partner_user_id" value={acesso.id} />
            ) : null}

            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">Dados do parceiro</h3>
                <p className="text-xs text-muted-foreground">
                  Cadastro operacional usado na rotina comercial, comissões e repasses.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                      id="nome"
                      name="nome"
                      defaultValue={parceiro?.nome ?? ""}
                      required
                      placeholder="Ex.: Leandro Silva"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                  <Input
                      id="cpf_cnpj"
                      name="cpf_cnpj"
                      defaultValue={parceiro?.cpf_cnpj ?? ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                      id="telefone"
                      name="telefone"
                      defaultValue={parceiro?.telefone ?? ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail operacional</Label>
                  <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={parceiro?.email ?? ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pix_tipo">Tipo de chave PIX</Label>
                  <select
                      id="pix_tipo"
                      name="pix_tipo"
                      defaultValue={parceiro?.pix_tipo ?? ""}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Selecione</option>
                    {PIX_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pix_chave">Chave PIX</Label>
                  <Input
                      id="pix_chave"
                      name="pix_chave"
                      defaultValue={parceiro?.pix_chave ?? ""}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                      id="observacoes"
                      name="observacoes"
                      defaultValue={parceiro?.observacoes ?? ""}
                      className="min-h-24"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                <input
                    type="checkbox"
                    name="ativo"
                    checked={ativo}
                    onChange={(e) => setAtivo(e.target.checked)}
                />
                Parceiro ativo para novas cartas e repasses
              </label>
            </section>

            <section className="space-y-4 rounded-2xl border border-border/60 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-semibold">Acesso ao portal</h3>
                  <p className="text-xs text-muted-foreground">
                    Libere o parceiro para entrar no portal e consultar contratos, comissões e documentos.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                <input
                    type="checkbox"
                    name="liberar_acesso"
                    checked={liberarAcesso}
                    onChange={(e) => setLiberarAcesso(e.target.checked)}
                />
                Liberar acesso ao portal
              </label>

              {liberarAcesso ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="access_email">E-mail de login *</Label>
                      <Input
                          id="access_email"
                          name="access_email"
                          type="email"
                          defaultValue={acesso?.email ?? parceiro?.email ?? ""}
                          required={liberarAcesso}
                          placeholder="parceiro@email.com"
                      />
                      <p className="text-xs text-muted-foreground">
                        O parceiro receberá um convite para definir a senha no primeiro acesso.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="access_nome">Nome exibido no acesso</Label>
                      <Input
                          id="access_nome"
                          name="access_nome"
                          defaultValue={acesso?.nome ?? parceiro?.nome ?? ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="access_telefone">Telefone do acesso</Label>
                      <Input
                          id="access_telefone"
                          name="access_telefone"
                          defaultValue={acesso?.telefone ?? parceiro?.telefone ?? ""}
                      />
                    </div>

                    {acesso ? (
                        <label className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                          <input
                              type="checkbox"
                              name="access_ativo"
                              checked={acessoAtivo}
                              onChange={(e) => setAcessoAtivo(e.target.checked)}
                          />
                          Acesso ativo no portal
                        </label>
                    ) : (
                        <input type="hidden" name="access_ativo" value="on" />
                    )}

                    <div className="space-y-3 md:col-span-2">
                      <div className="text-sm font-medium">Permissões</div>

                      <label className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                        <input
                            type="checkbox"
                            name="can_view_contracts"
                            defaultChecked={acesso?.can_view_contracts ?? true}
                        />
                        Ver contratos
                      </label>

                      <label className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                        <input
                            type="checkbox"
                            name="can_view_commissions"
                            defaultChecked={acesso?.can_view_commissions ?? true}
                        />
                        Ver comissões
                      </label>

                      <label className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                        <input
                            type="checkbox"
                            name="can_view_client_data"
                            defaultChecked={acesso?.can_view_client_data ?? false}
                        />
                        Ver dados do cliente
                      </label>
                    </div>

                    {acesso ? (
                        <div className="md:col-span-2 rounded-xl border border-dashed p-4 text-sm">
                          <div className="font-medium">Acesso já criado</div>
                          <div className="mt-1 text-muted-foreground">
                            Email: {acesso.email}
                          </div>
                          <div className="text-muted-foreground">
                            Último convite: {acesso.invited_at || "—"}
                          </div>
                          <div className="text-muted-foreground">
                            Último login: {acesso.last_login_at || "—"}
                          </div>

                          <div className="mt-3">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={sendingInvite}
                                onClick={async () => {
                                  try {
                                    setSendingInvite(true);
                                    toast.dismiss();
                                    toast.loading("Reenviando convite...");
                                    await resendPartnerInviteAction(acesso.id);
                                    toast.dismiss();
                                    toast.success("Convite reenviado com sucesso.");
                                    onSuccess?.();
                                  } catch (error) {
                                    console.error(error);
                                    toast.dismiss();
                                    toast.error(
                                        error instanceof Error
                                            ? error.message
                                            : "Erro ao reenviar convite."
                                    );
                                  } finally {
                                    setSendingInvite(false);
                                  }
                                }}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Reenviar convite
                            </Button>
                          </div>
                        </div>
                    ) : null}
                  </div>
              ) : null}
            </section>

            <SheetFooter>
              <div className="flex w-full items-center justify-end gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar parceiro
                </Button>
              </div>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
  );
}
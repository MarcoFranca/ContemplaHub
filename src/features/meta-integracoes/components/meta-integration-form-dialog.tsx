"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  createMetaIntegrationAction,
  updateMetaIntegrationAction,
} from "@/app/app/meta-integracoes/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  metaIntegrationFormSchema,
  type MetaIntegrationFormInput,
  type MetaIntegrationFormValues,
} from "@/features/meta-integracoes/schema";
import type {
  MetaIntegration,
  MetaOwnerOption,
} from "@/features/meta-integracoes/types";

type Props = {
  trigger: React.ReactNode;
  ownerOptions: MetaOwnerOption[];
  initialData?: MetaIntegration;
};

function toFormDefaults(
  initialData?: MetaIntegration,
): MetaIntegrationFormValues {
  return {
    nome: initialData?.nome ?? "",
    page_id: initialData?.page_id ?? "",
    page_name: initialData?.page_name ?? undefined,
    form_id: initialData?.form_id ?? undefined,
    form_name: initialData?.form_name ?? undefined,
    source_label: initialData?.source_label ?? "",
    default_owner_id: initialData?.default_owner_id ?? undefined,
    ativo: initialData?.ativo ?? true,
    verify_token: undefined,
    access_token: undefined,
  };
}

export function MetaIntegrationFormDialog({
  trigger,
  ownerOptions,
  initialData,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(initialData);

  const form = useForm<MetaIntegrationFormInput, unknown, MetaIntegrationFormValues>({
    resolver: zodResolver(metaIntegrationFormSchema),
    defaultValues: useMemo(() => toFormDefaults(initialData), [initialData]),
  });
  const defaultOwnerId = useWatch({
    control: form.control,
    name: "default_owner_id",
  });
  const ativo = useWatch({
    control: form.control,
    name: "ativo",
  });

  const title = isEditing ? "Editar integração Meta" : "Nova integração Meta";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          form.reset(toFormDefaults(initialData));
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Configure a página e o formulário da Meta que devem alimentar o
            funil desta organização. O token nunca volta para a UI depois de
            salvo.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-5"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              try {
                const payload: Record<string, unknown> = {
                  nome: values.nome,
                  page_id: values.page_id,
                  page_name: values.page_name ?? null,
                  form_id: values.form_id ?? null,
                  form_name: values.form_name ?? null,
                  source_label: values.source_label,
                  default_owner_id: values.default_owner_id ?? null,
                  ativo: values.ativo,
                };

                if (values.verify_token) payload.verify_token = values.verify_token;
                if (values.access_token) payload.access_token = values.access_token;

                if (initialData?.id) {
                  await updateMetaIntegrationAction(initialData.id, payload);
                } else {
                  await createMetaIntegrationAction(payload);
                }
                toast.success(
                  isEditing
                    ? "Integração Meta atualizada."
                    : "Integração Meta criada.",
                );
                setOpen(false);
              } catch (error) {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Erro ao salvar integração Meta.";
                toast.error(message);
              }
            });
          })}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="nome">Nome interno</Label>
              <Input id="nome" {...form.register("nome")} />
              {form.formState.errors.nome && (
                <p className="text-xs text-red-400">
                  {form.formState.errors.nome.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="page_id">Page ID</Label>
              <Input id="page_id" {...form.register("page_id")} />
              {form.formState.errors.page_id && (
                <p className="text-xs text-red-400">
                  {form.formState.errors.page_id.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="page_name">Nome da página</Label>
              <Input id="page_name" {...form.register("page_name")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="form_id">Form ID</Label>
              <Input id="form_id" {...form.register("form_id")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="form_name">Nome do formulário</Label>
              <Input id="form_name" {...form.register("form_name")} />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="source_label">Source label</Label>
              <Input id="source_label" {...form.register("source_label")} />
              {form.formState.errors.source_label && (
                <p className="text-xs text-red-400">
                  {form.formState.errors.source_label.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Responsável padrão</Label>
              <Select
                value={defaultOwnerId ?? "__none__"}
                onValueChange={(value) =>
                  form.setValue(
                    "default_owner_id",
                    value === "__none__" ? undefined : value,
                    { shouldDirty: true },
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sem responsável padrão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sem responsável padrão</SelectItem>
                  {ownerOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.nome}
                      {option.email ? ` · ${option.email}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div>
                <div className="text-sm font-medium">Integração ativa</div>
                <p className="text-xs text-muted-foreground">
                  Quando desativada, o webhook deixa de resolver esta página no
                  backend.
                </p>
              </div>
              <Switch
                checked={ativo ?? true}
                onCheckedChange={(checked) =>
                  form.setValue("ativo", checked, { shouldDirty: true })
                }
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="verify_token">Verify token</Label>
              <Input
                id="verify_token"
                placeholder={
                  isEditing
                    ? "Deixe em branco para manter o atual"
                    : "Token de validação do webhook"
                }
                {...form.register("verify_token")}
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="access_token">Access token da página</Label>
              <Input
                id="access_token"
                type="password"
                placeholder={
                  isEditing
                    ? "Deixe em branco para manter o atual"
                    : "Token usado para buscar os dados do lead na Meta"
                }
                {...form.register("access_token")}
              />
              <p className="text-xs text-muted-foreground">
                O token é enviado apenas do servidor para o backend e não volta
                para o client depois de persistido.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Criar integração"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

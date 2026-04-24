"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Facebook,
  Loader2,
  LockKeyhole,
  RadioTower,
} from "lucide-react";
import { toast } from "sonner";

import {
  finalizeMetaOAuthIntegrationAction,
  getMetaOAuthStartUrlAction,
  listMetaOAuthPageFormsAction,
  listMetaOAuthPagesAction,
} from "@/app/app/meta-integracoes/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  MetaOwnerOption,
  MetaPage,
  MetaPageForm,
} from "@/features/meta-integracoes/types";

type Props = {
  ownerOptions: MetaOwnerOption[];
  oauthSuccess?: boolean;
  oauthError?: string | null;
};

export function MetaOAuthAssistant({
  ownerOptions,
  oauthSuccess = false,
  oauthError,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pages, setPages] = useState<MetaPage[]>([]);
  const [forms, setForms] = useState<MetaPageForm[]>([]);
  const [pagesError, setPagesError] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string>("");
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [defaultOwnerId, setDefaultOwnerId] = useState<string>("__none__");
  const [nome, setNome] = useState("");
  const [sourceLabel, setSourceLabel] = useState("Meta Ads");

  const canFinalize = Boolean(nome.trim() && sourceLabel.trim() && selectedPageId);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId) ?? null,
    [pages, selectedPageId],
  );

  const loadForms = useCallback((pageId: string, pageName?: string | null) => {
    startTransition(async () => {
      try {
        setPagesError(null);
        const nextForms = await listMetaOAuthPageFormsAction(pageId);
        setForms(nextForms);
        setSelectedFormId(nextForms[0]?.id ?? "");
        if (!nome.trim() && pageName) {
          setNome(`Meta ${pageName}`);
        }
      } catch (error) {
        setForms([]);
        setSelectedFormId("");
        toast.error(
          error instanceof Error
            ? error.message
            : "Erro ao carregar formulários da página.",
        );
      }
    });
  }, [nome, startTransition]);

  const loadPages = useCallback(() => {
    startTransition(async () => {
      try {
        setPagesError(null);
        const nextPages = await listMetaOAuthPagesAction();
        setPages(nextPages);
        const firstPageId = nextPages[0]?.id ?? "";
        setSelectedPageId(firstPageId);
        if (firstPageId) {
          loadForms(firstPageId, nextPages[0]?.name);
        } else {
          setForms([]);
          setSelectedFormId("");
          setPagesError(
            "Nenhuma página autorizada foi encontrada para esta conta Meta. Revise as permissões concedidas e confirme se o usuário possui páginas acessíveis.",
          );
          toast.error(
            "Nenhuma página autorizada foi encontrada para esta conta Meta.",
          );
        }
      } catch (error) {
        setPages([]);
        setForms([]);
        setSelectedFormId("");
        setPagesError(
          error instanceof Error
            ? error.message
            : "Erro ao carregar páginas autorizadas da Meta.",
        );
        toast.error(
          error instanceof Error
            ? error.message
            : "Erro ao carregar páginas autorizadas da Meta.",
        );
      }
    });
  }, [loadForms, startTransition]);

  useEffect(() => {
    if (oauthError) {
      toast.error(oauthError);
    }
  }, [oauthError]);

  useEffect(() => {
    if (oauthSuccess) {
      router.refresh();
      toast.success("Conta Meta conectada. Selecione a página e o formulário.");
      loadPages();
    }
  }, [loadPages, oauthSuccess, router]);

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-emerald-200">
          <Facebook className="h-3.5 w-3.5" />
          Fluxo assistido
        </div>
        <CardTitle>Conectar Meta</CardTitle>
        <CardDescription>
          Autorize a conta Meta, selecione a página, escolha o formulário e
          deixe o sistema salvar a integração na organização correta. O modo
          manual continua disponível como fallback avançado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            "Conectar conta",
            "Selecionar página",
            "Selecionar formulário",
            "Confirmar integração",
          ].map((step, index) => (
            <div
              key={step}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300"
            >
              <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-xs font-semibold text-emerald-200">
                {index + 1}
              </div>
              <div className="font-medium text-white">{step}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            className="gap-2 bg-emerald-500 text-black hover:bg-emerald-400"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                try {
                  const authUrl = await getMetaOAuthStartUrlAction();
                  window.location.href = authUrl;
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Erro ao iniciar OAuth da Meta.",
                  );
                }
              })
            }
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
            Conectar Meta
          </Button>

          <Button
            type="button"
            variant="outline"
            className="gap-2 border-white/10"
            disabled={isPending}
            onClick={loadPages}
          >
            <RadioTower className="h-4 w-4" />
            Atualizar páginas autorizadas
          </Button>
        </div>

        {pagesError ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            {pagesError}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Página autorizada</Label>
            <Select
              value={selectedPageId || "__none__"}
              onValueChange={(value) => {
                if (value === "__none__") {
                  setSelectedPageId("");
                  setForms([]);
                  setSelectedFormId("");
                  return;
                }
                setSelectedPageId(value);
                const page = pages.find((item) => item.id === value);
                loadForms(value, page?.name);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Selecione uma página</SelectItem>
                {pages.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.name ?? page.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Formulário</Label>
            <Select
              value={selectedFormId || "__none__"}
              onValueChange={(value) => setSelectedFormId(value === "__none__" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um formulário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Todos os formulários</SelectItem>
                {forms.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.name ?? form.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="oauth-nome">Nome interno</Label>
            <Input
              id="oauth-nome"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Meta Imobiliário Zona Sul"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="oauth-source-label">Source label</Label>
            <Input
              id="oauth-source-label"
              value={sourceLabel}
              onChange={(event) => setSourceLabel(event.target.value)}
              placeholder="Meta Ads"
            />
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label>Responsável padrão</Label>
            <Select value={defaultOwnerId} onValueChange={setDefaultOwnerId}>
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
        </div>

        <div className="rounded-2xl border border-emerald-400/12 bg-emerald-400/[0.05] p-4 text-sm text-slate-200">
          <div className="mb-2 inline-flex items-center gap-2 text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            Resumo da integração
          </div>
          <div className="space-y-1 text-sm text-slate-300">
            <p>Página: {selectedPage?.name ?? "—"}</p>
            <p>
              Formulário: {forms.find((item) => item.id === selectedFormId)?.name ?? "Todos os formulários"}
            </p>
            <p>Nome interno: {nome || "—"}</p>
            <p>Source label: {sourceLabel || "—"}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            disabled={isPending || !canFinalize}
            className="gap-2 bg-emerald-500 text-black hover:bg-emerald-400"
            onClick={() =>
              startTransition(async () => {
                try {
                  const integration = await finalizeMetaOAuthIntegrationAction({
                    nome,
                    source_label: sourceLabel,
                    page_id: selectedPageId,
                    form_id: selectedFormId || null,
                    default_owner_id:
                      defaultOwnerId === "__none__" ? null : defaultOwnerId,
                    ativo: true,
                  });
                  toast.success("Integração Meta criada via OAuth.");
                  router.push(`/app/meta-integracoes/${integration.id}`);
                  router.refresh();
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Erro ao finalizar integração Meta.",
                  );
                }
              })
            }
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Salvar integração assistida
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

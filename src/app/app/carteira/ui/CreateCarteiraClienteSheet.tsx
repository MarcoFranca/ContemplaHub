"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    ChevronDown,
    LoaderCircle,
    Mail,
    MapPin,
    Phone,
    Plus,
    Search,
    UserRound,
    Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { BrazilPhoneInput } from "@/components/app/shared/SmartInputs";
import { SectionFX } from "@/components/marketing/SectionFX";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { createClienteCarteiraAction } from "../novo/actions";

type Props = {
    variant?: "button" | "fab";
};

type ViaCepResponse = {
    cep?: string;
    logradouro?: string;
    complemento?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
    erro?: boolean;
};

function maskCEP(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function CreateCarteiraClienteSheet({ variant = "button" }: Props) {
    const router = useRouter();

    const [mounted, setMounted] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [showExtra, setShowExtra] = React.useState(false);
    const [cep, setCep] = React.useState("");
    const [cidade, setCidade] = React.useState("");
    const [estado, setEstado] = React.useState("");
    const [endereco, setEndereco] = React.useState("");
    const [numero, setNumero] = React.useState("");
    const [complemento, setComplemento] = React.useState("");
    const [bairro, setBairro] = React.useState("");
    const [cepLoading, setCepLoading] = React.useState(false);
    const [cepHint, setCepHint] = React.useState<string | null>(null);

    const latestCepRequestRef = React.useRef(0);
    const lastResolvedCepRef = React.useRef("");

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleCepLookup = React.useCallback(async (rawCep: string) => {
        const digits = rawCep.replace(/\D/g, "");

        if (digits.length !== 8) {
            setCepHint(null);
            return;
        }

        const requestId = latestCepRequestRef.current + 1;
        latestCepRequestRef.current = requestId;
        setCepLoading(true);
        setCepHint(null);

        try {
            const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
                method: "GET",
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error("Falha ao consultar CEP.");
            }

            const data = (await response.json()) as ViaCepResponse;

            if (latestCepRequestRef.current !== requestId) {
                return;
            }

            if (data.erro) {
                setCepHint("CEP não encontrado. Confira os números e tente novamente.");
                return;
            }

            setEndereco(data.logradouro?.trim() ?? "");
            setBairro(data.bairro?.trim() ?? "");
            setCidade(data.localidade?.trim() ?? "");
            setEstado(data.uf?.trim() ?? "");
            setComplemento((current) => current || data.complemento?.trim() || "");

            if (data.logradouro || data.localidade || data.uf) {
                setCepHint("Endereço preenchido automaticamente. Complete só o que faltar.");
            } else {
                setCepHint("CEP encontrado, mas com retorno parcial. Complete os campos manualmente.");
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            if (latestCepRequestRef.current === requestId) {
                setCepHint("Não foi possível buscar o CEP agora. Você pode preencher manualmente.");
            }
        } finally {
            if (latestCepRequestRef.current === requestId) {
                setCepLoading(false);
            }
        }
    }, []);

    React.useEffect(() => {
        const digits = cep.replace(/\D/g, "");
        if (digits.length !== 8 || digits === lastResolvedCepRef.current) {
            return;
        }

        const timeout = window.setTimeout(() => {
            lastResolvedCepRef.current = digits;
            void handleCepLookup(cep);
        }, 280);

        return () => window.clearTimeout(timeout);
    }, [cep, handleCepLookup]);

    const trigger =
        variant === "fab" ? (
            <Button
                type="button"
                className="h-8 w-8 bg-emerald-600 p-0 shadow-lg hover:bg-emerald-500"
                title="Novo cliente da carteira"
            >
                <Plus className="h-6 w-6 text-white" />
            </Button>
        ) : (
            <Button type="button">
                <Users className="mr-2 h-4 w-4" />
                Novo cliente
            </Button>
        );

    if (!mounted) {
        return trigger;
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>

            <SheetContent
                side="right"
                className="isolate w-[400px] border-l border-white/10 bg-slate-950/70 px-0 shadow-2xl backdrop-blur-xl sm:w-[560px]"
            >
                <SectionFX
                    preset="nebula"
                    variant="emerald"
                    showGrid
                    className="absolute inset-0 -z-10"
                />

                <SheetHeader className="border-b border-white/10 px-6 pb-3 pt-6">
                    <SheetTitle className="flex items-center gap-2 text-base">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/30">
              <Users className="h-3.5 w-3.5 text-emerald-300" />
            </span>
                        Novo cliente da carteira
                    </SheetTitle>
                </SheetHeader>

                <form
                    action={async (fd: FormData) => {
                        const toastId = toast.loading("Criando cliente...");

                        try {
                            const result = await createClienteCarteiraAction({}, fd);

                            if (result?.error) {
                                toast.error(String(result.error), { id: toastId });
                                return;
                            }

                            toast.success("Cliente criado com sucesso!", { id: toastId });
                            setOpen(false);
                            setShowExtra(false);
                            setCep("");
                            setCidade("");
                            setEstado("");
                            setEndereco("");
                            setNumero("");
                            setComplemento("");
                            setBairro("");
                            setCepHint(null);

                            if (result?.leadId) {
                                router.push(`/app/leads/${result.leadId}`);
                                return;
                            }

                            router.refresh();
                        } catch (error) {
                            console.error("Erro ao criar cliente:", error);
                            toast.error("Não foi possível criar o cliente.", { id: toastId });
                        }
                    }}
                    className="relative flex h-[calc(100dvh-56px)] flex-col overflow-hidden"
                >
                    <div className="flex-1 space-y-6 overflow-auto px-6 py-5">
                        <fieldset className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/5">
                            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                                Cadastro rápido
                            </legend>

                            <div className="mt-3 space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nome" className="flex items-center gap-2 text-xs">
                                        <UserRound className="h-3.5 w-3.5" />
                                        Nome
                                    </Label>
                                    <Input id="nome" name="nome" required placeholder="Ex.: João Silva" />
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="flex items-center gap-2 text-xs">
                                            <Phone className="h-3.5 w-3.5" />
                                            Telefone
                                        </Label>
                                        <BrazilPhoneInput
                                            nameDisplay="telefone_visual"
                                            nameNormalized="telefone"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="email" className="flex items-center gap-2 text-xs">
                                            <Mail className="h-3.5 w-3.5" />
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="cliente@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="observacoes" className="text-xs">
                                        Observações
                                    </Label>
                                    <Textarea
                                        id="observacoes"
                                        name="observacoes"
                                        placeholder="Notas iniciais sobre o cliente"
                                        className="min-h-[96px]"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <Collapsible
                            open={showExtra}
                            onOpenChange={setShowExtra}
                            className="rounded-2xl border border-white/10 bg-white/5"
                        >
                            <CollapsibleTrigger asChild>
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                                >
                                    <div>
                                        <div className="text-sm font-medium">Cadastro completo</div>
                                        <div className="text-xs text-muted-foreground">
                                            Adicione mais dados quando fizer sentido
                                        </div>
                                    </div>

                                    <ChevronDown
                                        className={`h-4 w-4 transition ${showExtra ? "rotate-180" : ""}`}
                                    />
                                </button>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="space-y-5 px-4 pb-4">
                                <Separator className="bg-white/10" />

                                <div className="space-y-3">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-white/70">
                                        Dados pessoais
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="cpf" className="text-xs">
                                                CPF
                                            </Label>
                                            <Input id="cpf" name="cpf" placeholder="000.000.000-00" />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="nascimento" className="text-xs">
                                                Data de nascimento
                                            </Label>
                                            <Input id="nascimento" name="nascimento" type="date" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-white/70">
                                        Endereço
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="cep" className="text-xs">
                                                CEP
                                            </Label>
                                            <div className="space-y-2">
                                                <div className="relative">
                                                    <Input
                                                        id="cep"
                                                        name="cep"
                                                        placeholder="00000-000"
                                                        value={cep}
                                                        onChange={(e) => {
                                                            const nextCep = maskCEP(e.target.value);
                                                            setCep(nextCep);
                                                            if (nextCep.replace(/\D/g, "").length < 8) {
                                                                lastResolvedCepRef.current = "";
                                                                setCepHint(null);
                                                                setCepLoading(false);
                                                            }
                                                        }}
                                                        onBlur={() => void handleCepLookup(cep)}
                                                        maxLength={9}
                                                        className="pr-10"
                                                    />
                                                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/45">
                                                        {cepLoading ? (
                                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Search className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="min-h-4 text-[11px] text-emerald-200/80">
                                                    {cepHint ?? "Ao informar o CEP, buscamos cidade, UF, bairro e logradouro."}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="cidade" className="flex items-center gap-2 text-xs">
                                                <MapPin className="h-3.5 w-3.5" />
                                                Cidade
                                            </Label>
                                            <Input
                                                id="cidade"
                                                name="cidade"
                                                placeholder="São Paulo"
                                                value={cidade}
                                                onChange={(e) => setCidade(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="estado" className="text-xs">
                                                Estado
                                            </Label>
                                            <Input
                                                id="estado"
                                                name="estado"
                                                placeholder="SP"
                                                value={estado}
                                                onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="bairro" className="text-xs">
                                                Bairro
                                            </Label>
                                            <Input
                                                id="bairro"
                                                name="bairro"
                                                placeholder="Centro"
                                                value={bairro}
                                                onChange={(e) => setBairro(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="endereco" className="text-xs">
                                            Logradouro
                                        </Label>
                                        <Input
                                            id="endereco"
                                            name="endereco"
                                            placeholder="Rua, avenida, alameda..."
                                            value={endereco}
                                            onChange={(e) => setEndereco(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-[160px_minmax(0,1fr)]">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="numero" className="text-xs">
                                                Número
                                            </Label>
                                            <Input
                                                id="numero"
                                                name="numero"
                                                placeholder="123"
                                                value={numero}
                                                onChange={(e) => setNumero(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="complemento" className="text-xs">
                                                Complemento
                                            </Label>
                                            <Input
                                                id="complemento"
                                                name="complemento"
                                                placeholder="Apto, bloco, sala..."
                                                value={complemento}
                                                onChange={(e) => setComplemento(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>

                    <SheetFooter className="border-t border-white/10 px-6 py-4">
                        <div className="flex w-full items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500">
                                Salvar cliente
                            </Button>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
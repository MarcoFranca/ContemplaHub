// src/app/cadastro/[token]/CadastroPFForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
    token: string;
};

type FormState = {
    nome_completo: string;
    cpf: string;
    data_nascimento: string;
    estado_civil: string;
    email: string;
    telefone_celular: string;
    renda_mensal: string;
    cep: string;
    endereco: string;
    bairro: string;
    cidade: string;
    uf: string;
    observacoes: string;
};

export function CadastroPFForm({ token }: Props) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<FormState>({
        nome_completo: "",
        cpf: "",
        data_nascimento: "",
        estado_civil: "",
        email: "",
        telefone_celular: "",
        renda_mensal: "",
        cep: "",
        endereco: "",
        bairro: "",
        cidade: "",
        uf: "",
        observacoes: "",
    });

    function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            // monta o payload no formato que o backend PF vai receber
            const payload = {
                nome_completo: form.nome_completo,
                cpf: form.cpf,
                data_nascimento: form.data_nascimento || null,
                estado_civil: form.estado_civil || null,
                email: form.email,
                telefone_celular: form.telefone_celular,
                renda_mensal: form.renda_mensal
                    ? Number(String(form.renda_mensal).replace(",", "."))
                    : null,
                cep: form.cep,
                endereco: form.endereco,
                bairro: form.bairro,
                cidade: form.cidade,
                uf: form.uf,
                observacoes: form.observacoes || null,
            };

            const res = await fetch(`/api/cadastro/${token}/pf`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                console.error("Erro ao salvar cadastro PF:", await res.text());
                throw new Error("Falha ao salvar seus dados.");
            }

            toast.success("Dados enviados com sucesso! 😊");
            // opcional: você pode redirecionar para uma página de "obrigado"
            // router.push("/cadastro/obrigado");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Não foi possível enviar seus dados.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados básicos */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                    <Label htmlFor="nome_completo">Nome completo</Label>
                    <Input
                        id="nome_completo"
                        value={form.nome_completo}
                        onChange={(e) => handleChange("nome_completo", e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                        id="cpf"
                        value={form.cpf}
                        onChange={(e) => handleChange("cpf", e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="data_nascimento">Data de nascimento</Label>
                    <Input
                        id="data_nascimento"
                        type="date"
                        value={form.data_nascimento}
                        onChange={(e) => handleChange("data_nascimento", e.target.value)}
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="estado_civil">Estado civil</Label>
                    <Input
                        id="estado_civil"
                        placeholder="Solteiro(a), Casado(a), União estável..."
                        value={form.estado_civil}
                        onChange={(e) => handleChange("estado_civil", e.target.value)}
                    />
                </div>
            </div>

            {/* Contato */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="telefone_celular">Celular com DDD</Label>
                    <Input
                        id="telefone_celular"
                        value={form.telefone_celular}
                        onChange={(e) => handleChange("telefone_celular", e.target.value)}
                        required
                    />
                </div>
            </div>

            {/* Renda */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                    <Label htmlFor="renda_mensal">Renda mensal aproximada (R$)</Label>
                    <Input
                        id="renda_mensal"
                        value={form.renda_mensal}
                        onChange={(e) => handleChange("renda_mensal", e.target.value)}
                    />
                </div>
            </div>

            {/* Endereço */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                        id="cep"
                        value={form.cep}
                        onChange={(e) => handleChange("cep", e.target.value)}
                    />
                </div>
                <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="endereco">Endereço residencial</Label>
                    <Input
                        id="endereco"
                        value={form.endereco}
                        onChange={(e) => handleChange("endereco", e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                        id="bairro"
                        value={form.bairro}
                        onChange={(e) => handleChange("bairro", e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                        id="cidade"
                        value={form.cidade}
                        onChange={(e) => handleChange("cidade", e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="uf">UF</Label>
                    <Input
                        id="uf"
                        value={form.uf}
                        maxLength={2}
                        onChange={(e) => handleChange("uf", e.target.value.toUpperCase())}
                    />
                </div>
            </div>

            {/* Observações */}
            <div className="space-y-1">
                <Label htmlFor="observacoes">Observações importantes (opcional)</Label>
                <Textarea
                    id="observacoes"
                    value={form.observacoes}
                    onChange={(e) => handleChange("observacoes", e.target.value)}
                    placeholder="Ex.: Pretendo usar FGTS, tenho outro financiamento em andamento, etc."
                />
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={saving} className="min-w-[160px]">
                    {saving ? "Enviando..." : "Enviar dados"}
                </Button>
            </div>
        </form>
    );
}

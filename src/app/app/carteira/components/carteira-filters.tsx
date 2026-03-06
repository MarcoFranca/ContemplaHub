import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type CarteiraFiltersProps = {
    view: "clientes" | "cartas";
    q: string;
    produto: string;
    statusCarteira: string;
    includeAll: boolean;
};

export function CarteiraFilters({
                                    view,
                                    q,
                                    produto,
                                    statusCarteira,
                                    includeAll,
                                }: CarteiraFiltersProps) {
    return (
        <Card className="bg-white/5 border-white/10">
            <CardContent className="py-4">
                <form className="flex flex-col md:flex-row md:items-end gap-3" method="GET">
                    <input type="hidden" name="view" value={view} />

                    <div className="flex-1">
                        <Label>Buscar cliente</Label>
                        <Input
                            name="q"
                            defaultValue={q}
                            placeholder="Nome, telefone ou email..."
                        />
                    </div>

                    <div className="w-full md:w-48">
                        <Label>Produto</Label>
                        <select
                            name="produto"
                            defaultValue={produto}
                            className="h-10 w-full rounded-md border border-white/10 bg-background px-3 text-sm"
                        >
                            <option value="">Todos</option>
                            <option value="imobiliario">Imobiliário</option>
                            <option value="auto">Auto</option>
                            <option value="pesados">Pesados</option>
                        </select>
                    </div>

                    <div className="w-full md:w-48">
                        <Label>Status da carteira</Label>
                        <select
                            name="status_carteira"
                            defaultValue={statusCarteira}
                            className="h-10 w-full rounded-md border border-white/10 bg-background px-3 text-sm"
                        >
                            <option value="">Todos</option>
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                            <option value="arquivado">Arquivado</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 md:pb-1">
                        <Switch name="all" value="1" defaultChecked={includeAll} />
                        <span className="text-sm text-muted-foreground">Incluir todos</span>
                    </div>

                    <Button type="submit">Aplicar</Button>
                </form>
            </CardContent>
        </Card>
    );
}
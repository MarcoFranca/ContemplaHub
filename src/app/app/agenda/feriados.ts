// Feriados nacionais brasileiros calculados (mesma lógica do backend agenda_service.py).
// Móveis derivam da Páscoa (algoritmo de Meeus/Butcher). Sem API externa.

export type Feriado = { data: string; nome: string; nacional: boolean };

function pascoa(ano: number): Date {
    const a = ano % 19;
    const b = Math.floor(ano / 100);
    const c = ano % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * m + 114) / 31);
    const dia = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(ano, mes - 1, dia);
}

function iso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(d: Date, n: number): Date {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
}

export function feriadosNacionais(ano: number): Feriado[] {
    const p = pascoa(ano);
    const fixos: [number, number, string][] = [
        [1, 1, "Confraternização Universal"],
        [4, 21, "Tiradentes"],
        [5, 1, "Dia do Trabalho"],
        [9, 7, "Independência do Brasil"],
        [10, 12, "Nossa Senhora Aparecida"],
        [11, 2, "Finados"],
        [11, 15, "Proclamação da República"],
        [11, 20, "Consciência Negra"],
        [12, 25, "Natal"],
    ];
    const lista: Feriado[] = fixos.map(([mes, dia, nome]) => ({
        data: iso(new Date(ano, mes - 1, dia)),
        nome,
        nacional: true,
    }));
    lista.push({ data: iso(addDays(p, -48)), nome: "Carnaval (segunda)", nacional: true });
    lista.push({ data: iso(addDays(p, -47)), nome: "Carnaval", nacional: true });
    lista.push({ data: iso(addDays(p, -2)), nome: "Sexta-feira Santa", nacional: true });
    lista.push({ data: iso(addDays(p, 60)), nome: "Corpus Christi", nacional: true });
    return lista;
}

/** Mapa data(ISO) -> nome, combinando nacionais dos anos pedidos + custom da org. */
export function mapaFeriados(anos: number[], custom: { data: string; nome: string }[]): Map<string, string> {
    const m = new Map<string, string>();
    for (const ano of anos) for (const f of feriadosNacionais(ano)) m.set(f.data, f.nome);
    for (const c of custom) m.set(c.data.slice(0, 10), c.nome);
    return m;
}

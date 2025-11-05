import 'dotenv/config'; // 👈 carrega o .env automaticamente
import { createClient } from "@supabase/supabase-js";

const s = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMINISTRADORAS = [
    { nome: "Porto Seguro", cnpj: "61.198.164/0001-60", site: "https://www.portoseguro.com.br" },
    { nome: "Rodobens", cnpj: "56.994.734/0001-03", site: "https://www.rodobens.com.br" },
    { nome: "Itaú Consórcio", cnpj: "17.192.451/0001-70", site: "https://www.itau.com.br" },
    { nome: "Bradesco Consórcio", cnpj: "60.746.948/0001-12", site: "https://www.bradesco.com.br" },
    { nome: "Santander Consórcio", cnpj: "90.400.888/0001-42", site: "https://www.santander.com.br" },
    { nome: "Caixa Consórcio", cnpj: "00.360.305/0001-04", site: "https://www.caixa.gov.br" },
    { nome: "HS Consórcio", cnpj: "60.853.679/0001-50", site: "https://www.hsconsorcio.com.br" },
    { nome: "Embracon", cnpj: "52.695.847/0001-09", site: "https://www.embracon.com.br" },
];

async function main() {
    console.log("🔄 Inserindo administradoras...");

    for (const adm of ADMINISTRADORAS) {
        const { error } = await s
            .from("administradoras")
            .upsert(
                {
                    nome: adm.nome,
                    cnpj: adm.cnpj,
                    site: adm.site,
                },
                { onConflict: "nome" } // evita duplicar
            );

        if (error) {
            console.error(`❌ Erro ao inserir ${adm.nome}:`, error.message);
        } else {
            console.log(`✅ ${adm.nome} inserida/atualizada`);
        }
    }

    console.log("🌱 Seed de administradoras concluído!");
}

main().catch(console.error);

// src/db/seed.ts
import { db } from "./index";
import { orgs } from "./schema/orgs-profiles";
import { administradoras, grupos } from "./schema/consorcio";

export async function seed() {
    const [org] = await db.insert(orgs).values({ nome: "Autentika Seguros" }).returning();
    const [adm] = await db.insert(administradoras).values({ orgId: org.id, nome: "BB Consórcio" }).returning();
    await db.insert(grupos).values({
        orgId: org.id,
        administradoraId: adm.id,
        codigo: "G123",
        produto: "imobiliario",
        assembleiaDia: 15,
    });
}

// src/db/seed.ts
import { db } from "./index";
import { orgs } from "./schema/orgs-profiles";
import { administradoras, grupos } from "./schema/consorcio";
import { randomUUID } from "crypto";

export async function seed() {
    // Dono fictício para seed (pode ser um usuário real do Supabase Auth, se quiser)
    const ownerId = randomUUID();

    const [org] = await db
        .insert(orgs)
        .values({
            nome: "Autentika Seguros",
            ownerUserId: ownerId,
            slug: "autentika",     // opcional
            active: true,          // opcional
            timezone: "America/Sao_Paulo",
        })
        .returning();

    const [adm] = await db
        .insert(administradoras)
        .values({ orgId: org.id, nome: "BB Consórcio" })
        .returning();

    await db.insert(grupos).values({
        orgId: org.id,
        administradoraId: adm.id,
        codigo: "G123",
        produto: "imobiliario",
        assembleiaDia: 15,
    });
}

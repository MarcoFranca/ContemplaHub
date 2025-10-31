// src/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as enums from "./schema/enums";
import * as orgsProfiles from "./schema/orgs-profiles";
import * as crm from "./schema/crm";
import * as dealsPropostas from "./schema/deals-propostas";
import * as consorcio from "./schema/consorcio";
import * as compliance from "./schema/compliance";
import * as relations from "./schema/relations";
import * as marketing from "./schema/marketing";

// Conexão única (evite recriar em cada request)
const connection = postgres(process.env.SUPABASE_DB_URL!, {
    max: 1, // RSC/Edge: ajuste conforme seu runtime
    prepare: true,
    ssl: 'require',
});

export const db = drizzle(connection, {
    schema: {
        ...enums,
        ...orgsProfiles,
        ...crm,
        ...dealsPropostas,
        ...consorcio,
        ...compliance,
        ...marketing,
        ...relations,
    },
});

export * from "./schema/enums";
export * from "./schema/orgs-profiles";
export * from "./schema/crm";
export * from "./schema/deals-propostas";
export * from "./schema/consorcio";
export * from "./schema/compliance";
export * from "./schema/relations";
export * from "./schema/marketing";

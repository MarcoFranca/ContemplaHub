import {
    pgTable, uuid, text, integer, timestamp, numeric, index
} from "drizzle-orm/pg-core";
import { orgs, profiles } from "./orgs-profiles";
import { leads } from "./crm";
import { cotas } from "./consorcio"; // se quiser FK para a cota convertida
import { perfilPsico } from "./enums";

/** status: aberto | convertido | arquivado */
export const interesseStatus = (col: string) =>
    text(col).$type<"aberto" | "convertido" | "arquivado">().default("aberto");

export const leadInteresses = pgTable(
    "lead_interesses",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        orgId: uuid("org_id")
            .references(() => orgs.id, { onDelete: "cascade" }),

        leadId: uuid("lead_id")
            .references(() => leads.id, { onDelete: "cascade" }),

        // campos do interesse
        // texto livre (validado no backend via Literal Produto: imobiliario|auto|pesados).
        // Era enum "produto", convertido para text na migration 0013 (ver consorcio.ts).
        produto: text("produto"),
        valorTotal: numeric("valor_total"),
        prazoMeses: integer("prazo_meses"),
        objetivo: text("objetivo"),
        perfilDesejado: perfilPsico("perfil_desejado"),
        observacao: text("observacao"),

        // estado
        status: interesseStatus("status"),
        linkedCotaId: uuid("linked_cota_id")
            .references(() => cotas.id)              // opcional; remova se não quiser FK

        ,
        closedAt: timestamp("closed_at", { withTimezone: true }),

        // auditoria
        createdBy: uuid("created_by").references(() => profiles.userId),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    },
    (t) => ({
        byLeadStatus: index("idx_interesses_lead_status").on(t.leadId, t.status),
        byOrg: index("idx_interesses_org").on(t.orgId),
    })
);

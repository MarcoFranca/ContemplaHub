import { relations } from "drizzle-orm";
import { orgs, profiles } from "./orgs-profiles";
import { leads, leadStageHistory, activities, notes, attachments } from "./crm";
import { deals, propostas } from "./deals-propostas";
import { administradoras, grupos, assembleias, cotas, lances, contemplacoes, contratos, pagamentos } from "./consorcio";

export const orgsRelations = relations(orgs, ({ many }) => ({
    profiles: many(profiles),
    leads: many(leads),
    deals: many(deals),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
    org: one(orgs, { fields: [profiles.orgId], references: [orgs.id] }),
    leadsOwned: many(leads),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
    org: one(orgs, { fields: [leads.orgId], references: [orgs.id] }),
    owner: one(profiles, { fields: [leads.ownerId], references: [profiles.userId] }),
    history: many(leadStageHistory),
    activities: many(activities),
    notes: many(notes),
    attachments: many(attachments),
    deals: many(deals),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
    org: one(orgs, { fields: [deals.orgId], references: [orgs.id] }),
    lead: one(leads, { fields: [deals.leadId], references: [leads.id] }),
    propostas: many(propostas),
    contratos: many(contratos),
}));

export const propostasRelations = relations(propostas, ({ one }) => ({
    org: one(orgs, { fields: [propostas.orgId], references: [orgs.id] }),
    lead: one(leads, { fields: [propostas.leadId], references: [leads.id] }),
    deal: one(deals, { fields: [propostas.dealId], references: [deals.id] }),
}));

export const consorcioRelations = {
    administradoras: relations(administradoras, ({ many }) => ({
        grupos: many(grupos),
    })),
    grupos: relations(grupos, ({ one, many }) => ({
        administradora: one(administradoras, { fields: [grupos.administradoraId], references: [administradoras.id] }),
        assembleias: many(assembleias),
    })),
    assembleias: relations(assembleias, ({ one, many }) => ({
        grupo: one(grupos, { fields: [assembleias.grupoId], references: [grupos.id] }),
        lances: many(lances),
        contemplacoes: many(contemplacoes),
    })),
    cotas: relations(cotas, ({ one, many }) => ({
        administradora: one(administradoras, { fields: [cotas.administradoraId], references: [administradoras.id] }),
        grupo: one(grupos, { fields: [cotas.grupoId], references: [grupos.id] }),
        lances: many(lances),
        contemplacao: many(contemplacoes),
        contratos: many(contratos),
    })),
    lances: relations(lances, ({ one }) => ({
        cota: one(cotas, { fields: [lances.cotaId], references: [cotas.id] }),
        assembleia: one(assembleias, { fields: [lances.assembleiaId], references: [assembleias.id] }),
    })),
    contratos: relations(contratos, ({ one, many }) => ({
        cota: one(cotas, { fields: [contratos.cotaId], references: [cotas.id] }),
        pagamentos: many(pagamentos),
    })),
    pagamentos: relations(pagamentos, ({ one }) => ({
        contrato: one(contratos, { fields: [pagamentos.contratoId], references: [contratos.id] }),
    })),
};

// src/app/api/leads/create/route.ts
import { z } from "zod";
import { NextResponse } from "next/server";
import { db, leads, landingPages } from "@/db";
import { eq } from "drizzle-orm";

// schema request
const LeadIn = z.object({
    hash: z.string().min(5), // publicHash da landing
    nome: z.string().min(2),
    telefone: z.string().optional(),
    email: z.string().email().optional(),
    valorInteresse: z.string().optional(),
    prazoMeses: z.number().int().optional(),
    consentimento: z.boolean().default(false),
    utm: z.object({
        source: z.string().optional(),
        medium: z.string().optional(),
        campaign: z.string().optional(),
        term: z.string().optional(),
        content: z.string().optional(),
    }).optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = LeadIn.parse(body);

        // 1) Resolve landing
        const [landing] = await db.select().from(landingPages)
            .where(eq(landingPages.publicHash, data.hash)).limit(1);

        if (!landing || !landing.active) {
            return NextResponse.json({ ok: false, error: "Landing inválida/inativa" }, { status: 400 });
        }

        // 2) Upsert lead (ou insert simples) — simplificado
        const [row] = await db.insert(leads).values({
            orgId: landing.orgId,
            ownerId: landing.ownerUserId,
            nome: data.nome,
            telefone: data.telefone,
            email: data.email,
            valorInteresse: data.valorInteresse as any,
            prazoMeses: data.prazoMeses,
            consentimento: data.consentimento,
            consentScope: "lp_form",
            consentTs: new Date(),
            utmSource: data.utm?.source,
            utmMedium: data.utm?.medium,
            utmCampaign: data.utm?.campaign,
            utmTerm: data.utm?.term,
            utmContent: data.utm?.content,
            origem: "lp",
            landingId: landing.id,
        }).returning();

        return NextResponse.json({ ok: true, id: row.id });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    }
}

import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";
import { AzosQuoteWizard } from "@/features/seguros-azos/AzosQuoteWizard";
import { getLeadCadastroPFByLead } from "../pf-cadastro";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function LeadAzosQuotePage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;
  const profile = await getCurrentProfile();
  if (!profile?.orgId) throw new Error("Organização inválida.");

  const supabase = await supabaseServer();
  const { data: lead, error } = await supabase
    .from("leads")
    .select("id, nome")
    .eq("id", leadId)
    .eq("org_id", profile.orgId)
    .maybeSingle();

  if (error) throw error;
  if (!lead) notFound();
  const pf = await getLeadCadastroPFByLead(leadId, profile.orgId);
  return <AzosQuoteWizard leadId={lead.id} leadName={lead.nome ?? "este cliente"} initialData={{ data_nascimento: pf?.data_nascimento ?? "", renda_mensal: pf?.renda_mensal ?? null }} />;
}

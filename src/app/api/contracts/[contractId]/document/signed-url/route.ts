import { NextResponse } from "next/server";

import { getBackendUrl } from "@/lib/backend";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";

type Params = Promise<{ contractId: string }>;

export async function POST(request: Request, context: { params: Params }) {
  const { contractId } = await context.params;

  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const profile = await getCurrentProfile();
  if (!profile?.orgId) {
    return NextResponse.json({ error: "Organização inválida." }, { status: 400 });
  }

  const body = await request.text();

  const res = await fetch(`${getBackendUrl()}/contracts/${contractId}/document/signed-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      "X-Org-Id": profile.orgId,
    },
    body,
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

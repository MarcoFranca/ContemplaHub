import { NextResponse } from "next/server";

import { getBackendUrl } from "@/lib/backend";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";

async function getSessionContext() {
  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { error: NextResponse.json({ error: "Sessão inválida." }, { status: 401 }) };
  }

  const profile = await getCurrentProfile();
  if (!profile?.orgId) {
    return { error: NextResponse.json({ error: "Organização inválida." }, { status: 400 }) };
  }

  return {
    accessToken: session.access_token,
    orgId: profile.orgId,
  };
}

type Params = Promise<{ contractId: string }>;

export async function GET(_: Request, context: { params: Params }) {
  const { contractId } = await context.params;
  const ctx = await getSessionContext();
  if ("error" in ctx) return ctx.error;

  const res = await fetch(`${getBackendUrl()}/contracts/${contractId}/document`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${ctx.accessToken}`,
      "X-Org-Id": ctx.orgId,
    },
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request, context: { params: Params }) {
  const { contractId } = await context.params;
  const ctx = await getSessionContext();
  if ("error" in ctx) return ctx.error;

  const formData = await request.formData();

  const res = await fetch(`${getBackendUrl()}/contracts/${contractId}/document`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ctx.accessToken}`,
      "X-Org-Id": ctx.orgId,
    },
    body: formData,
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(_: Request, context: { params: Params }) {
  const { contractId } = await context.params;
  const ctx = await getSessionContext();
  if ("error" in ctx) return ctx.error;

  const res = await fetch(`${getBackendUrl()}/contracts/${contractId}/document`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${ctx.accessToken}`,
      "X-Org-Id": ctx.orgId,
    },
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

"use server";

import { revalidatePath } from "next/cache";
import { getBackendUrl } from "@/lib/backend";
import { getCurrentProfile } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";
import type {
  Parceiro,
  ParceiroAcesso,
  ParceiroExtratoItem,
  ParceiroExtratoResponse,
} from "./types";

type BackendListEnvelope<T> = {
  ok?: boolean;
  item?: T;
  items?: T[];
};

type BackendParceiroExtratoEnvelope = {
  ok?: boolean;
  parceiro?: Parceiro;
  items?: ParceiroExtratoItem[];
  resumo?: ParceiroExtratoResponse["resumo"];
};

async function getBackendAuthContext() {
  const profile = await getCurrentProfile();
  if (!profile?.orgId) throw new Error("Organização inválida.");

  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token;
  if (!accessToken) throw new Error("Sessão inválida. Faça login novamente.");

  return { orgId: profile.orgId, accessToken };
}

async function backendAuthed<T>(path: string, init?: RequestInit): Promise<T> {
  const { orgId, accessToken } = await getBackendAuthContext();
  const baseUrl = getBackendUrl();

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Org-Id": orgId,
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ${res.status} ao chamar backend.`);
  }

  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

function nullableString(formData: FormData, name: string) {
  const value = String(formData.get(name) || "").trim();
  return value ? value : null;
}

function formBoolean(formData: FormData, name: string) {
  return Boolean(formData.get(name));
}

export async function listParceirosAction(ativos?: boolean): Promise<Parceiro[]> {
  const query = typeof ativos === "boolean" ? `?ativos=${ativos}` : "";
  const data = await backendAuthed<BackendListEnvelope<Parceiro>>(
      `/comissoes/parceiros${query}`,
      { method: "GET" }
  );

  return data.items ?? [];
}

export async function listPartnerUsersAction(ativos?: boolean): Promise<ParceiroAcesso[]> {
  const query =
      typeof ativos === "boolean" ? `?ativos=${ativos}` : "";

  const data = await backendAuthed<BackendListEnvelope<ParceiroAcesso>>(
      `/partner-users${query}`,
      { method: "GET" }
  );

  return data.items ?? [];
}

export async function createParceiroAction(formData: FormData): Promise<Parceiro> {
  const body = {
    nome: String(formData.get("nome") || "").trim(),
    cpf_cnpj: nullableString(formData, "cpf_cnpj"),
    telefone: nullableString(formData, "telefone"),
    email: nullableString(formData, "email"),
    pix_tipo: nullableString(formData, "pix_tipo"),
    pix_chave: nullableString(formData, "pix_chave"),
    ativo: formBoolean(formData, "ativo"),
    observacoes: nullableString(formData, "observacoes"),
  };

  if (!body.nome) throw new Error("Informe o nome do parceiro.");

  const data = await backendAuthed<BackendListEnvelope<Parceiro>>(
      `/comissoes/parceiros`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
  );

  revalidatePath("/app/parceiros");
  if (!data.item) throw new Error("Parceiro não retornado pelo backend.");
  return data.item;
}

export async function updateParceiroAction(formData: FormData): Promise<Parceiro | null> {
  const parceiroId = String(formData.get("parceiro_id") || "").trim();
  if (!parceiroId) throw new Error("Parceiro inválido.");

  const body = {
    nome: nullableString(formData, "nome"),
    cpf_cnpj: nullableString(formData, "cpf_cnpj"),
    telefone: nullableString(formData, "telefone"),
    email: nullableString(formData, "email"),
    pix_tipo: nullableString(formData, "pix_tipo"),
    pix_chave: nullableString(formData, "pix_chave"),
    ativo: formBoolean(formData, "ativo"),
    observacoes: nullableString(formData, "observacoes"),
  };

  const data = await backendAuthed<BackendListEnvelope<Parceiro>>(
      `/comissoes/parceiros/${parceiroId}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
  );

  revalidatePath("/app/parceiros");
  return data.item ?? null;
}

export async function invitePartnerUserAction(formData: FormData): Promise<ParceiroAcesso> {
  const parceiroId = String(formData.get("parceiro_id") || "").trim();
  const email = String(formData.get("access_email") || "").trim();
  const nome = nullableString(formData, "access_nome");
  const telefone = nullableString(formData, "access_telefone");

  if (!parceiroId) throw new Error("Parceiro inválido para liberar acesso.");
  if (!email) throw new Error("Informe o e-mail para liberar o acesso.");

  const body = {
    parceiro_id: parceiroId,
    email,
    nome,
    telefone,
    can_view_client_data: formBoolean(formData, "can_view_client_data"),
    can_view_contracts: formBoolean(formData, "can_view_contracts"),
    can_view_commissions: formBoolean(formData, "can_view_commissions"),
  };

  const data = await backendAuthed<BackendListEnvelope<ParceiroAcesso>>(
      `/partner-users/invite`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
  );

  revalidatePath("/app/parceiros");
  if (!data.item) throw new Error("Acesso do parceiro não retornado pelo backend.");
  return data.item;
}

export async function updatePartnerUserAction(formData: FormData): Promise<ParceiroAcesso | null> {
  const partnerUserId = String(formData.get("partner_user_id") || "").trim();
  if (!partnerUserId) throw new Error("Acesso do parceiro inválido.");

  const body = {
    nome: nullableString(formData, "access_nome"),
    telefone: nullableString(formData, "access_telefone"),
    ativo: formBoolean(formData, "access_ativo"),
    can_view_client_data: formBoolean(formData, "can_view_client_data"),
    can_view_contracts: formBoolean(formData, "can_view_contracts"),
    can_view_commissions: formBoolean(formData, "can_view_commissions"),
  };

  const data = await backendAuthed<BackendListEnvelope<ParceiroAcesso>>(
      `/partner-users/${partnerUserId}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
  );

  revalidatePath("/app/parceiros");
  return data.item ?? null;
}

export async function resendPartnerInviteAction(partnerUserId: string) {
  if (!partnerUserId) throw new Error("Acesso do parceiro inválido.");

  await backendAuthed<{ ok?: boolean }>(
      `/partner-users/${partnerUserId}/resend-invite`,
      {
        method: "POST",
        body: JSON.stringify({}),
      }
  );

  revalidatePath("/app/parceiros");
}

export async function saveParceiroAndAccessAction(formData: FormData): Promise<{
  parceiro: Parceiro;
  acesso?: ParceiroAcesso | null;
}> {
  const parceiroId = String(formData.get("parceiro_id") || "").trim();
  const liberarAcesso = formBoolean(formData, "liberar_acesso");

  const parceiro = parceiroId
      ? await updateParceiroAction(formData)
      : await createParceiroAction(formData);

  if (!parceiro) {
    throw new Error("Não foi possível salvar o parceiro.");
  }

  if (!liberarAcesso) {
    revalidatePath("/app/parceiros");
    return { parceiro, acesso: null };
  }

  const partnerUserId = String(formData.get("partner_user_id") || "").trim();

  // garante IDs para ações seguintes
  formData.set("parceiro_id", parceiro.id);

  let acesso: ParceiroAcesso | null = null;
  if (partnerUserId) {
    acesso = await updatePartnerUserAction(formData);
  } else {
    acesso = await invitePartnerUserAction(formData);
  }

  revalidatePath("/app/parceiros");
  return { parceiro, acesso };
}

export async function getParceiroExtratoAction(
    parceiroId: string
): Promise<ParceiroExtratoResponse> {
  const data = await backendAuthed<BackendParceiroExtratoEnvelope>(
      `/comissoes/parceiros/${parceiroId}/extrato`,
      {
        method: "GET",
      }
  );

  if (!data.parceiro) {
    throw new Error("Parceiro não retornado pelo backend.");
  }

  return {
    parceiro: data.parceiro,
    items: data.items ?? [],
    resumo: data.resumo ?? null,
  };
}
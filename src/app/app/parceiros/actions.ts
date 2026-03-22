"use server";

import { revalidatePath } from "next/cache";
import { getBackendAuthContext } from "@/lib/backend-auth";
import type { Parceiro, PartnerUser } from "./types";

const PARCEIROS_BASE = "/comissoes/parceiros";
const PARTNER_USERS_BASE = "/partner-users";

async function getJsonOrThrow<T>(res: Response, fallbackMessage: string): Promise<T> {
  if (!res.ok) {
    let message = fallbackMessage;

    try {
      const data = await res.json();
      message = data?.detail || data?.message || data?.error || fallbackMessage;
    } catch {}

    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export async function listParceirosAction(): Promise<Parceiro[]> {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(`${backendUrl}${PARCEIROS_BASE}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await getJsonOrThrow<{ ok: boolean; items: Parceiro[] }>(
      res,
      "Erro ao listar parceiros"
  );

  return Array.isArray(data.items) ? data.items : [];
}

export async function listPartnerUsersAction(): Promise<PartnerUser[]> {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(`${backendUrl}${PARTNER_USERS_BASE}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await getJsonOrThrow<{ ok: boolean; items: PartnerUser[] }>(
      res,
      "Erro ao listar acessos dos parceiros"
  );

  return Array.isArray(data.items) ? data.items : [];
}

export async function createParceiroAction(payload: unknown) {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(`${backendUrl}${PARCEIROS_BASE}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  await getJsonOrThrow(res, "Erro ao criar parceiro");
  revalidatePath("/app/parceiros");
}

export async function updateParceiroAction(id: string, payload: unknown) {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(`${backendUrl}${PARCEIROS_BASE}/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  await getJsonOrThrow(res, "Erro ao atualizar parceiro");
  revalidatePath("/app/parceiros");
}

export async function invitePartnerUserAction(payload: unknown) {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(`${backendUrl}${PARTNER_USERS_BASE}/invite`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  await getJsonOrThrow(res, "Erro ao criar acesso do parceiro");
  revalidatePath("/app/parceiros");
}

export async function updatePartnerUserAction(id: string, payload: unknown) {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(`${backendUrl}${PARTNER_USERS_BASE}/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  await getJsonOrThrow(res, "Erro ao atualizar acesso do parceiro");
  revalidatePath("/app/parceiros");
}

export async function toggleParceiroAction(
    id: string,
    ativo: boolean,
    reason?: string
) {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(`${backendUrl}${PARCEIROS_BASE}/${id}/toggle`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ativo,
      disabled_reason: reason,
    }),
  });

  await getJsonOrThrow(res, "Erro ao alterar status do parceiro");
  revalidatePath("/app/parceiros");
}

export async function resendInviteAction(partnerUserId: string) {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(
      `${backendUrl}${PARTNER_USERS_BASE}/${partnerUserId}/resend-invite`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
  );

  await getJsonOrThrow(res, "Erro ao reenviar convite");
  revalidatePath("/app/parceiros");
}

export type DeleteCheckResponse = {
  ok: boolean;
  can_delete: boolean;
  parceiro?: {
    id: string;
    nome: string;
    ativo: boolean;
  };
  reasons: string[];
  counts: {
    partner_users: number;
    cotas: number;
    contratos: number;
    comissoes: number;
  };
};

export async function getParceiroDeleteCheckAction(
    id: string
): Promise<DeleteCheckResponse> {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(`${backendUrl}${PARCEIROS_BASE}/${id}/delete-check`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  return getJsonOrThrow<DeleteCheckResponse>(
      res,
      "Erro ao validar exclusão do parceiro"
  );
}

export async function deleteParceiroAction(id: string) {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(`${backendUrl}${PARCEIROS_BASE}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  await getJsonOrThrow(res, "Erro ao excluir parceiro");
  revalidatePath("/app/parceiros");
}
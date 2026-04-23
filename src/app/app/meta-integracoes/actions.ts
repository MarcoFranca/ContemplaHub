"use server";

import { revalidatePath } from "next/cache";

import { getBackendAuthContext } from "@/lib/backend-auth";
import type {
  MetaIntegration,
  MetaWebhookEvent,
} from "@/features/meta-integracoes/types";

const BASE = "/meta/integrations";

async function getJsonOrThrow<T>(
  res: Response,
  fallbackMessage: string,
): Promise<T> {
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

export async function listMetaIntegrationsAction(): Promise<MetaIntegration[]> {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(`${backendUrl}${BASE}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  return getJsonOrThrow<MetaIntegration[]>(
    res,
    "Erro ao listar integrações Meta",
  );
}

export async function createMetaIntegrationAction(payload: unknown) {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(`${backendUrl}${BASE}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  await getJsonOrThrow(res, "Erro ao criar integração Meta");
  revalidatePath("/app/meta-integracoes");
}

export async function updateMetaIntegrationAction(
  integrationId: string,
  payload: unknown,
) {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(`${backendUrl}${BASE}/${integrationId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  await getJsonOrThrow(res, "Erro ao atualizar integração Meta");
  revalidatePath("/app/meta-integracoes");
  revalidatePath(`/app/meta-integracoes/${integrationId}`);
}

export async function listMetaIntegrationEventsAction(
  integrationId: string,
): Promise<MetaWebhookEvent[]> {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(`${backendUrl}${BASE}/${integrationId}/events`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  return getJsonOrThrow<MetaWebhookEvent[]>(
    res,
    "Erro ao listar eventos da integração Meta",
  );
}

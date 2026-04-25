"use server";

import { revalidatePath } from "next/cache";

import { getBackendAuthContext } from "@/lib/backend-auth";
import type {
  MetaConnectionTest,
  MetaIntegration,
  MetaPage,
  MetaPageForm,
  MetaSubscriptionStatus,
  MetaWebhookEvent,
} from "@/features/meta-integracoes/types";

const BASE = "/meta/integrations";

export type MetaOperationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

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

export async function setMetaIntegrationActiveAction(
  integrationId: string,
  ativo: boolean,
): Promise<MetaOperationResult<MetaIntegration>> {
  try {
    const { backendUrl, token } = await getBackendAuthContext();

    const res = await fetch(`${backendUrl}${BASE}/${integrationId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ativo }),
    });

    const data = await getJsonOrThrow<MetaIntegration>(
      res,
      ativo ? "Erro ao ativar integração Meta" : "Erro ao desativar integração Meta",
    );
    revalidatePath("/app/meta-integracoes");
    revalidatePath(`/app/meta-integracoes/${integrationId}`);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : ativo
            ? "Erro ao ativar integração Meta"
            : "Erro ao desativar integração Meta",
    };
  }
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

export async function subscribeMetaIntegrationPageAction(
  integrationId: string,
): Promise<MetaOperationResult<MetaSubscriptionStatus>> {
  try {
    const { backendUrl, token } = await getBackendAuthContext();

    const res = await fetch(`${backendUrl}${BASE}/${integrationId}/subscribe-page`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await getJsonOrThrow<MetaSubscriptionStatus>(
      res,
      "Erro ao inscrever página da Meta",
    );
    revalidatePath("/app/meta-integracoes");
    revalidatePath(`/app/meta-integracoes/${integrationId}`);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao inscrever página da Meta",
    };
  }
}

export async function getMetaIntegrationSubscriptionStatusAction(
  integrationId: string,
): Promise<MetaOperationResult<MetaSubscriptionStatus>> {
  try {
    const { backendUrl, token } = await getBackendAuthContext();

    const res = await fetch(
      `${backendUrl}${BASE}/${integrationId}/subscription-status`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    const data = await getJsonOrThrow<MetaSubscriptionStatus>(
      res,
      "Erro ao verificar assinatura da página",
    );
    revalidatePath("/app/meta-integracoes");
    revalidatePath(`/app/meta-integracoes/${integrationId}`);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao verificar assinatura da página",
    };
  }
}

export async function listMetaIntegrationFormsAction(
  integrationId: string,
): Promise<MetaPageForm[]> {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(`${backendUrl}${BASE}/${integrationId}/forms`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  return getJsonOrThrow<MetaPageForm[]>(res, "Erro ao listar formulários da Meta");
}

export async function testMetaIntegrationConnectionAction(
  integrationId: string,
): Promise<MetaOperationResult<MetaConnectionTest>> {
  try {
    const { backendUrl, token } = await getBackendAuthContext();

    const res = await fetch(`${backendUrl}${BASE}/${integrationId}/test-connection`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await getJsonOrThrow<MetaConnectionTest>(
      res,
      "Erro ao testar conexão com a Meta",
    );
    revalidatePath("/app/meta-integracoes");
    revalidatePath(`/app/meta-integracoes/${integrationId}`);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao testar conexão com a Meta",
    };
  }
}

export async function getMetaOAuthStartUrlAction(): Promise<string> {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(`${backendUrl}/meta/oauth/start`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await getJsonOrThrow<{ auth_url: string }>(
    res,
    "Erro ao iniciar conexão OAuth da Meta",
  );
  return data.auth_url;
}

export async function listMetaOAuthPagesAction(): Promise<MetaPage[]> {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(`${backendUrl}/meta/pages`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  return getJsonOrThrow<MetaPage[]>(res, "Erro ao listar páginas autorizadas da Meta");
}

export async function listMetaOAuthPageFormsAction(
  pageId: string,
): Promise<MetaPageForm[]> {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(`${backendUrl}/meta/pages/${pageId}/forms`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  return getJsonOrThrow<MetaPageForm[]>(
    res,
    "Erro ao listar formulários autorizados da Meta",
  );
}

export async function finalizeMetaOAuthIntegrationAction(payload: {
  nome: string;
  source_label: string;
  page_id: string;
  form_id?: string | null;
  default_owner_id?: string | null;
  ativo?: boolean;
}): Promise<MetaIntegration> {
  const { backendUrl, token } = await getBackendAuthContext();

  const res = await fetch(`${backendUrl}${BASE}/from-oauth`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await getJsonOrThrow<MetaIntegration>(
    res,
    "Erro ao finalizar integração Meta via OAuth",
  );
  revalidatePath("/app/meta-integracoes");
  revalidatePath(`/app/meta-integracoes/${data.id}`);
  return data;
}

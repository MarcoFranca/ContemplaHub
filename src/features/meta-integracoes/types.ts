export type MetaIntegration = {
  id: string;
  org_id: string;
  nome: string;
  provider: string;
  page_id: string;
  page_name?: string | null;
  form_id?: string | null;
  form_name?: string | null;
  source_label: string;
  channel: string;
  default_owner_id?: string | null;
  ativo: boolean;
  last_webhook_at?: string | null;
  last_success_at?: string | null;
  last_error_at?: string | null;
  last_error_message?: string | null;
  webhook_configured: boolean;
  access_token_configured: boolean;
  page_subscribed?: boolean | null;
  subscription_checked_at?: string | null;
  subscription_error?: string | null;
  connection_ok?: boolean | null;
  connection_checked_at?: string | null;
  connection_error?: string | null;
  settings: Record<string, unknown>;
  created_at?: string | null;
  updated_at?: string | null;
};

export type MetaWebhookEvent = {
  id: string;
  org_id?: string | null;
  integration_id?: string | null;
  provider: string;
  event_id?: string | null;
  page_id?: string | null;
  form_id?: string | null;
  leadgen_id?: string | null;
  event_type: string;
  status: string;
  error_message?: string | null;
  payload: Record<string, unknown>;
  processed_at?: string | null;
  created_at?: string | null;
};

export type MetaOwnerOption = {
  id: string;
  nome: string;
  email?: string | null;
};

export type MetaSubscriptionStatus = {
  ok: boolean;
  integration_id: string;
  page_id: string;
  page_name?: string | null;
  subscribed: boolean;
  checked_at: string;
  app_id?: string | null;
  raw: Record<string, unknown>;
};

export type MetaConnectionTest = {
  ok: boolean;
  integration_id: string;
  page_id: string;
  page_name?: string | null;
  checked_at: string;
  raw: Record<string, unknown>;
};

export type MetaDeleteIntegrationResult = {
  ok: boolean;
  integration_id: string;
  page_id: string;
  unsubscribed: boolean;
  deleted_at: string;
  detail?: string | null;
};

export type MetaPageForm = {
  id: string;
  name?: string | null;
  status?: string | null;
};

export type MetaPage = {
  id: string;
  name?: string | null;
  category?: string | null;
};

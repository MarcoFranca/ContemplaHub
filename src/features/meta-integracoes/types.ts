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

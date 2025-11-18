# ContemplaHub — Autentika Seguros
[![Built with Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-🚀-009688)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3ECF8E)](https://supabase.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-6C5CE7)](https://orm.drizzle.team/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **“Planeje hoje, conquiste sempre.”** — O propósito da Autentika não é vender consórcio, é **construir liberdade com método**. Cada linha de código, cada atendimento e cada automação deve refletir isso.

---

## 🧱 Banco & RLS Avançado

Esta seção descreve a modelagem multi-tenant do ContemplaHub, usando **Supabase (Postgres + RLS)** e **Drizzle ORM** para tipagem e migrations.

### 🔐 Princípios
- Isolamento por organização (`org_id`): cada corretora visualiza apenas seus dados.
- Acesso seguro via JWT claims (`auth.org_id()` e `auth.uid()`).
- Funções SECURITY DEFINER para ações administrativas.
- Views derivadas para relatórios e dashboards com junções e cálculos de SLA.
- Rastreabilidade total: todas as alterações logadas (`log_lead`, `log_job`, `log_consentimento`).

---

### ⚙️ Funções auxiliares
```sql
create or replace function auth.org_id()
returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb->>'org_id','')::uuid
$$;

create or replace function auth.uid()
returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub','')::uuid
$$;

create or replace function app_is_manager()
returns boolean language sql stable as $$
  select coalesce((current_setting('request.jwt.claims', true)::jsonb->>'role') = 'manager', false)
$$;
```

---

### 🧩 Políticas RLS
#### Leads
```sql
alter table leads enable row level security;

create policy "Leitura restrita ao org_id" 
  on leads for select using (org_id = auth.org_id());

create policy "Inserção restrita ao org_id" 
  on leads for insert with check (org_id = auth.org_id());

create policy "Atualização restrita" 
  on leads for update using (org_id = auth.org_id());

create policy "Gestores podem excluir"
  on leads for delete using (app_is_manager() and org_id = auth.org_id());
```

#### Simulações
```sql
alter table simulacoes enable row level security;
create policy "Simulações visíveis apenas ao org" 
  on simulacoes for select using (org_id = auth.org_id());
create policy "Inserção segura" 
  on simulacoes for insert with check (org_id = auth.org_id());
```

#### Cotas e Outbox
```sql
alter table cotas enable row level security;
create policy "Cotas por organização" on cotas for all using (org_id = auth.org_id());

alter table event_outbox enable row level security;
create policy "Event outbox por org" on event_outbox for all using (org_id = auth.org_id());
```

---

### 🧱 Views Derivadas
#### lead_view
```sql
create or replace view lead_view as
select l.id as lead_id, l.org_id, l.nome, l.telefone, l.email,
       l.valor_carta, l.prazo, l.etapa,
       s.id as simulacao_id, s.tipo,
       s.resultado->>'lance_min' as lance_min,
       s.resultado->>'lance_max' as lance_max,
       s.resultado->>'confianca' as confianca,
       (now() - l.created_at) as tempo_desde_captura
from leads l
left join simulacoes s on s.lead_id = l.id;
```

#### simulacao_view
```sql
create or replace view simulacao_view as
select s.id, s.org_id, s.tipo, s.valor_carta, s.prazo,
       s.resultado->>'confianca' as confianca,
       s.resultado->>'lance_min' as lance_min,
       s.resultado->>'lance_max' as lance_max,
       l.perfil_psico, c.administradora, c.grupo
from simulacoes s
left join leads l on l.id = s.lead_id
left join cotas c on c.org_id = s.org_id;
```

---

### 💾 Drizzle ORM — Schema equivalente
```ts
import { pgTable, uuid, text, numeric, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  nome: text("nome"),
  telefone: text("telefone"),
  email: text("email"),
  origem: text("origem"),
  perfilPsico: text("perfil_psico"),
  valorCarta: numeric("valor_carta"),
  prazo: numeric("prazo"),
  consentimento: boolean("consentimento"),
  etapa: text("etapa").default("novo"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

### 🌱 Seeds de Exemplo
```sql
insert into orgs (id, nome) values 
  ('11111111-1111-1111-1111-111111111111', 'Autentika Seguros');

insert into profiles (id, org_id, nome, role) values
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Marco França', 'manager');

insert into leads (org_id, nome, telefone, email, valor_carta, prazo)
values ('11111111-1111-1111-1111-111111111111', 'João da Silva', '+55 21 99999-8888', 'joao@example.com', 300000, 120);
```

---

### 🔍 Performance
```sql
create index if not exists idx_leads_org on leads(org_id);
create index if not exists idx_simulacoes_org on simulacoes(org_id);
create index if not exists idx_event_outbox_status on event_outbox(status);
```

---

## ✅ Conclusão
Com este modelo, o ContemplaHub garante **segurança multi-tenant**, **auditoria completa** e **compatibilidade total com Drizzle ORM**, mantendo a performance ideal para CRM, IA e automações.

MIT © Autentika Seguros — 2025

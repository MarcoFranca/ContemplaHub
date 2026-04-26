-- 1) Adiciona a coluna como NULLABLE
ALTER TABLE public.orgs
ADD COLUMN IF NOT EXISTS owner_user_id uuid;

-- 2) Backfill: tenta escolher como dono:
--    a) o primeiro ADMIN da org; se não houver,
--    b) o primeiro profile da org (qualquer role).
WITH pick_owner AS (
  SELECT
    o.id AS org_id,
    (
      SELECT p.user_id
      FROM public.profiles p
      WHERE p.org_id = o.id AND p.role = 'admin'
      ORDER BY p.created_at ASC
      LIMIT 1
    ) AS admin_id,
    (
      SELECT p2.user_id
      FROM public.profiles p2
      WHERE p2.org_id = o.id
      ORDER BY p2.created_at ASC
      LIMIT 1
    ) AS any_id
  FROM public.orgs o
)
UPDATE public.orgs o
SET owner_user_id = COALESCE(p.admin_id, p.any_id)
FROM pick_owner p
WHERE o.id = p.org_id
  AND o.owner_user_id IS NULL;

-- 3) (Opcional mas recomendado) Vincula FK ao profiles.user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orgs_owner_user_id_fkey'
  ) THEN
    ALTER TABLE public.orgs
    ADD CONSTRAINT orgs_owner_user_id_fkey
      FOREIGN KEY (owner_user_id)
      REFERENCES public.profiles (user_id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
  END IF;
END
$$;

-- 4) Se TODAS as orgs ficaram com owner_user_id, torna NOT NULL.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.orgs WHERE owner_user_id IS NULL
  ) THEN
    ALTER TABLE public.orgs
      ALTER COLUMN owner_user_id SET NOT NULL;
  ELSE
    RAISE NOTICE 'Existem orgs sem profiles (owner_user_id ficou NULL). Quando criar um profile para elas, rode: ALTER TABLE public.orgs ALTER COLUMN owner_user_id SET NOT NULL;';
  END IF;
END
$$;

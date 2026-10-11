-- Fix duplicate email accounts (case-insensitive) and enforce case-insensitive uniqueness.
-- Run this in pgAdmin query tool against your marketplace database.

BEGIN;

-- 1) Normalize existing emails first.
UPDATE "Users"
SET "Email" = lower(trim("Email"))
WHERE "Email" IS NOT NULL;

-- 2) For duplicate emails, keep the first account and mutate later duplicates safely.
--    This avoids FK breakage because we do not delete user rows.
WITH ranked AS (
    SELECT
        "Id",
        "Email",
        row_number() OVER (
            PARTITION BY lower(trim("Email"))
            ORDER BY "CreatedAtUtc" NULLS LAST, "Id"
        ) AS rn
    FROM "Users"
), dupes AS (
    SELECT
        r."Id",
        split_part(r."Email", '@', 1) AS local_part,
        split_part(r."Email", '@', 2) AS domain_part
    FROM ranked r
    WHERE r.rn > 1
)
UPDATE "Users" u
SET
    "Email" = d.local_part || '+dup-' || left(replace(u."Id"::text, '-', ''), 8) || '@' || d.domain_part,
    "IsActive" = FALSE
FROM dupes d
WHERE u."Id" = d."Id";

-- 3) Replace case-sensitive unique index with case-insensitive unique index.
DROP INDEX IF EXISTS "IX_Users_Email";
CREATE UNIQUE INDEX IF NOT EXISTS "UX_Users_Email_Lower"
ON "Users" (lower("Email"));

COMMIT;

-- 4) Verify duplicates are gone (should return 0 rows).
-- SELECT lower(trim("Email")) AS normalized_email, count(*)
-- FROM "Users"
-- GROUP BY lower(trim("Email"))
-- HAVING count(*) > 1;

#!/usr/bin/env bash
# Apply all migrations and run the pgTAP suite on a throwaway local PostgreSQL.
# Usage: scripts/db-local/run.sh [--types]   (needs PostgreSQL 15+ binaries and pgTAP)
#   --types  also regenerates src/lib/supabase/database.types.ts
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PG_BIN="${PG_BIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
WORK="$(mktemp -d)"
PORT="${PGPORT_LOCAL:-54329}"
export PGHOST="$WORK" PGPORT="$PORT" PGUSER=postgres PGDATABASE=postgres

cleanup() { "$PG_BIN/pg_ctl" -D "$WORK/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT

if [ "$(id -u)" = "0" ]; then
  chown -R postgres "$WORK"
  RUN_AS=(runuser -u postgres --)
else
  RUN_AS=()
fi

"${RUN_AS[@]}" "$PG_BIN/initdb" -D "$WORK/data" -U postgres --auth=trust -E UTF8 --locale=C.UTF-8 >/dev/null
"${RUN_AS[@]}" "$PG_BIN/pg_ctl" -D "$WORK/data" -o "-k $WORK -p $PORT -c listen_addresses=''" -l "$WORK/log" start >/dev/null

PSQL=(psql -X -q -v ON_ERROR_STOP=1)
"${PSQL[@]}" -f "$ROOT/scripts/db-local/supabase-stub.sql" >/dev/null
"${PSQL[@]}" -c "alter database postgres set search_path = \"\$user\", public, extensions" >/dev/null

for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "migrate  $(basename "$f")"
  "${PSQL[@]}" -f "$f" >/dev/null
done

if [ "${1:-}" = "--types" ]; then
  "${PSQL[@]}" -t -A -c "select coalesce(json_agg(c order by c.table_name, c.ordinal_position), '[]') from (
    select c.table_name, c.column_name, c.udt_name, c.is_nullable, c.ordinal_position,
           c.column_default is not null as has_default, c.is_generated, c.is_identity, c.identity_generation
    from information_schema.columns c
    join information_schema.tables t on t.table_schema = c.table_schema and t.table_name = c.table_name
    where c.table_schema = 'public' and t.table_type = 'BASE TABLE') c" > "$WORK/columns.json"
  # Functions callable by signed-in people (supabase.rpc), with their IN arguments and
  # their result: a set of rows (RETURNS TABLE) or a single scalar. Arguments with a default are optional.
  "${PSQL[@]}" -t -A -c "select coalesce(json_agg(f order by f.name), '[]') from (
    select p.proname as name,
      coalesce((select json_agg(json_build_object('name', a.n, 'type', ty.typname,
          'optional', a.ord > p.pronargs - p.pronargdefaults) order by a.ord)
        from unnest(p.proargnames, coalesce(p.proallargtypes, p.proargtypes::oid[])) with ordinality a(n, t, ord)
        join pg_type ty on ty.oid = a.t
        where coalesce(p.proargmodes[a.ord], 'i') = 'i'), '[]') as args,
      coalesce((select json_agg(json_build_object('name', a.n, 'type', ty.typname) order by a.ord)
        from unnest(p.proargnames, coalesce(p.proallargtypes, p.proargtypes::oid[])) with ordinality a(n, t, ord)
        join pg_type ty on ty.oid = a.t
        where p.proargmodes[a.ord] in ('o', 't')), '[]') as columns,
      rt.typname as returns, p.proretset as returns_set
    from pg_proc p
    join pg_namespace ns on ns.oid = p.pronamespace
    join pg_type rt on rt.oid = p.prorettype
    where ns.nspname = 'public' and p.prokind = 'f'
      and has_function_privilege('authenticated', p.oid, 'execute')
      and rt.typname <> 'trigger') f" > "$WORK/functions.json"
  node "$ROOT/scripts/db-local/gen-types.mjs" "$WORK/columns.json" "$ROOT/src/lib/supabase/database.types.ts" "$WORK/functions.json"
fi

status=0
for t in "$ROOT"/supabase/tests/database/*.sql; do
  out="$("${PSQL[@]}" -t -A -f "$t" 2>&1)" || { echo "$out"; status=1; continue; }
  failed="$(grep -c '^not ok' <<<"$out" || true)"
  passed="$(grep -c '^ok' <<<"$out" || true)"
  echo "test     $(basename "$t"): $passed passed, $failed failed"
  if [ "$failed" != "0" ] || grep -q 'Looks like' <<<"$out"; then
    grep -E '^not ok|^#' <<<"$out"
    status=1
  fi
done
exit $status

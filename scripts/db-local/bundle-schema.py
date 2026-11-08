#!/usr/bin/env python3
"""Bundle supabase/migrations into one SQL script for the Supabase SQL Editor.

The script also records each migration in supabase_migrations.schema_migrations,
so a later `supabase db push` treats them as applied. Run it once on a fresh project:

    python3 scripts/db-local/bundle-schema.py > elan-schema.sql
"""
import glob
import os
import sys

root = os.path.join(os.path.dirname(__file__), '..', '..')
files = sorted(glob.glob(os.path.join(root, 'supabase', 'migrations', '*.sql')))
tag = '$elan_migration$'
out = [
    '-- Élan: full schema for Supabase > SQL Editor > New query > Run. Run once.',
    'begin;',
    'create schema if not exists supabase_migrations;',
    'create table if not exists supabase_migrations.schema_migrations '
    '(version text primary key, statements text[], name text);',
    '',
]
for path in files:
    base = os.path.basename(path)[:-4]
    version, name = base.split('_', 1)
    sql = open(path, encoding='utf-8').read()
    out += [
        f'-- ===== {base} =====',
        sql.rstrip(),
        'insert into supabase_migrations.schema_migrations (version, name, statements) '
        f"values ('{version}', '{name}', array[{tag}{sql}{tag}]);",
        '',
    ]
out.append('commit;')
sys.stdout.write('\n'.join(out) + '\n')

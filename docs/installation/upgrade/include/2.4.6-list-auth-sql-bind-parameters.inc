 * Auth SQL queries ([[setting,passdb_sql_query]],
   [[setting,userdb_sql_query]] and [[setting,userdb_sql_iterate_query]]) now
   pass `%{variable}` values to the database as bind parameters instead of
   expanding them into the query text. Queries that relied on the old text
   expansion fail at lookup time with an error:
    * A `%{variable}` must produce a whole value on its own. Wrapping a single
      variable in single quotes still works (`'%{user}'`), but combining it
      with other text does not: `'%{user | username}@example.com'` and
      `'%{user}%'` must be rewritten with the var-expand `concat` filter,
      e.g. `%{user | username | concat('@example.com')}` and
      `%{user | concat('%')}`.
    * A backslash is no longer allowed inside a single-quoted string. Escape
      a quote as `''`, not `\'`.
    * SQL comments (`--`, `/*`, `//` and `#`) are no longer allowed outside a
      quoted string, and neither is PostgreSQL dollar quoting (`$$...$$`) or
      a positional parameter (`$1`, `$2`, ...).
    * A literal `?` outside a quoted string can no longer appear in the
      query. This affects PostgreSQL's jsonb `?`, `?|` and `?&` operators.
 * Logged queries no longer show the `%{password}` value unless
   [[setting,auth_debug_passwords,yes]] is set.

See [[link,auth_sql_variables]] for details.

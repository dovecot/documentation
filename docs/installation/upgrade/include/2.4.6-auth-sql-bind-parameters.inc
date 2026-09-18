 * Auth SQL queries ([[setting,passdb_sql_query]],
   [[setting,userdb_sql_query]] and [[setting,userdb_sql_iterate_query]]) now
   pass `%{variable}` values to the database as bind parameters instead of
   expanding them into the query text. Queries that relied on the old text
   expansion are rejected with a configuration error:
    * A `%{variable}` must produce a whole value on its own. Wrapping a single
      variable in quotes still works (`'%{user}'`), but combining it with
      other text does not: `'%{user}@%{domain}'` and `'%{user}%'` must be
      rewritten with the database's own concatenation, e.g.
      `CONCAT(%{user}, '@', %{domain})` and `CONCAT(%{user}, '%')`.
    * SQL comments (`--`, `/*`, `//` and `#`) are no longer allowed outside a
      quoted string, and neither is PostgreSQL dollar quoting (`$$...$$`).
    * A literal `?` can no longer appear in the query, since it cannot be
      told apart from a bind parameter. This affects PostgreSQL's jsonb `?`,
      `?|` and `?&` operators.

::: warning
Dovecot 2.3.x settings will NOT work unless the configuration is changed
as described in this section.
:::

#### Required Settings
 
The first setting in `dovecot.conf` **MUST** now be
[[setting,dovecot_config_version]]. This helps to avoid unexpected
configuration changes in the future.
 
Another new required setting is [[setting,dovecot_storage_version]]. This helps
to avoid unexpected storage file format incompatibilities.

Note that the configuration syntax has been changed, and your old configuration **will not** work
without changes.

#### Configuration Redesign

See [[link,settings_syntax]] for the new configuration syntax. This is similar
to v2.3, but different in some ways. Especially the configuration is no longer
hierarchical - all settings are global settings and can be used anywhere
(although they might not actually do anything there). Settings can be inside
various filters to specify where they are wanted to be used.

To avoid repetition in setting name prefixes, they are automatically attempted
to be prefixed to their parent filter names. For example these are equivalent
for the [[setting,passdb_sql_query]] setting inside the [[setting,passdb]]
filter:

```
passdb sql {
  passdb_sql_query = SELECT ...
}
passdb sql {
  sql_query = SELECT ...
}
passdb sql {
  query = SELECT ...
}
passdb sql2 {
  # This will NOT work, as it expands to nonexistent passdb_sql2_query:
  #query = SELECT ...
}
```
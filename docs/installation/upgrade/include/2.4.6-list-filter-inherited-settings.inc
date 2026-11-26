 * Some settings can now be used only where they have an effect. Using one
   inside a filter that doesn't use it is a configuration error instead of
   being silently ignored. For example [[setting,quota_mail_size]] applies to
   the user rather than to a quota root, so it can't be used inside
   `quota { .. }`.
 * The global `default_*` settings and [[setting,protocols]] can be used only
   globally. Setting a `default_*` inside `service { .. }` used to change that
   service's derived settings, because their defaults expand
   `$SET:default_internal_user` and similar within the filter. Use the
   per-service setting instead, e.g. [[setting,service_user]] rather than
   `service foo { default_internal_user = .. }`. Referring to the global
   settings with `$SET:` inside a filter keeps working.

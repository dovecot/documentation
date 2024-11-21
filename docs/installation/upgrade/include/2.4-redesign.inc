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

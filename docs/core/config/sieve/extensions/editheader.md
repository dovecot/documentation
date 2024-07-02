---
layout: doc
title: Editheader
dovecotlinks:
  sieve_editheader: Sieve editheader extension
---

# Sieve: Editheader Extension

The editheader extension ([[rfc,5293]]) enables Sieve
scripts to delete and add message header fields, thereby allowing
interaction with other components that consume or produce header fields.

## Configuration

The editheader extension is not available by default and needs to be
enabled explicitly by adding it to [[setting,sieve_extensions]].

### Settings

::: warning
Invalid values for these settings will make the Sieve interpreter
log a warning and revert to the default values.
:::

<SettingsComponent tag="sieve-editheader" level="3" />

### Example

```
plugin {
  # Use editheader
  sieve_extensions = +editheader

  # Header fields must not exceed one kilobyte
  sieve_editheader_max_header_size = 1k

  # Protected special headers
  sieve_editheader_forbid_add = X-Verified
  sieve_editheader_forbid_delete = X-Verified X-Seen
}
```

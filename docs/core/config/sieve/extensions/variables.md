---
doc: layout
title: Variables
dovecotlinks:
  sieve_variables: Sieve variables extension
---

# Sieve: Variables Extension

The Sieve variables extension ([[rfc,5229]]) adds the concept of
variables to the Sieve language.

## Configuration

The variables extension is available by default.

### Settings

<SettingsComponent tag="sieve-variables" level="3" />

## Sieve Example

```sieve
require ["variables", "header", "fileinto"];

if header :matches "Subject" "*" {
  set "subject" "${1}";
}

if string :contains "${subject}" "report" {
  fileinto "Reports";
}
```

This example extracts the Subject header into a variable and files matching
messages into a folder based on its contents.

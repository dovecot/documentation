---
layout: doc
title: Include
dovecotlinks:
  sieve_include: Sieve include extension
---

# Sieve: Include Extension

The Sieve include extension ([[rfc,6609]]) permits users to include
one Sieve script into another. This can make managing large scripts or
multiple sets of scripts much easier, and allows a site and its users to
build up libraries of scripts. Users are able to include their own
personal scripts or site-wide scripts.

Included scripts can include more scripts of their own, yielding a tree
of included scripts with the main script (typically the user's personal
script) at its root.

## Configuration

The include extension is available by default.

### Settings

<SettingsComponent tag="sieve-include" level="3" />

---
layout: doc
title: charset-alias
---

# Charset Alias (charset-alias) Plugin

This plugin allows treating the specified source charset as a different
charset when decoding to UTF-8.

Example: when decoding from shift_jis to UTF-8, using cp932 (or sjis-win)
instead of shift_jis may be preferable to handle Microsoft extended chars
properly.

## Settings

<SettingsComponent plugin="charset-alias" />

## Sample Configuration

```[dovecot.conf]
mail_plugins = $mail_plugins charset_alias

plugin {
  charset_aliases = shift_jis=sjis-win euc-jp=eucjp-win iso-2022-jp=iso-2022-j
p-3
}

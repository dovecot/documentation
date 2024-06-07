---
layout: doc
title: BSD
dovecotlinks:
  auth_bsd: BSD authentication database
---

# BSDAuth (`bsdauth`)

::: warning
BSDAuth is deprecated.

It will be maintained on a best-effort basis for Dovecot CE, based on
community patches.

Users are strongly advised to use [[link,auth_pam]] instead.
:::

This is similar to [[link,auth_pam]], but used by OpenBSD.

It supports `cache_key` parameter the same way as PAM.


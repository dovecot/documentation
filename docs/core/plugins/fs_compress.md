---
layout: doc
title: fs-compress
dovecotlinks:
  fs_compress:
    hash: compression-fs-compress-plugin
    text: "Compression Plugin: fs-compress"
---

# Compression Plugin (`fs-compress`)

`fs-compress` plugin is used to wrap other data streams in a compression layer.

It can be used by any of the settings using the [[link,fs,FS backends]].

The exact location where to set it in the FS backend hierarchy depends on what
other FS backends are being used.

The important rules are:

* Must be set before the final storage driver (`s3`, `sproxyd`, ...)
* Should be set after `fscache` (you generally don't want `fscache` to be
  compressed for performance reasons).
* Must be set before [[link,mail_crypt_fs_crypt,fs_crypt]], because encrypted
  data compresses poorly.

## Settings

<SettingsComponent tag="fs-compress" />

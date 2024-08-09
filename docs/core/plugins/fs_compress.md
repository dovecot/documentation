---
layout: doc
title: fs-compress
dovecotlinks:
  fs_compress:
    hash: compression-fs-compress-plugin
    text: "Compression Plugin: fs-compress"
---

# Compression Plugin (`fs-compress`)

fs-compress plugin is used to wrap other data streams in a compression layer.

It can be used by any of the settings using the FS drivers.

The exact location where to set it in the FS driver string depends on what
other FS drivers are being used.

The important rules are:

* Must be set before the final storage driver (s3, sproxyd, ...)
* Should be set after fscache (you generally don't want fscache to be
  compressed for performance reasons).
* Must be set before [[link,fs_crypt_and_fs_mail_crypt,fs_crypt]], because
  encrypted data compresses poorly.

## Settings

There are no `dovecot.conf` settings for this plugin.

## Configuration Format

The fs-compress configuration format is:

```
compress:<compress_save>:<compress_save_level>
```

See [[setting,mail_compress_save]] for information on available compression
algorithms.

See [[setting,mail_compress_save_level]]` for information on compression
levels and defaults.

### Optional Compression

By default, fs-compress requires that the mail is compressed with the
specified algorithm.

To allow adding compression to existing storages without compression, you can
use the `maybe-` prefix in front of the algorithm.

Example:

```
compress:maybe-gz:6
```

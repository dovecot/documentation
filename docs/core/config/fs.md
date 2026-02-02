---
layout: doc
title: Dovecot Filesystems
dovecotlinks:
  fs: Dovecot Filesystems
  fs_wrappers: Dovecot Filesystem Wrappers
  fs_posix:
    hash: posix-filesystem
    text: "fs: POSIX Filesystem"
  fs_dict:
    hash: dictionary-filesystem
    text: "fs: Dictionary Filesystem"
  fs_metawrap:
    hash: metawrap-filesystem
    text: "fs: Metawrap Filesystem"
---

# Dovecot Filesystems

Dovecot's `lib-fs` is a simplified API to access filesystems and databases that
can be made to look similar to filesystems. It is similar to [[link,dict]] but
generally where [[link,dict]] is generally used for small data `fs` is used for
larger data.

Currently supported FS drivers are:

| Name | Description |
| --- | --- |
| [[link,fs_posix,posix]] | POSIX filesystem. |
| [[link,fs_dict,dict]] | Dictionary (`lib-dict` wrapper). |
<!-- @include: @docs/storage/providers/includes/fs.inc -->


## Dovecot Filesystem Wrappers

Wrapper drivers used on top of other drivers:

| Name | Description |
| --- | --- |
| [[link,fs_metawrap,metawrap]] | File metadata. |
| [[link,mail_crypt,crypt]] | File encryption. |
| [[link,fs_compress,compress]] | File compression. |
<!-- @include: @docs/storage/providers/includes/fs-wrapper.inc -->

When using fs drivers, place the fs wrappers first in the configuration
and the primary fs driver as the last one.

### Examples
Enable [[link,fs_metawrap,metawrap]] to support storing metadata with
[[link,fs_posix,posix]] by configuring the `fs metawrap {}` block before the
`fs posix {}` block:

Example:
```
fs metawrap {
}
fs posix {
}
```

It is also possible to use multiple fs wrappers on top of each other like this:

Example:
```
fs metawrap {
}
fs compress {
}
fs posix {
}
```

## FS Settings

<SettingsComponent tag="fs" />

## POSIX Filesystem

Regular POSIX filesystem. It can also be used with [[link,nfs]]. It doesn't
support file metadata, in case you have a need for that use
[[link,fs_metawrap]].

### Settings

<SettingsComponent tag="fs-posix" />

## Dictionary Filesystem

This is a wrapper for `lib-dict` for using [[link,dict]] drivers as `fs`
drivers.

### Settings

<SettingsComponent tag="fs-dict" />

## Metawrap Filesystem

This is a wrapper for other `fs` drivers that don't support metadata. The
metadata is implemented by placing them into the beginning of the file content.

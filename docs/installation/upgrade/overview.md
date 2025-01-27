---
layout: doc
title: Overview
order: 1
---

# Upgrading Dovecot

The [NEWS](https://github.com/dovecot/core/blob/main/NEWS) file, contained in
the top-level of the source, contains all the important changes between
releases. These changes are marked with `*` character.

Read them to see if there is anything that concerns you.

In general all the changes try to preserve backwards compatibility, but some
changes which are meant to improve the stability and correctness of the
configuration could mean breaking some existing installations. That may be a
good thing, since it can expose problems which could otherwise show up as
random errors.

## File Formats

Since v2.4.0 release, upgrading won't silently change configuration
(defaults). Either the old configuration is preserved, or startup fails
asking you to upgrade the configuration file. The defaults are changed only
when [[setting,dovecot_config_version]] setting is changed.

Similarly since v2.4.0 release, upgrading won't do any backwards incompatible
changes to storage files. If the release no longer supports an old storage
file format, the startup fails instead. The new file formats are used only when
[[setting,dovecot_storage_version]] setting is changed.

## Dovecot CE 2.3 and later

 * [[link,upgrading-2.2-to-2.3]]
 * [[link,upgrading-2.3-to-2.3]]
 * [[link,upgrading-2.3-to-2.4]]

## Dovecot CE 2.2 and earlier

See https://doc.dovecot.org/installation_guide/upgrading/.
